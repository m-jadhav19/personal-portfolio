import { createDestroyAudio } from "./audio";
import {
  PLAYER_MAX_HP,
  drawPickup,
  drawPixelEnemy,
  spawnEnemyAtEdge,
  spawnPickupRandom,
  steerEnemyToward,
  type Enemy,
  type Pickup,
} from "./combat";
import {
  loadDestroySpriteAtlas,
  type DestroySpriteAtlas,
} from "./spriteAtlas";
import {
  createTargetRegistry,
  type TargetRegistry,
} from "./targets";
import {
  createBulletHole,
  drawBlasterBolt,
  drawBulletHole,
  drawCharacter,
  drawDebris,
  drawExplosion,
  drawRocket,
  drawVortex,
  drawZapArc,
  spawnDebris,
  type BulletHole,
  type DebrisParticle,
} from "./sprites";
import {
  WEAPON_CONFIG,
  WEAPONS,
  clampWeaponIndex,
  cycleWeaponIndex,
  weaponHoleLife,
  type WeaponConfig,
  type WeaponId,
} from "./weapons";

type Vec = { x: number; y: number };

type Projectile =
  | {
      kind: "blaster";
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }
  | {
      kind: "rocket";
      x: number;
      y: number;
      tx: number;
      ty: number;
      life: number;
    }
  | {
      kind: "vortex";
      x: number;
      y: number;
      tx: number;
      ty: number;
      life: number;
      spin: number;
    };

type ZapArc = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  life: number;
  maxLife: number;
};

type Explosion = { x: number; y: number; life: number; maxLife: number };

export type DestroyEngineOptions = {
  canvas: HTMLCanvasElement;
  reducedMotion?: boolean;
  initialMuted?: boolean;
  onWeaponChange?: (index: number, id: WeaponId) => void;
  onShake?: (magnitude: number) => void;
  onHealthChange?: (health: number, maxHealth: number) => void;
  onBuffChange?: (buffs: { shield: number; rapid: number }) => void;
  onDeath?: () => void;
};

export type DestroyEngine = {
  start: () => void;
  stop: () => void;
  setPaused: (paused: boolean) => void;
  isPaused: () => boolean;
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  setWeapon: (index: number) => void;
  getWeaponIndex: () => number;
  getHealth: () => { health: number; maxHealth: number };
  repair: () => void;
  destroy: () => void;
};

const MAX_PARTICLES = 180;
const MAX_ZAPS = 14;
const MAX_HOLES = 160;
const MAX_ENEMIES = 14;
const MAX_PICKUPS = 5;
const CHAR_MARGIN = 28;
const CHAR_HIT_R = 20;

