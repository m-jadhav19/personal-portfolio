import { createDestroyAudio } from "./audio";
import {
  createPortraitBoss,
  drawBossShot,
  drawPortraitBoss,
  hurtBoss,
  loadBossPortrait,
  updatePortraitBoss,
  type BossProjectile,
  type PortraitBoss,
} from "./boss";
import {
  BOSS_SCORE_THRESHOLD,
  DOM_DESTROY_SCORE,
  ENEMY_SCORE,
  ENV_PROP_STATS,
  PLAYER_MAX_HP,
  drawEnvProp,
  drawPickup,
  drawPixelEnemy,
  drawTileFloor,
  spawnEnemyAtEdge,
  spawnEnvProps,
  spawnPickupRandom,
  steerEnemyToward,
  type Enemy,
  type EnvProp,
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
  earliestCircleHit,
  sampleSegment,
} from "./collision";
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
  clearDestroyWatchTarget,
  setDestroyWatchTarget,
} from "./watchTarget";
import {
  WEAPON_CONFIG,
  WEAPONS,
  clampWeaponIndex,
  cycleWeaponIndex,
  weaponHoleLife,
  type WeaponConfig,
  type WeaponId,
} from "./weapons";

/** Screen FX while the canvas boss emerges from the portrait (no DOM transforms). */
type BossIntroFx = {
  x: number;
  y: number;
  t: number;
  duration: number;
  waveTimer: number;
  wavesLeft: number;
  flashMarks: number[];
};

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
      vx: number;
      vy: number;
      life: number;
    }
  | {
      kind: "vortex";
      x: number;
      y: number;
      vx: number;
      vy: number;
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
  onScoreChange?: (score: number, threshold: number, bossSummoned: boolean) => void;
  onBossChange?: (boss: { hp: number; maxHp: number; alive: boolean } | null) => void;
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
  getScore: () => { score: number; threshold: number; bossSummoned: boolean };
  repair: () => void;
  destroy: () => void;
};

