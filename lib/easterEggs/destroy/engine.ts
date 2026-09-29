import { createDestroyAudio } from "./audio";
import {
  createTargetRegistry,
  type TargetRegistry,
} from "./targets";
import {
  drawBlasterBolt,
  drawBomb,
  drawCharacter,
  drawDebris,
  drawExplosion,
  drawMissile,
  drawRoach,
  spawnDebris,
  type DebrisParticle,
} from "./sprites";
import {
  WEAPON_CONFIG,
  WEAPONS,
  clampWeaponIndex,
  cycleWeaponIndex,
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
      kind: "missile";
      x: number;
      y: number;
      tx: number;
      ty: number;
      life: number;
    }
  | {
      kind: "bomb";
      x: number;
      y: number;
      vx: number;
      vy: number;
      fuse: number;
    };

type Roach = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  facing: 1 | -1;
  nibbleTimer: number;
};

type Explosion = { x: number; y: number; life: number; maxLife: number };

export type DestroyEngineOptions = {
  canvas: HTMLCanvasElement;
  reducedMotion?: boolean;
  initialMuted?: boolean;
  onWeaponChange?: (index: number, id: WeaponId) => void;
  onShake?: (magnitude: number) => void;
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
  repair: () => void;
  destroy: () => void;
};

const MAX_PARTICLES = 180;
const MAX_ROACHES = 18;
const LERP = 0.18;

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

  let weaponIndex = 0;
  let paused = false;
  let running = false;
  let raf = 0;
  let lastTs = 0;
  let hidden = false;

  const pointer: Vec = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const character: Vec = { x: pointer.x - 40, y: pointer.y };
  let facing: 1 | -1 = 1;
  let walkPhase = 0;

  const projectiles: Projectile[] = [];
  const roaches: Roach[] = [];
  const explosions: Explosion[] = [];
  let particles: DebrisParticle[] = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function currentWeapon(): WeaponId {
    return WEAPONS[clampWeaponIndex(weaponIndex)];
  }

  function setWeapon(index: number) {
    weaponIndex = clampWeaponIndex(index);
    options.onWeaponChange?.(weaponIndex, currentWeapon());
    audio.play("ui");
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

  function boom(x: number, y: number, radius: number, hits: number) {
    explosions.push({ x, y, life: 0.35, maxLife: 0.35 });
    damageAt(x, y, radius, hits);
    audio.play("boom");
    if (!reducedMotion) {
      options.onShake?.(Math.min(1, radius / 100));
    }
  }

  function countKind(kind: Projectile["kind"]) {
    return projectiles.filter((p) => p.kind === kind).length;
  }

  function fire() {
    if (paused || hidden) return;
    const id = currentWeapon();
    const cfg = WEAPON_CONFIG[id];
    const aim = Math.atan2(pointer.y - character.y, pointer.x - character.x);

    if (id === "blaster") {
      if (countKind("blaster") >= cfg.maxLive) return;
      const speed = 900;
      projectiles.push({
        kind: "blaster",
        x: character.x + Math.cos(aim) * 28,
        y: character.y + Math.sin(aim) * 10,
        vx: Math.cos(aim) * speed,
        vy: Math.sin(aim) * speed,
        life: 0.9,
      });
      audio.play("shoot");
      return;
    }

    if (id === "missile") {
      if (countKind("missile") >= cfg.maxLive) return;
      projectiles.push({
        kind: "missile",
        x: pointer.x + (Math.random() * 40 - 20),
        y: -24,
        tx: pointer.x,
        ty: pointer.y,
        life: 2.5,
      });
      audio.play("shoot");
      return;
    }

    if (id === "bomb") {
      if (countKind("bomb") >= cfg.maxLive) return;
      const speed = 420;
      projectiles.push({
        kind: "bomb",
        x: character.x,
        y: character.y,
        vx: Math.cos(aim) * speed,
        vy: Math.sin(aim) * speed - 220,
        fuse: 0.85,
      });
      audio.play("shoot");
      return;
    }

    // swarm
    if (roaches.length >= MAX_ROACHES) return;
    const spawnCount = reducedMotion ? 3 : 6;
    for (let i = 0; i < spawnCount; i++) {
      if (roaches.length >= MAX_ROACHES) break;
      const angle = Math.random() * Math.PI * 2;
      roaches.push({
        x: pointer.x + Math.cos(angle) * 12,
        y: pointer.y + Math.sin(angle) * 12,
        vx: Math.cos(angle) * (40 + Math.random() * 80),
        vy: Math.sin(angle) * (40 + Math.random() * 80),
        life: 2.4 + Math.random() * 0.8,
        facing: Math.cos(angle) >= 0 ? 1 : -1,
        nibbleTimer: 0.2 + Math.random() * 0.3,
      });
    }
    audio.play("roach");
  }

  function onPointerMove(event: PointerEvent) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    const target = event.target;
    if (target instanceof Element && target.closest("[data-destroy-ignore]")) {
      return;
    }
    event.preventDefault();
    fire();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.code >= "Digit1" && event.code <= "Digit4") {
      setWeapon(Number(event.code.slice(-1)) - 1);
    }
  }

  function onWheel(event: WheelEvent) {
    if (paused) return;
    const target = event.target;
    if (target instanceof Element && target.closest("[data-destroy-ignore]")) {
      return;
    }
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;
    setWeapon(cycleWeaponIndex(weaponIndex, delta));
  }

  function onVisibility() {
    hidden = document.visibilityState === "hidden";
    if (!hidden && running && !paused) {
      lastTs = performance.now();
    }
  }

  function update(dt: number) {
    const dx = pointer.x - character.x;
    const dy = pointer.y - character.y;
    character.x += dx * LERP;
    character.y += dy * LERP;
    if (Math.abs(dx) > 1) facing = dx >= 0 ? 1 : -1;
    const speed = Math.hypot(dx, dy);
    walkPhase += dt * (speed > 8 ? 12 : 3);

    // Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      if (p.kind === "blaster") {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (damageAt(p.x, p.y, 0, 1) > 0 || p.life <= 0) {
          projectiles.splice(i, 1);
        } else if (
          p.x < -40 ||
          p.y < -40 ||
          p.x > window.innerWidth + 40 ||
          p.y > window.innerHeight + 40
        ) {
          projectiles.splice(i, 1);
        }
      } else if (p.kind === "missile") {
        const dist = Math.hypot(p.tx - p.x, p.ty - p.y);
        const step = 520 * dt;
        if (dist <= step || p.y >= p.ty) {
          boom(p.tx, p.ty, WEAPON_CONFIG.missile.radius, WEAPON_CONFIG.missile.hits);
          projectiles.splice(i, 1);
        } else {
          p.x += ((p.tx - p.x) / dist) * step * 0.35;
          p.y += step;
          p.life -= dt;
          if (p.life <= 0) projectiles.splice(i, 1);
        }
      } else if (p.kind === "bomb") {
        p.vy += 900 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.fuse -= dt;
        if (p.fuse <= 0) {
          boom(p.x, p.y, WEAPON_CONFIG.bomb.radius, WEAPON_CONFIG.bomb.hits);
          projectiles.splice(i, 1);
        }
      }
    }

    // Roaches
    for (let i = roaches.length - 1; i >= 0; i--) {
      const r = roaches[i];
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.life -= dt;
      r.nibbleTimer -= dt;
      if (Math.random() < 0.02) {
        r.vx += (Math.random() - 0.5) * 60;
        r.vy += (Math.random() - 0.5) * 60;
      }
      r.facing = r.vx >= 0 ? 1 : -1;
      // bounce in viewport
      if (r.x < 8 || r.x > window.innerWidth - 8) r.vx *= -1;
      if (r.y < 8 || r.y > window.innerHeight - 8) r.vy *= -1;
      if (r.nibbleTimer <= 0) {
        damageAt(r.x, r.y, WEAPON_CONFIG.swarm.radius, 1);
        r.nibbleTimer = 0.35 + Math.random() * 0.4;
        audio.play("roach");
      }
      if (r.life <= 0) roaches.splice(i, 1);
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
  }

  function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) drawDebris(ctx, p);
    for (const e of explosions) drawExplosion(ctx, e.x, e.y, e.life, e.maxLife);

    for (const p of projectiles) {
      if (p.kind === "blaster") {
        drawBlasterBolt(ctx, p.x, p.y, Math.atan2(p.vy, p.vx));
      } else if (p.kind === "missile") {
        drawMissile(ctx, p.x, p.y);
      } else if (p.kind === "bomb") {
        drawBomb(ctx, p.x, p.y, p.fuse);
      }
    }

    for (const r of roaches) {
      drawRoach(ctx, r.x, r.y, r.facing, walkPhase + r.x * 0.05);
    }

    const aim = Math.atan2(pointer.y - character.y, pointer.x - character.x);
    drawCharacter(ctx, character.x, character.y, facing, aim, walkPhase);
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
    lastTs = performance.now();
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
  }

  function clearFx() {
    projectiles.length = 0;
    roaches.length = 0;
    explosions.length = 0;
    particles = [];
  }

  function repair() {
    clearFx();
    targets.restoreAll();
    audio.play("ui");
  }

  function destroy() {
    stop();
    clearFx();
    targets.restoreAll();
    audio.dispose();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  return {
    start,
    stop,
    setPaused(next) {
      paused = next;
      if (!next) lastTs = performance.now();
    },
    isPaused: () => paused,
    setMuted(next) {
      audio.setMuted(next);
    },
    isMuted: () => audio.isMuted(),
    setWeapon,
    getWeaponIndex: () => weaponIndex,
    repair,
    destroy,
  };
}