function prefersReducedMotionFlag(explicit?: boolean) {
  if (typeof explicit === "boolean") return explicit;
  if (typeof matchMedia !== "function") return false;
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createDestroyEngine(
  options: DestroyEngineOptions,
): DestroyEngine {
  const canvas = options.canvas;
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) {
    throw new Error("Destroy engine requires a 2D canvas context");
  }
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const reducedMotion = prefersReducedMotionFlag(options.reducedMotion);
  const audio = createDestroyAudio(options.initialMuted ?? false);
  const targets: TargetRegistry = createTargetRegistry();
  const atlas: DestroySpriteAtlas = loadDestroySpriteAtlas();

  let weaponIndex = 0;
  let paused = false;
  let running = false;
  let raf = 0;
  let lastTs = 0;
  let hidden = false;

  const pointer: Vec = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  // Fixed stance — only moves via right-click drag or WASD. Never follows the cursor.
  const character: Vec = {
    x: Math.min(120, window.innerWidth * 0.18),
    y: window.innerHeight * 0.55,
  };
  let facing: 1 | -1 = 1;
  let walkPhase = 0;
  let dragging = false;
  const dragOffset: Vec = { x: 0, y: 0 };
  const moveKeys = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  const MOVE_SPEED = 260;

  const projectiles: Projectile[] = [];
  const zapArcs: ZapArc[] = [];
  const explosions: Explosion[] = [];
  const holes: BulletHole[] = [];
  let particles: DebrisParticle[] = [];
  const enemies: Enemy[] = [];
  const pickups: Pickup[] = [];

  let health = PLAYER_MAX_HP;
  let hurtFlash = 0;
  let hurtIFrames = 0;
  let knockX = 0;
  let knockY = 0;
  let shieldTimer = 0;
  let rapidTimer = 0;
  let enemySpawnTimer = 1.2;
  let pickupSpawnTimer = 5;
  let buffEmitTimer = 0;
  let dead = false;

  function emitHealth() {
    options.onHealthChange?.(health, PLAYER_MAX_HP);
  }

  function emitBuffs() {
    options.onBuffChange?.({ shield: shieldTimer, rapid: rapidTimer });
  }

  function takeDamage(amount: number, fromX: number, fromY: number) {
    if (dead || paused || shieldTimer > 0 || hurtIFrames > 0) return;
    health = Math.max(0, health - amount);
    hurtFlash = 0.45;
    hurtIFrames = 0.55;
    const ang = Math.atan2(character.y - fromY, character.x - fromX);
    knockX = Math.cos(ang) * 10;
    knockY = Math.sin(ang) * 10;
    audio.play("hurt");
    options.onShake?.(0.55);
    emitHealth();
    if (health <= 0) {
      dead = true;
      paused = true;
      options.onDeath?.();
    }
  }

  function heal(amount: number) {
    health = Math.min(PLAYER_MAX_HP, health + amount);
    emitHealth();
  }

  function hurtEnemiesAt(x: number, y: number, radius: number, damage: number) {
    let killed = 0;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (Math.hypot(e.x - x, e.y - y) > radius + e.radius) continue;
      e.hp -= damage;
      e.hitFlash = 0.18;
      if (e.hp <= 0) {
        const bits = spawnDebris(
          { left: e.x - 6, top: e.y - 6, width: 12, height: 12 },
          reducedMotion ? 3 : 8,
          ["#92400e", "#4ade80", "#94a3b8", "#fde047"],
        );
        particles = particles.concat(bits).slice(-MAX_PARTICLES);
        enemies.splice(i, 1);
        killed += 1;
        audio.play("enemy");
        // Chance to drop a pickup on kill
        if (pickups.length < MAX_PICKUPS && Math.random() < 0.18) {
          pickups.push({
            kind: Math.random() < 0.6 ? "health" : Math.random() < 0.5 ? "shield" : "rapid",
            x: e.x,
            y: e.y,
            life: 10,
            bob: 0,
          });
        }
      }
    }
    return killed;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    targets.invalidate();
  }

  function currentWeapon(): WeaponId {
    return WEAPONS[clampWeaponIndex(weaponIndex)];
  }

  function setWeapon(index: number) {
    const next = clampWeaponIndex(index);
    if (next === weaponIndex) {
      options.onWeaponChange?.(weaponIndex, currentWeapon());
      return;
    }
    weaponIndex = next;
    options.onWeaponChange?.(weaponIndex, currentWeapon());
    audio.play("ui");
  }

  function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      target.isContentEditable
    );
  }

  function clampCharacter(x: number, y: number) {
    character.x = Math.min(
      window.innerWidth - CHAR_MARGIN,
      Math.max(CHAR_MARGIN, x),
    );
    character.y = Math.min(
      window.innerHeight - CHAR_MARGIN,
      Math.max(CHAR_MARGIN, y),
    );
  }

  function holeTiming(cfg: WeaponConfig) {
    const lifeScale = reducedMotion ? 0.7 : 1;
    return {
      life: weaponHoleLife(cfg) * lifeScale,
      hold: cfg.holeHold * lifeScale,
      scaleMul: cfg.holeScale,
    };
  }

  function punchHole(
    x: number,
    y: number,
    opts?: {
      scale?: number;
      crack?: boolean;
      silent?: boolean;
      life?: number;
      hold?: number;
    },
  ) {
    holes.push(
      createBulletHole(x, y, {
        scale: opts?.scale,
        crack: opts?.crack,
        life: opts?.life,
        hold: opts?.hold,
      }),
    );
    if (holes.length > MAX_HOLES) {
      holes.splice(0, holes.length - MAX_HOLES);
    }
    if (!opts?.silent) {
      audio.play("hit");
    }
  }

  function scatterHoles(
    x: number,
    y: number,
    radius: number,
    count: number,
    cfg: WeaponConfig,
  ) {
    const timing = holeTiming(cfg);
    const n = reducedMotion ? Math.max(2, Math.floor(count / 2)) : count;
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      punchHole(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, {
        scale: (0.7 + Math.random() * 0.9) * timing.scaleMul,
        crack: true,
        silent: true,
        life: timing.life * (0.85 + Math.random() * 0.25),
        hold: timing.hold,
      });
    }
    audio.play("hit");
  }

  function damageAt(x: number, y: number, radius: number, hits: number) {
    const damaged = targets.applyDamage(x, y, radius, hits);
    const particleBudget = reducedMotion ? 4 : 14;
    for (const d of damaged) {
      const next = spawnDebris(d.box, particleBudget);
      particles = particles.concat(next).slice(-MAX_PARTICLES);
    }
    return damaged.length;
  }

  /** Always leave a hole. Destroy DOM if present; otherwise scar the “surface”. */
  function impactAt(
    x: number,
    y: number,
    cfg: WeaponConfig,
    opts?: { holeScale?: number; radius?: number; hits?: number },
  ) {
    const radius = opts?.radius ?? cfg.radius;
    const hits = opts?.hits ?? cfg.hits;
    const timing = holeTiming(cfg);
    const destroyed = damageAt(x, y, radius, hits);
    const enemyDmg = Math.max(1, hits + (rapidTimer > 0 ? 1 : 0));
    const slain = hurtEnemiesAt(x, y, Math.max(18, radius || 16), enemyDmg);

    punchHole(x, y, {
      scale:
        (opts?.holeScale ?? 0.9 + Math.random() * 0.45) * timing.scaleMul,
      crack: true,
      silent: true,
      life: timing.life,
      hold: timing.hold,
    });

    if (destroyed === 0 && slain === 0) {
      // Empty space — surface crater + sparks
      const sparkCount = reducedMotion ? 4 : 10;
      const crater = Math.max(8, radius * 0.35);
      const sparks = spawnDebris(
        {
          left: x - crater,
          top: y - crater,
          width: crater * 2,
          height: crater * 2,
        },
        sparkCount,
        ["#a1a1aa", "#52525b", "#fde047", "#fdba74"],
      );
      particles = particles.concat(sparks).slice(-MAX_PARTICLES);
      explosions.push({ x, y, life: 0.14, maxLife: 0.14 });
      if (!reducedMotion && Math.random() < 0.55) {
        punchHole(x + (Math.random() * 10 - 5), y + (Math.random() * 10 - 5), {
          scale: (0.45 + Math.random() * 0.3) * timing.scaleMul,
          crack: false,
          silent: true,
          life: timing.life * 0.75,
          hold: timing.hold * 0.7,
        });
      }
    }

    audio.play("hit");
    return destroyed + slain;
  }

  function boom(x: number, y: number, cfg: WeaponConfig) {
    const radius = cfg.radius;
    const hits = cfg.hits;
    explosions.push({ x, y, life: 0.35, maxLife: 0.35 });
    const destroyed = damageAt(x, y, radius, hits);
    hurtEnemiesAt(x, y, radius, Math.max(2, hits));
    scatterHoles(
      x,
      y,
      radius * 0.85,
      Math.max(4, Math.round(radius / 12)),
      cfg,
    );
    // Empty-space blast still scars the surface.
    if (destroyed === 0) {
      const sparks = spawnDebris(
        {
          left: x - radius * 0.3,
          top: y - radius * 0.3,
          width: radius * 0.6,
          height: radius * 0.6,
        },
        reducedMotion ? 8 : 18,
        ["#a1a1aa", "#52525b", "#f97316", "#fde047"],
      );
      particles = particles.concat(sparks).slice(-MAX_PARTICLES);
    }
    audio.play("boom");
    if (!reducedMotion) {
      options.onShake?.(Math.min(1, radius / 100));
    }
  }

  function countKind(kind: Projectile["kind"]) {
    return projectiles.filter((p) => p.kind === kind).length;
  }

  function fire() {
    if (paused || hidden || dragging || dead) return;
    const id = currentWeapon();
    const cfg = WEAPON_CONFIG[id];
    const aim = Math.atan2(pointer.y - character.y, pointer.x - character.x);
    const tx = pointer.x;
    const ty = pointer.y;
    const liveBonus = rapidTimer > 0 ? 4 : 0;

    if (id === "blaster") {
      if (countKind("blaster") >= cfg.maxLive + liveBonus) return;
      const speed = 1200;
      // Hole + destroy/surface at the aim point immediately.
      impactAt(tx, ty, cfg);
      const dist = Math.hypot(tx - character.x, ty - character.y);
      projectiles.push({
        kind: "blaster",
        x: character.x + Math.cos(aim) * 28,
        y: character.y + Math.sin(aim) * 8,
        vx: Math.cos(aim) * speed,
        vy: Math.sin(aim) * speed,
        life: Math.max(0.08, dist / speed + 0.04),
      });
      audio.play("shoot");
      return;
    }

    if (id === "rocket") {
      if (countKind("rocket") >= cfg.maxLive) return;
      projectiles.push({
        kind: "rocket",
        x: tx + (Math.random() * 40 - 20),
        y: -28,
        tx,
        ty,
        life: 2.5,
      });
      audio.play("rocket");
      return;
    }

    if (id === "vortex") {
      if (countKind("vortex") >= cfg.maxLive) return;
      projectiles.push({
        kind: "vortex",
        x: character.x + Math.cos(aim) * 20,
        y: character.y + Math.sin(aim) * 12,
        tx,
        ty,
        life: 1.15,
        spin: 0,
      });
      audio.play("vortex");
      return;
    }

    // Arc gun — chain lightning from gun to aim + nearby forks
    if (zapArcs.length >= cfg.maxLive) return;
    impactAt(tx, ty, cfg);
    const forks = reducedMotion ? 2 : 4;
    for (let i = 0; i < forks && zapArcs.length < MAX_ZAPS; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * cfg.radius;
      const fx = tx + Math.cos(ang) * dist;
      const fy = ty + Math.sin(ang) * dist;
      zapArcs.push({
        x0: i === 0 ? character.x : tx,
        y0: i === 0 ? character.y : ty,
        x1: i === 0 ? tx : fx,
        y1: i === 0 ? ty : fy,
        life: 0.18 + Math.random() * 0.1,
        maxLife: 0.28,
      });
      if (i > 0) {
        impactAt(fx, fy, cfg, {
          holeScale: 0.45,
          radius: cfg.radius * 0.45,
          hits: 1,
        });
      }
    }
    audio.play("zap");
  }

  function isHudTarget(target: EventTarget | null) {
    return (
      target instanceof Element && Boolean(target.closest("[data-destroy-ignore]"))
    );
  }

  function beginDrag(clientX: number, clientY: number) {
    if (paused || dead) return;
    dragging = true;
    dragOffset.x = clientX - character.x;
    dragOffset.y = clientY - character.y;
    // Far from the sprite — pick him up under the cursor.
    if (Math.hypot(dragOffset.x, dragOffset.y) > 64) {
      dragOffset.x = 0;
      dragOffset.y = 0;
      clampCharacter(clientX, clientY);
    }
  }

  function onPointerMove(event: PointerEvent) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    // Bitmask is more reliable than button events alone across browsers.
    const rightHeld = (event.buttons & 2) !== 0;
    if (rightHeld && !paused && !isHudTarget(event.target)) {
      if (!dragging) beginDrag(pointer.x, pointer.y);
      clampCharacter(pointer.x - dragOffset.x, pointer.y - dragOffset.y);
      walkPhase += 0.45;
      return;
    }

    if (dragging) {
      if (!rightHeld) {
        dragging = false;
        return;
      }
      clampCharacter(pointer.x - dragOffset.x, pointer.y - dragOffset.y);
      walkPhase += 0.45;
    }
  }

  function onPointerDown(event: PointerEvent) {
    if (isHudTarget(event.target)) return;

    // Keep aim synced even when the first interaction is a click (no prior move).
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    // Right-click drag repositions the character.
    if (event.button === 2) {
      event.preventDefault();
      beginDrag(event.clientX, event.clientY);
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // ignore — capture is best-effort
      }
      return;
    }

    if (event.button !== 0) return;
    if (dragging) return;
    event.preventDefault();
    fire();
  }

  function onPointerUp(event: PointerEvent) {
    if (event.button === 2) {
      dragging = false;
      try {
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      } catch {
        // ignore
      }
    }
  }

  function setMoveKey(code: string, pressed: boolean): boolean {
    switch (code) {
      case "KeyW":
      case "ArrowUp":
        moveKeys.up = pressed;
        return true;
      case "KeyS":
      case "ArrowDown":
        moveKeys.down = pressed;
        return true;
      case "KeyA":
      case "ArrowLeft":
        moveKeys.left = pressed;
        return true;
      case "KeyD":
      case "ArrowRight":
        moveKeys.right = pressed;
        return true;
      default:
        return false;
    }
  }

  function clearMoveKeys() {
    moveKeys.up = false;
    moveKeys.down = false;
    moveKeys.left = false;
    moveKeys.right = false;
  }

  function onKeyDown(event: KeyboardEvent) {
    if (isTypingTarget(event.target)) return;
    if (event.code >= "Digit1" && event.code <= "Digit4") {
      setWeapon(Number(event.code.slice(-1)) - 1);
      return;
    }
    if (setMoveKey(event.code, true)) {
      event.preventDefault();
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    if (setMoveKey(event.code, false)) {
      event.preventDefault();
    }
  }

  function onWheel(event: WheelEvent) {
    if (paused) return;
    if (isTypingTarget(event.target)) return;
    const target = event.target;
    if (target instanceof Element && target.closest("[data-destroy-ignore]")) {
      return;
    }
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;
    setWeapon(cycleWeaponIndex(weaponIndex, delta));
  }

  function onContextMenu(event: MouseEvent) {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-destroy-ignore]")) {
      return;
    }
    event.preventDefault();
  }

  function onVisibility() {
    hidden = document.visibilityState === "hidden";
    if (!hidden && running && !paused) {
      lastTs = performance.now();
      targets.invalidate();
    }
  }

  function update(dt: number) {
    // WASD / arrows — the only non-drag way to reposition. Never chase the cursor.
    if (!paused && !hidden && !dragging && !dead) {
      let mx = 0;
      let my = 0;
      if (moveKeys.left) mx -= 1;
      if (moveKeys.right) mx += 1;
      if (moveKeys.up) my -= 1;
      if (moveKeys.down) my += 1;
      if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my) || 1;
        clampCharacter(
          character.x + (mx / len) * MOVE_SPEED * dt,
          character.y + (my / len) * MOVE_SPEED * dt,
        );
        walkPhase += dt * 14;
      }
    }

    // Face the aim point; walk frames while dragging or strafing.
    if (Math.abs(pointer.x - character.x) > 1) {
      facing = pointer.x >= character.x ? 1 : -1;
    }
    if (dragging) {
      walkPhase += dt * 14;
    } else if (!moveKeys.up && !moveKeys.down && !moveKeys.left && !moveKeys.right) {
      walkPhase += dt * 2.2;
    }

    // Projectiles — blaster bolts are visual tracers (impact already applied).
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      if (p.kind === "blaster") {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (
          p.life <= 0 ||
          p.x < -40 ||
          p.y < -40 ||
          p.x > window.innerWidth + 40 ||
          p.y > window.innerHeight + 40
        ) {
          projectiles.splice(i, 1);
        }
      } else if (p.kind === "rocket") {
        const dist = Math.hypot(p.tx - p.x, p.ty - p.y);
        const step = 560 * dt;
        if (dist <= step || p.y >= p.ty) {
          boom(p.tx, p.ty, WEAPON_CONFIG.rocket);
          projectiles.splice(i, 1);
        } else {
          p.x += ((p.tx - p.x) / dist) * step * 0.4;
          p.y += step;
          p.life -= dt;
          if (p.life <= 0) projectiles.splice(i, 1);
        }
      } else if (p.kind === "vortex") {
        const dist = Math.hypot(p.tx - p.x, p.ty - p.y);
        const step = 220 * dt;
        if (dist > 1) {
          p.x += ((p.tx - p.x) / dist) * step;
          p.y += ((p.ty - p.y) / dist) * step;
        }
        p.spin += dt;
        p.life -= dt;
        // Mild pull sparks while drifting
        if (!reducedMotion && Math.random() < 0.25) {
          const sparks = spawnDebris(
            { left: p.x - 8, top: p.y - 8, width: 16, height: 16 },
            2,
            ["#c084fc", "#67e8f9", "#f5d0fe"],
          );
          particles = particles.concat(sparks).slice(-MAX_PARTICLES);
        }
        if (p.life <= 0 || dist < 10) {
          boom(p.x, p.y, WEAPON_CONFIG.vortex);
          projectiles.splice(i, 1);
        }
      }
    }

    for (let i = zapArcs.length - 1; i >= 0; i--) {
      zapArcs[i].life -= dt;
      if (zapArcs[i].life <= 0) zapArcs.splice(i, 1);
    }

    // Scars heal — hold, then cover over based on weapon timing.
    for (let i = holes.length - 1; i >= 0; i--) {
      holes[i].life -= dt;
      if (holes[i].life <= 0) holes.splice(i, 1);
    }

    // Explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].life -= dt;
      if (explosions[i].life <= 0) explosions.splice(i, 1);
    }

    // Debris
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 420 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Player combat timers
    if (hurtFlash > 0) hurtFlash -= dt;
    if (hurtIFrames > 0) hurtIFrames -= dt;
    knockX *= Math.max(0, 1 - dt * 10);
    knockY *= Math.max(0, 1 - dt * 10);
    if (shieldTimer > 0) shieldTimer = Math.max(0, shieldTimer - dt);
    if (rapidTimer > 0) rapidTimer = Math.max(0, rapidTimer - dt);
    if (shieldTimer > 0 || rapidTimer > 0) {
      buffEmitTimer -= dt;
      if (buffEmitTimer <= 0) {
        emitBuffs();
        buffEmitTimer = 0.25;
      }
    } else if (buffEmitTimer !== 0) {
      buffEmitTimer = 0;
      emitBuffs();
    }

    // Random enemy waves from the edges
    enemySpawnTimer -= dt;
    if (enemySpawnTimer <= 0 && enemies.length < MAX_ENEMIES) {
      const burst = reducedMotion ? 1 : 1 + (Math.random() < 0.35 ? 1 : 0);
      for (let i = 0; i < burst && enemies.length < MAX_ENEMIES; i++) {
        enemies.push(
          spawnEnemyAtEdge(window.innerWidth, window.innerHeight),
        );
      }
      enemySpawnTimer = 0.9 + Math.random() * 2.4;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      steerEnemyToward(e, character.x, character.y, dt);
      const dist = Math.hypot(e.x - character.x, e.y - character.y);
      if (dist < CHAR_HIT_R + e.radius * 0.7) {
        takeDamage(e.damage, e.x, e.y);
      }
    }

    // Power-ups / health reups
    pickupSpawnTimer -= dt;
    if (pickupSpawnTimer <= 0 && pickups.length < MAX_PICKUPS) {
      pickups.push(spawnPickupRandom(window.innerWidth, window.innerHeight));
      pickupSpawnTimer = 4.5 + Math.random() * 5.5;
    }

    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.bob += dt * 4;
      p.life -= dt;
      if (p.life <= 0) {
        pickups.splice(i, 1);
        continue;
      }
      if (Math.hypot(p.x - character.x, p.y - character.y) < 26) {
        if (p.kind === "health") heal(28);
        else if (p.kind === "shield") {
          shieldTimer = Math.max(shieldTimer, 4.5);
          emitBuffs();
        } else {
          rapidTimer = Math.max(rapidTimer, 5.5);
          emitBuffs();
        }
        audio.play("pickup");
        pickups.splice(i, 1);
      }
    }
  }

  function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    // Holes sit under FX so the page looks punched through.
    for (const hole of holes) {
      drawBulletHole(ctx, hole, atlas);
    }

    for (const p of particles) drawDebris(ctx, p);
    for (const e of explosions) {
      drawExplosion(ctx, e.x, e.y, e.life, e.maxLife, atlas);
    }

    for (const p of pickups) drawPickup(ctx, p);
    for (const e of enemies) drawPixelEnemy(ctx, e);

    for (const p of projectiles) {
      if (p.kind === "blaster") {
        drawBlasterBolt(ctx, p.x, p.y, Math.atan2(p.vy, p.vx), atlas);
      } else if (p.kind === "rocket") {
        const ang = Math.atan2(p.ty - p.y, p.tx - p.x);
        drawRocket(ctx, p.x, p.y, ang, atlas);
      } else if (p.kind === "vortex") {
        drawVortex(ctx, p.x, p.y, p.spin, atlas);
      }
    }

    for (const z of zapArcs) {
      drawZapArc(ctx, z.x0, z.y0, z.x1, z.y1, z.life, z.maxLife);
    }

    const aim = Math.atan2(pointer.y - character.y, pointer.x - character.x);
    drawCharacter(ctx, character.x, character.y, facing, aim, walkPhase, atlas, {
      hurtFlash,
      shielded: shieldTimer > 0,
      knockX,
      knockY,
    });
  }

  function frame(ts: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (paused || hidden) {
      lastTs = ts;
      draw();
      return;
    }
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
    lastTs = ts;
    update(dt);
    draw();
  }

  function start() {
    if (running) return;
    running = true;
    resize();
    clampCharacter(character.x, character.y);
    lastTs = performance.now();
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearMoveKeys);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    dragging = false;
    clearMoveKeys();
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", clearMoveKeys);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("contextmenu", onContextMenu);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
  }

  function clearFx() {
    projectiles.length = 0;
    zapArcs.length = 0;
    explosions.length = 0;
    particles = [];
    enemies.length = 0;
    pickups.length = 0;
  }

  function clearHoles() {
    holes.length = 0;
  }

  function repair() {
    clearFx();
    clearHoles();
    targets.restoreAll();
    health = PLAYER_MAX_HP;
    dead = false;
    hurtFlash = 0;
    hurtIFrames = 0;
    knockX = 0;
    knockY = 0;
    shieldTimer = 0;
    rapidTimer = 0;
    enemySpawnTimer = 1.4;
    pickupSpawnTimer = 4;
    emitHealth();
    emitBuffs();
    audio.play("ui");
  }

  function destroy() {
    stop();
    clearFx();
    clearHoles();
    // Instant restore + clear pending rebuild timers (no flash on unmount).
    targets.dispose();
    audio.dispose();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  emitHealth();

  return {
    start,
    stop,
    setPaused(next) {
      // Don't unpause while dead unless repair revived the player.
      if (!next && dead) return;
      paused = next;
      if (next) {
        dragging = false;
        clearMoveKeys();
      }
      if (!next) lastTs = performance.now();
    },
    isPaused: () => paused,
    setMuted(next) {
      audio.setMuted(next);
    },
    isMuted: () => audio.isMuted(),
    setWeapon,
    getWeaponIndex: () => weaponIndex,
    getHealth: () => ({ health, maxHealth: PLAYER_MAX_HP }),
    repair,
    destroy,
  };
}