const MAX_PARTICLES = 60;
const MAX_ZAPS = 6;
const MAX_HOLES = 48;
const MAX_ENEMIES = 8;
const MAX_PICKUPS = 4;
const MAX_ENV_PROPS = 6;
const MAX_EXPLOSIONS = 10;
const MAX_BOSS_SHOTS = 12;
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
  let envProps: EnvProp[] = [];
  const bossShots: BossProjectile[] = [];
  let boss: PortraitBoss | null = null;
  let bossIntroFx: BossIntroFx | null = null;
  let impactFlash = 0;
  const bossPortrait = loadBossPortrait();
  let portraitDomHidden: HTMLElement | null = null;
  let portraitDomPrev = {
    visibility: "",
    opacity: "",
    pointerEvents: "",
    transform: "",
    transition: "",
    filter: "",
    willChange: "",
  };

  let health = PLAYER_MAX_HP;
  let score = 0;
  let bossSummoned = false;
  let hurtFlash = 0;
  let hurtIFrames = 0;
  let knockX = 0;
  let knockY = 0;
  let shieldTimer = 0;
  let rapidTimer = 0;
  let enemySpawnTimer = 1.2;
  let pickupSpawnTimer = 5;
  let buffEmitTimer = 0;
  let bossEmitTimer = 0;
  let dead = false;

  function emitHealth() {
    options.onHealthChange?.(health, PLAYER_MAX_HP);
  }

  function emitBuffs() {
    options.onBuffChange?.({ shield: shieldTimer, rapid: rapidTimer });
  }

  function emitScore() {
    options.onScoreChange?.(score, BOSS_SCORE_THRESHOLD, bossSummoned);
  }

  function emitBoss() {
    if (!boss || !boss.alive) {
      options.onBossChange?.(boss ? { hp: 0, maxHp: boss.maxHp, alive: false } : null);
      return;
    }
    options.onBossChange?.({
      hp: boss.hp,
      maxHp: boss.maxHp,
      alive: true,
    });
  }

  function portraitEl() {
    // Prefer the live sticker (may be peeled/placed elsewhere), then the stage.
    return (
      document.querySelector<HTMLElement>("[data-destroy-portrait='sticker']") ??
      document.querySelector<HTMLElement>("[data-intro='portrait']")
    );
  }

  function portraitOrigin(el?: HTMLElement | null) {
    const node = el ?? portraitEl();
    if (!node) return undefined;
    const rect = node.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return undefined;
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      size: Math.max(rect.width, rect.height),
    };
  }

  function hidePortraitDom(el?: HTMLElement | null) {
    const node = el ?? portraitEl();
    if (!node || portraitDomHidden) return;
    portraitDomHidden = node;
    portraitDomPrev = {
      visibility: node.style.visibility,
      opacity: node.style.opacity,
      pointerEvents: node.style.pointerEvents,
      transform: node.style.transform,
      transition: node.style.transition,
      filter: node.style.filter,
      willChange: node.style.willChange,
    };
    // Instant hide — canvas boss takes over at this exact rect (no CSS shrink teleport).
    node.style.transition = "none";
    node.style.opacity = "0";
    node.style.visibility = "hidden";
    node.style.pointerEvents = "none";
  }

  function restorePortraitDom() {
    bossIntroFx = null;
    if (!portraitDomHidden) {
      const el = portraitEl();
      if (el) {
        el.style.opacity = "";
        el.style.visibility = "";
        el.style.pointerEvents = "";
        el.style.transition = "";
      }
      return;
    }
    portraitDomHidden.style.visibility = portraitDomPrev.visibility;
    portraitDomHidden.style.opacity = portraitDomPrev.opacity;
    portraitDomHidden.style.pointerEvents = portraitDomPrev.pointerEvents;
    portraitDomHidden.style.transform = portraitDomPrev.transform;
    portraitDomHidden.style.transition = portraitDomPrev.transition;
    portraitDomHidden.style.filter = portraitDomPrev.filter;
    portraitDomHidden.style.willChange = portraitDomPrev.willChange;
    portraitDomHidden = null;
  }

  function smashRevealWave(x: number, y: number, radius: number) {
    const cfg = WEAPON_CONFIG.rocket;
    damageAt(x, y, radius, reducedMotion ? 2 : 4, { awardScore: false });
    scatterHoles(
      x,
      y,
      radius * 0.7,
      reducedMotion ? 2 : 4,
      cfg,
    );
    if (explosions.length < MAX_EXPLOSIONS) {
      explosions.push({
        x,
        y,
        life: 0.28,
        maxLife: 0.28,
      });
    }
    const crater = Math.max(14, radius * 0.28);
    const bits = spawnDebris(
      {
        left: x - crater,
        top: y - crater,
        width: crater * 2,
        height: crater * 2,
      },
      reducedMotion ? 4 : 8,
      ["#fdba74", "#38bdf8", "#f97316", "#fde047", "#a1a1aa"],
    );
    particles = particles.concat(bits).slice(-MAX_PARTICLES);
    audio.play("boom");
    options.onShake?.(0.55);
  }

  function beginBossReveal() {
    if (bossSummoned || boss || bossIntroFx) return;
    bossSummoned = true;
    const el = portraitEl();
    const origin = portraitOrigin(el);
    const x = origin?.x ?? window.innerWidth * 0.62;
    const y = origin?.y ?? window.innerHeight * 0.42;
    const startSize = origin?.size ?? 280;

    // Capture once, hide the sticker, hand off to a canvas DOOM emerge at that spot.
    // No CSS scale/translate — that was reading back a moving rect and teleporting.
    if (el) hidePortraitDom(el);

    boss = createPortraitBoss(window.innerWidth, window.innerHeight, {
      x,
      y,
      size: startSize,
    });
    bossIntroFx = {
      x,
      y,
      t: 0,
      duration: reducedMotion ? 0.35 : 0.95,
      waveTimer: 0.12,
      wavesLeft: reducedMotion ? 1 : 3,
      flashMarks: [0.05, 0.4, 0.75],
    };

    audio.play("bossIntro");
    impactFlash = 0.55;
    options.onShake?.(1);
    smashRevealWave(x, y, Math.min(160, startSize * 0.55));
    emitBoss();
    emitScore();
  }

  function updateBossIntroFx(dt: number) {
    if (!bossIntroFx) return;
    bossIntroFx.t += dt;
    const p = Math.min(1, bossIntroFx.t / bossIntroFx.duration);

    // Keep FX locked to the boss home (where the sticker was), not a drifting rect.
    if (boss) {
      bossIntroFx.x = boss.homeX;
      bossIntroFx.y = boss.homeY;
    }

    if (
      bossIntroFx.flashMarks.length &&
      p >= bossIntroFx.flashMarks[0]
    ) {
      bossIntroFx.flashMarks.shift();
      impactFlash = Math.max(impactFlash, 0.28);
      options.onShake?.(0.65);
    }

    bossIntroFx.waveTimer -= dt;
    if (bossIntroFx.waveTimer <= 0 && bossIntroFx.wavesLeft > 0) {
      const radius = 55 + bossIntroFx.wavesLeft * 24;
      smashRevealWave(bossIntroFx.x, bossIntroFx.y, radius);
      bossIntroFx.wavesLeft -= 1;
      bossIntroFx.waveTimer = reducedMotion ? 0.14 : 0.2;
    }

    if (p >= 1) {
      bossIntroFx = null;
      impactFlash = Math.max(impactFlash, 0.35);
      options.onShake?.(0.85);
    }
  }

  function spawnBoss() {
    beginBossReveal();
  }

  function maybeSummonBoss() {
    if (bossSummoned || boss || bossIntroFx || dead || paused) return;
    if (score >= BOSS_SCORE_THRESHOLD) spawnBoss();
  }

  function addScore(points: number) {
    if (points <= 0 || dead) return;
    score += points;
    emitScore();
    maybeSummonBoss();
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
          reducedMotion ? 2 : 4,
          ["#92400e", "#4ade80", "#94a3b8", "#fde047"],
        );
        particles = particles.concat(bits).slice(-MAX_PARTICLES);
        enemies.splice(i, 1);
        killed += 1;
        addScore(ENEMY_SCORE[e.kind]);
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

    if (boss?.alive) {
      if (Math.hypot(boss.x - x, boss.y - y) <= radius + boss.radius) {
        const result = hurtBoss(boss, Math.max(1, damage));
        if (result.hit) {
          audio.play("bossHit");
          emitBoss();
        }
        if (result.killed) {
          killed += 1;
          addScore(500);
          if (explosions.length < MAX_EXPLOSIONS) {
            explosions.push({ x: boss.x, y: boss.y, life: 0.4, maxLife: 0.4 });
          }
          const bits = spawnDebris(
            { left: boss.x - 30, top: boss.y - 30, width: 60, height: 60 },
            reducedMotion ? 6 : 12,
            ["#fdba74", "#38bdf8", "#f97316", "#fde047", "#c084fc"],
          );
          particles = particles.concat(bits).slice(-MAX_PARTICLES);
          audio.play("bossDeath");
          options.onShake?.(1);
          // Boss loot shower
          for (const kind of ["health", "shield", "rapid"] as const) {
            if (pickups.length >= MAX_PICKUPS) break;
            pickups.push({
              kind,
              x: boss.x + (Math.random() * 40 - 20),
              y: boss.y + (Math.random() * 40 - 20),
              life: 14,
              bob: Math.random() * 4,
            });
          }
          emitBoss();
        }
      }
    }

    killed += hurtEnvPropsAt(x, y, radius, damage);
    return killed;
  }

  function hurtEnvPropsAt(
    x: number,
    y: number,
    radius: number,
    damage: number,
  ) {
    let smashed = 0;
    for (let i = envProps.length - 1; i >= 0; i--) {
      const prop = envProps[i];
      if (Math.hypot(prop.x - x, prop.y - y) > radius + prop.radius) continue;
      prop.hp -= damage;
      prop.hitFlash = 0.16;
      if (prop.hp > 0) continue;
      const bits = spawnDebris(
        { left: prop.x - 8, top: prop.y - 8, width: 16, height: 16 },
        reducedMotion ? 2 : 4,
        ["#a16207", "#b91c1c", "#166534", "#78716c", "#fde68a"],
      );
      particles = particles.concat(bits).slice(-MAX_PARTICLES);
      if (explosions.length < MAX_EXPLOSIONS) {
        explosions.push({ x: prop.x, y: prop.y, life: 0.16, maxLife: 0.16 });
      }
      addScore(ENV_PROP_STATS[prop.kind].score);
      envProps.splice(i, 1);
      smashed += 1;
      audio.play("hit");
    }
    return smashed;
  }

  function resize() {
    // Cap DPR — full 2x canvases are a common freeze source on laptops.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const nextW = Math.floor(w * dpr);
    const nextH = Math.floor(h * dpr);
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
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

  function damageAt(
    x: number,
    y: number,
    radius: number,
    hits: number,
    opts?: { awardScore?: boolean },
  ) {
    const damaged = targets.applyDamage(x, y, radius, hits);
    const particleBudget = reducedMotion ? 2 : 4;
    for (const d of damaged) {
      const next = spawnDebris(d.box, particleBudget);
      particles = particles.concat(next).slice(-MAX_PARTICLES);
    }
    if (damaged.length > 0 && opts?.awardScore !== false) {
      addScore(damaged.length * DOM_DESTROY_SCORE);
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
      const sparkCount = reducedMotion ? 2 : 4;
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
    if (explosions.length < MAX_EXPLOSIONS) {
      explosions.push({ x, y, life: 0.28, maxLife: 0.28 });
    }
    const destroyed = damageAt(x, y, radius, hits);
    hurtEnemiesAt(x, y, radius, Math.max(2, hits));
    scatterHoles(
      x,
      y,
      radius * 0.7,
      Math.max(2, Math.min(6, Math.round(radius / 18))),
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
        reducedMotion ? 3 : 6,
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

  function livingCircles() {
    const circles: { x: number; y: number; radius: number }[] = [];
    for (const e of enemies) circles.push(e);
    for (const prop of envProps) circles.push(prop);
    if (boss?.alive) circles.push(boss);
    return circles;
  }

  /**
   * Move a projectile along a segment and stop on the first solid hit
   * (enemy / prop / boss / DOM). Returns true if the shot was consumed.
   */
  function resolveFlight(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    cfg: WeaponConfig,
    mode: "impact" | "boom",
  ): { consumed: boolean; x: number; y: number } {
    const entityHit = earliestCircleHit(
      x0,
      y0,
      x1,
      y1,
      livingCircles(),
      mode === "boom" ? 6 : 4,
    );

    let hitX = x1;
    let hitY = y1;
    let consumed = false;

    if (entityHit) {
      hitX = entityHit.x;
      hitY = entityHit.y;
      consumed = true;
    } else {
      // Probe the page along the path — anything under the bolt takes the hit.
      const samples = sampleSegment(
        x0,
        y0,
        x1,
        y1,
        reducedMotion ? 2 : 4,
      );
      for (const sample of samples) {
        const n = damageAt(sample.x, sample.y, mode === "boom" ? 10 : 0, 1, {
          awardScore: true,
        });
        if (n > 0) {
          hitX = sample.x;
          hitY = sample.y;
          consumed = true;
          break;
        }
      }
    }

    if (consumed) {
      if (mode === "boom") boom(hitX, hitY, cfg);
      else impactAt(hitX, hitY, cfg);
    }

    return { consumed, x: hitX, y: hitY };
  }

  /** Hitscan beam: damage every entity the ray crosses, plus DOM samples. */
  function raycastBeam(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    cfg: WeaponConfig,
  ) {
    const circles = livingCircles();
    const hits: { t: number; x: number; y: number }[] = [];
    for (const c of circles) {
      const hit = earliestCircleHit(x0, y0, x1, y1, [c], 4);
      if (hit) hits.push(hit);
    }
    hits.sort((a, b) => a.t - b.t);

    const seen = new Set<string>();
    for (const hit of hits.slice(0, cfg.hits)) {
      const key = `${Math.round(hit.x)},${Math.round(hit.y)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      impactAt(hit.x, hit.y, cfg, {
        radius: Math.max(16, cfg.radius * 0.35),
        hits: 1,
        holeScale: 0.7,
      });
    }

    // Always land at the aim tip, and nick DOM under the beam.
    impactAt(x1, y1, cfg);
    for (const sample of sampleSegment(x0, y0, x1, y1, reducedMotion ? 2 : 3)) {
      damageAt(sample.x, sample.y, 0, 1);
    }
  }

  function fire() {
    if (paused || hidden || dragging || dead) return;
    const id = currentWeapon();
    const cfg = WEAPON_CONFIG[id];
    const aim = Math.atan2(pointer.y - character.y, pointer.x - character.x);
    const liveBonus = rapidTimer > 0 ? 4 : 0;
    const muzzleX = character.x + Math.cos(aim) * 28;
    const muzzleY = character.y + Math.sin(aim) * 8;

    if (id === "blaster") {
      if (countKind("blaster") >= cfg.maxLive + liveBonus) return;
      const speed = 980;
      projectiles.push({
        kind: "blaster",
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(aim) * speed,
        vy: Math.sin(aim) * speed,
        life: 0.7,
      });
      audio.play("shoot");
      return;
    }

    if (id === "rocket") {
      if (countKind("rocket") >= cfg.maxLive) return;
      const speed = 520;
      projectiles.push({
        kind: "rocket",
        x: character.x + Math.cos(aim) * 22,
        y: character.y + Math.sin(aim) * 10,
        vx: Math.cos(aim) * speed,
        vy: Math.sin(aim) * speed,
        life: 1.8,
      });
      audio.play("rocket");
      return;
    }

    if (id === "vortex") {
      if (countKind("vortex") >= cfg.maxLive) return;
      const speed = 340;
      projectiles.push({
        kind: "vortex",
        x: character.x + Math.cos(aim) * 20,
        y: character.y + Math.sin(aim) * 12,
        vx: Math.cos(aim) * speed,
        vy: Math.sin(aim) * speed,
        life: 1.2,
        spin: 0,
      });
      audio.play("vortex");
      return;
    }

    // Arc gun — hitscan beam along the aim line, then side forks.
    if (zapArcs.length >= cfg.maxLive) return;
    const reach = Math.min(
      420,
      Math.hypot(pointer.x - muzzleX, pointer.y - muzzleY) + 40,
    );
    const tipX = muzzleX + Math.cos(aim) * reach;
    const tipY = muzzleY + Math.sin(aim) * reach;
    raycastBeam(muzzleX, muzzleY, tipX, tipY, cfg);
    zapArcs.push({
      x0: muzzleX,
      y0: muzzleY,
      x1: tipX,
      y1: tipY,
      life: 0.2,
      maxLife: 0.28,
    });
    const forks = reducedMotion ? 1 : 2;
    for (let i = 0; i < forks && zapArcs.length < MAX_ZAPS; i++) {
      const ang = aim + (Math.random() - 0.5) * 0.9;
      const dist = 24 + Math.random() * cfg.radius;
      const fx = tipX + Math.cos(ang) * dist;
      const fy = tipY + Math.sin(ang) * dist;
      zapArcs.push({
        x0: tipX,
        y0: tipY,
        x1: fx,
        y1: fy,
        life: 0.14 + Math.random() * 0.08,
        maxLife: 0.22,
      });
      impactAt(fx, fy, cfg, {
        holeScale: 0.45,
        radius: cfg.radius * 0.4,
        hits: 1,
      });
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

  /** Aim follows mouse/trackpad freely — never snaps the character to the cursor. */
  function syncPointer(clientX: number, clientY: number) {
    pointer.x = clientX;
    pointer.y = clientY;
  }

  function onPointerMove(event: PointerEvent) {
    syncPointer(event.clientX, event.clientY);

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
    syncPointer(event.clientX, event.clientY);

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
    setDestroyWatchTarget(character.x, character.y);
    updateBossIntroFx(dt);
    if (impactFlash > 0 && !bossIntroFx) {
      impactFlash = Math.max(0, impactFlash - dt * 1.8);
    }

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

    // Face the aim point (mouse/trackpad), independent of WASD strafe.
    if (Math.abs(pointer.x - character.x) > 1) {
      facing = pointer.x >= character.x ? 1 : -1;
    }

    for (const prop of envProps) {
      if (prop.hitFlash > 0) prop.hitFlash = Math.max(0, prop.hitFlash - dt);
    }
    if (dragging) {
      walkPhase += dt * 14;
    } else if (!moveKeys.up && !moveKeys.down && !moveKeys.left && !moveKeys.right) {
      walkPhase += dt * 2.2;
    }

    // Projectiles — collide with anything along the flight path.
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      const x0 = p.x;
      const y0 = p.y;
      const x1 = p.x + p.vx * dt;
      const y1 = p.y + p.vy * dt;
      p.life -= dt;

      if (p.kind === "blaster") {
        const result = resolveFlight(
          x0,
          y0,
          x1,
          y1,
          WEAPON_CONFIG.blaster,
          "impact",
        );
        if (result.consumed) {
          projectiles.splice(i, 1);
          continue;
        }
        p.x = x1;
        p.y = y1;
        if (
          p.life <= 0 ||
          p.x < -40 ||
          p.y < -40 ||
          p.x > window.innerWidth + 40 ||
          p.y > window.innerHeight + 40
        ) {
          projectiles.splice(i, 1);
        }
        continue;
      }

      if (p.kind === "rocket") {
        const result = resolveFlight(
          x0,
          y0,
          x1,
          y1,
          WEAPON_CONFIG.rocket,
          "boom",
        );
        if (result.consumed) {
          projectiles.splice(i, 1);
          continue;
        }
        p.x = x1;
        p.y = y1;
        if (
          p.life <= 0 ||
          p.x < -60 ||
          p.y < -60 ||
          p.x > window.innerWidth + 60 ||
          p.y > window.innerHeight + 60
        ) {
          boom(p.x, p.y, WEAPON_CONFIG.rocket);
          projectiles.splice(i, 1);
        }
        continue;
      }

      // Vortex — same ballistic path, bigger boom on contact / timeout.
      p.spin += dt;
      if (!reducedMotion && Math.random() < 0.06) {
        const sparks = spawnDebris(
          { left: p.x - 8, top: p.y - 8, width: 16, height: 16 },
          1,
          ["#c084fc", "#67e8f9"],
        );
        particles = particles.concat(sparks).slice(-MAX_PARTICLES);
      }
      const result = resolveFlight(
        x0,
        y0,
        x1,
        y1,
        WEAPON_CONFIG.vortex,
        "boom",
      );
      if (result.consumed) {
        projectiles.splice(i, 1);
        continue;
      }
      p.x = x1;
      p.y = y1;
      if (
        p.life <= 0 ||
        p.x < -60 ||
        p.y < -60 ||
        p.x > window.innerWidth + 60 ||
        p.y > window.innerHeight + 60
      ) {
        boom(p.x, p.y, WEAPON_CONFIG.vortex);
        projectiles.splice(i, 1);
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
      enemySpawnTimer = 1.6 + Math.random() * 2.8;
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

    // Portrait boss — floats, charges, and volleys ink shots
    if (boss?.alive) {
      const newShots = updatePortraitBoss(
        boss,
        dt,
        character,
        window.innerWidth,
        window.innerHeight,
        reducedMotion,
      );
      for (const shot of newShots) {
        if (bossShots.length >= MAX_BOSS_SHOTS) break;
        bossShots.push(shot);
        if (newShots.length && shot === newShots[0]) audio.play("bossAttack");
      }
      if (
        boss.mode !== "emerge" &&
        Math.hypot(boss.x - character.x, boss.y - character.y) <
          CHAR_HIT_R + boss.radius * 0.55
      ) {
        takeDamage(boss.damage, boss.x, boss.y);
      }
      bossEmitTimer -= dt;
      if (bossEmitTimer <= 0) {
        emitBoss();
        bossEmitTimer = 0.2;
      }
    }

    for (let i = bossShots.length - 1; i >= 0; i--) {
      const s = bossShots[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (Math.hypot(s.x - character.x, s.y - character.y) < CHAR_HIT_R + 6) {
        takeDamage(10, s.x, s.y);
        bossShots.splice(i, 1);
        continue;
      }
      if (
        s.life <= 0 ||
        s.x < -40 ||
        s.y < -40 ||
        s.x > window.innerWidth + 40 ||
        s.y > window.innerHeight + 40
      ) {
        bossShots.splice(i, 1);
      }
    }
  }

  function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    // Pixel tile wash under everything — 8-bit stage dressing.
    drawTileFloor(ctx, w, h, atlas);

    // Holes sit under FX so the page looks punched through.
    for (const hole of holes) {
      drawBulletHole(ctx, hole, atlas);
    }

    for (const prop of envProps) drawEnvProp(ctx, prop, atlas);

    for (const p of particles) drawDebris(ctx, p);
    for (const e of explosions) {
      drawExplosion(ctx, e.x, e.y, e.life, e.maxLife, atlas);
    }

    for (const p of pickups) drawPickup(ctx, p, atlas);
    for (const e of enemies) drawPixelEnemy(ctx, e, atlas);
    if (boss) drawPortraitBoss(ctx, boss, bossPortrait);
    for (const s of bossShots) drawBossShot(ctx, s);

    // Light entrance flash — avoid "lighter" compositing (GPU heavy).
    if (impactFlash > 0) {
      const a = Math.min(0.35, impactFlash * 0.9);
      ctx.fillStyle =
        Math.floor(impactFlash * 20) % 2 === 0
          ? `rgba(255, 255, 255, ${a})`
          : `rgba(253, 140, 60, ${a})`;
      ctx.fillRect(0, 0, w, h);
    }

    for (const p of projectiles) {
      if (p.kind === "blaster") {
        drawBlasterBolt(ctx, p.x, p.y, Math.atan2(p.vy, p.vx), atlas);
      } else if (p.kind === "rocket") {
        drawRocket(ctx, p.x, p.y, Math.atan2(p.vy, p.vx), atlas);
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
    envProps = spawnEnvProps(
      window.innerWidth,
      window.innerHeight,
      reducedMotion ? 3 : MAX_ENV_PROPS,
    );
    emitScore();
    emitBoss();
    lastTs = performance.now();
    window.addEventListener("pointermove", onPointerMove);
    // pointermove already covers mouse/trackpad — avoid double listeners.
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
    envProps = [];
    bossShots.length = 0;
  }

  function clearHoles() {
    holes.length = 0;
  }

  function repair() {
    clearFx();
    clearHoles();
    targets.restoreAll();
    restorePortraitDom();
    health = PLAYER_MAX_HP;
    score = 0;
    bossSummoned = false;
    boss = null;
    bossIntroFx = null;
    impactFlash = 0;
    dead = false;
    hurtFlash = 0;
    hurtIFrames = 0;
    knockX = 0;
    knockY = 0;
    shieldTimer = 0;
    rapidTimer = 0;
    enemySpawnTimer = 1.4;
    pickupSpawnTimer = 4;
    envProps = spawnEnvProps(
      window.innerWidth,
      window.innerHeight,
      reducedMotion ? 3 : MAX_ENV_PROPS,
    );
    emitHealth();
    emitBuffs();
    emitScore();
    emitBoss();
    audio.play("ui");
  }

  function destroy() {
    stop();
    clearFx();
    clearHoles();
    restorePortraitDom();
    clearDestroyWatchTarget();
    boss = null;
    bossIntroFx = null;
    impactFlash = 0;
    bossSummoned = false;
    score = 0;
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
    getScore: () => ({ score, threshold: BOSS_SCORE_THRESHOLD, bossSummoned }),
    repair,
    destroy,
  };
}
