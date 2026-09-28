import {
  BARREL,
  BENCH,
  BIRD_FRAMES,
  BONE,
  CACTUS,
  CAT,
  CLOUD_LARGE,
  CLOUD_SMALL,
  CONE,
  CRATE,
  DOG_LEAP,
  DOG_RUN_FRAMES,
  FENCE,
  GO,
  HYDRANT,
  MOON,
  PLUS_ONE,
  ROCK,
  SCOOTER,
  SIGNPOST,
  SUN,
  TRASH_CAN,
  WOOF,
  type Sprite,
} from "./sprites";

export type Palette = {
  ink: string;
  paper: string;
  collar: string;
};

export type PlayMode = "roam" | "play";

export type HudState = {
  mode: PlayMode;
  meters: number;
  bones: number;
  best: number;
};

export type EngineOptions = {
  onHud?: (hud: HudState) => void;
  reducedMotion?: boolean;
  isNight?: () => boolean;
  seed?: number;
};

/* ─── World constants (art pixels, seconds) ──────────────────────────────── */

const ART_PX_PER_METER = 28;
const JUMP_HEIGHT = 32;
const AIR_TIME = 0.7;
const GRAVITY = (8 * JUMP_HEIGHT) / (AIR_TIME * AIR_TIME);
const JUMP_VELOCITY = (GRAVITY * AIR_TIME) / 2;
const ROAM_SPEED = 88;
const PLAY_BASE_SPEED = 120;
const PLAY_MAX_SPEED = 210;
const PLAY_ACCELERATION = 1.6;
const CLEARANCE = 3;
const BAND_HEIGHT = 150;
const GROUND_MARGIN = 4;
const GROUND_LAYER_HEIGHT = 7;
const DOG_HITBOX = { left: 6, right: 26, height: 13 };
const STUMBLE_TIME = 0.75;
const INVULNERABLE_TIME = 1.1;
const BEST_SCORE_KEY = "dog-town-best-meters";

type Obstacle = {
  sprite: Sprite;
  x: number;
  knockedFor: number;
  knocked: boolean;
};

type Bone = {
  x: number;
  lift: number;
  phase: number;
};

type Particle = {
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  alpha: number;
  scale: number;
};

type Bird = {
  x: number;
  y: number;
  speed: number;
  flap: number;
};

type Cloud = {
  sprite: Sprite;
  x: number;
  y: number;
  drift: number;
};

type Star = {
  x: number;
  y: number;
  phase: number;
};

type Layer = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  parallax: number;
};

/** Sparse set used while the dog is just roaming the footer. */
const ROAM_OBSTACLES: { sprite: Sprite; weight: number }[] = [
  { sprite: HYDRANT, weight: 3 },
  { sprite: CAT, weight: 2 },
  { sprite: ROCK, weight: 2 },
  { sprite: CONE, weight: 2 },
  { sprite: TRASH_CAN, weight: 1 },
];

/** Denser, more varied set once the scored run starts. */
const PLAY_OBSTACLES: { sprite: Sprite; weight: number }[] = [
  { sprite: HYDRANT, weight: 3 },
  { sprite: TRASH_CAN, weight: 3 },
  { sprite: CAT, weight: 2 },
  { sprite: FENCE, weight: 2 },
  { sprite: BENCH, weight: 2 },
  { sprite: ROCK, weight: 3 },
  { sprite: CONE, weight: 3 },
  { sprite: CRATE, weight: 2 },
  { sprite: BARREL, weight: 2 },
  { sprite: SCOOTER, weight: 2 },
  { sprite: CACTUS, weight: 2 },
  { sprite: SIGNPOST, weight: 2 },
];

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readBestMeters() {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function writeBestMeters(meters: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(meters));
  } catch {
    // private mode / blocked storage — ignore
  }
}

/** Times (rising / falling) at which a fresh jump passes `height`. */
function jumpWindow(height: number) {
  const discriminant = JUMP_VELOCITY * JUMP_VELOCITY - 2 * GRAVITY * height;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  return {
    rise: (JUMP_VELOCITY - root) / GRAVITY,
    fall: (JUMP_VELOCITY + root) / GRAVITY,
  };
}

export class DogTownEngine {
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private px = 3;
  private palette: Palette = { ink: "#0e1111", paper: "#f5f4f0", collar: "#f5f4f0" };
  private spriteCache = new Map<Sprite, HTMLCanvasElement>();
  private layers: { far: Layer; near: Layer; ground: Layer } | null = null;
  private night = false;
  private rng: () => number;
  private seed: number;

  private mode: PlayMode = "roam";
  private scroll = 0;
  private playScroll = 0;
  private speed = ROAM_SPEED;
  private elapsed = 0;
  private dogHeight = 0;
  private dogVelocity = 0;
  private grounded = true;
  private runFrame = 1;
  private runClock = 0;
  private stumble = 0;
  private invulnerable = 0;
  private autoSlack = 0.06;

  private obstacles: Obstacle[] = [];
  private bones: Bone[] = [];
  private particles: Particle[] = [];
  private birds: Bird[] = [];
  private clouds: Cloud[] = [];
  private stars: Star[] = [];
  private nextGap = 0;
  private nextBoneIn = 4;
  private nextBirdIn = 5;

  private bonesCollected = 0;
  private bestMeters = 0;
  private lastMeters = -1;
  private lastMode: PlayMode = "roam";
  private hudClock = 0;

  private readonly onHud?: (hud: HudState) => void;
  private readonly reducedMotion: boolean;
  private readonly isNight: () => boolean;

  constructor(canvas: HTMLCanvasElement, options: EngineOptions = {}) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.onHud = options.onHud;
    this.reducedMotion = Boolean(options.reducedMotion);
    this.isNight = options.isNight ?? (() => false);
    this.seed = options.seed ?? Math.floor(Math.random() * 0xffffffff);
    this.rng = mulberry32(this.seed);
    this.night = this.isNight();
    this.bestMeters = readBestMeters();
  }

  /* ─── Public API ───────────────────────────────────────────────────────── */

  resize(width: number, height: number, dpr: number) {
    const canvas = this.ctx.canvas;
    this.width = width;
    this.height = height;
    this.dpr = Math.min(2, Math.max(1, dpr));
    this.px = width < 640 ? 2 : 3;

    canvas.width = Math.round(width * this.dpr);
    canvas.height = Math.round(height * this.dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.spriteCache.clear();
    this.rebuildStatic();
    this.draw();
    this.publishHud(0, true);
  }

  setPalette(palette: Palette) {
    if (
      palette.ink === this.palette.ink &&
      palette.paper === this.palette.paper &&
      palette.collar === this.palette.collar
    ) {
      return;
    }
    this.palette = palette;
    this.spriteCache.clear();
    this.rebuildStatic();
    this.draw();
  }

  /** Advance the world by `dt` seconds and repaint. */
  tick(dt: number) {
    if (this.reducedMotion || this.width === 0) return;
    const step = clamp(dt, 0, 0.05);
    this.update(step);
    this.draw();
  }

  getMode() {
    return this.mode;
  }

  /**
   * User interaction. First tap starts the scored run; later taps jump.
   * Returns false only when the scene is static (reduced motion).
   */
  poke() {
    if (this.reducedMotion) return false;

    if (this.mode === "roam") {
      this.startPlay();
      return true;
    }

    this.spawnWoof();
    this.jump();
    return true;
  }

  private startPlay() {
    this.mode = "play";
    this.elapsed = 0;
    this.playScroll = 0;
    this.bonesCollected = 0;
    this.speed = PLAY_BASE_SPEED;
    this.lastMeters = -1;
    this.obstacles = [];
    this.bones = [];
    this.nextGap = this.worldWidth * 0.55;
    this.nextBoneIn = 1.6;
    this.spawnGo();
    this.spawnWoof();
    this.jump();
    this.publishHud(0, true);
  }

  private jump() {
    if (!this.grounded) return false;
    this.grounded = false;
    this.dogVelocity = JUMP_VELOCITY;
    return true;
  }

  syncNight() {
    const night = this.isNight();
    if (night === this.night) return;
    this.night = night;
    this.rebuildStatic();
    this.draw();
  }

  destroy() {
    this.spriteCache.clear();
    this.layers = null;
  }

  /* ─── Geometry helpers ─────────────────────────────────────────────────── */

  private get worldWidth() {
    return Math.ceil(this.width / this.px);
  }

  private get groundY() {
    return Math.floor(this.height / this.px) - GROUND_MARGIN;
  }

  private get dogX() {
    return clamp(Math.round(this.worldWidth * 0.12), 14, 90);
  }

  /* ─── Simulation ───────────────────────────────────────────────────────── */

  private update(dt: number) {
    this.elapsed += dt;

    if (this.mode === "play") {
      this.speed = Math.min(
        PLAY_MAX_SPEED,
        PLAY_BASE_SPEED + this.elapsed * PLAY_ACCELERATION,
      );
      this.playScroll += this.speed * dt;
    } else {
      this.speed = ROAM_SPEED;
    }

    this.scroll += this.speed * dt;

    // Dog physics
    if (!this.grounded) {
      this.dogVelocity -= GRAVITY * dt;
      this.dogHeight += this.dogVelocity * dt;
      if (this.dogHeight <= 0) {
        this.dogHeight = 0;
        this.dogVelocity = 0;
        this.grounded = true;
        this.autoSlack = 0.03 + this.rng() * 0.09;
      }
    } else {
      this.runClock += dt * (this.speed / ROAM_SPEED);
      if (this.runClock >= 0.085) {
        this.runClock = 0;
        this.runFrame = (this.runFrame + 1) % DOG_RUN_FRAMES.length;
      }
    }

    this.stumble = Math.max(0, this.stumble - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);

    this.updateObstacles(dt);
    this.updateBones(dt);
    this.updateBirds(dt);
    this.updateClouds(dt);
    this.updateParticles(dt);

    // Autopilot only while roaming — once you start, you own the jumps.
    if (this.mode === "roam" && this.grounded) this.autopilot();
    this.checkCollisions();
    this.publishHud(dt);
  }

  private updateObstacles(dt: number) {
    const shift = this.speed * dt;
    for (const obstacle of this.obstacles) {
      obstacle.x -= shift;
      if (obstacle.knocked) obstacle.knockedFor += dt;
    }
    this.obstacles = this.obstacles.filter(
      (obstacle) => obstacle.x + obstacle.sprite.width + 24 > 0,
    );

    const last = this.obstacles[this.obstacles.length - 1];
    const spawnEdge = this.worldWidth + 12;

    if (!last || last.x < spawnEdge - this.nextGap) {
      const pack = this.pickObstaclePack();
      let offset = 0;
      for (const sprite of pack) {
        this.obstacles.push({
          sprite,
          x: spawnEdge + offset,
          knocked: false,
          knockedFor: 0,
        });
        offset += sprite.width + 4;
      }

      if (this.mode === "play") {
        const minGap = this.speed * (AIR_TIME + 0.22);
        this.nextGap = minGap + this.rng() * this.speed * 0.9;
      } else {
        const minGap = this.speed * (AIR_TIME + 0.9);
        this.nextGap = minGap + this.rng() * this.speed * 2.4;
      }
    }
  }

  private pickObstacle(): Sprite | null {
    const pool = this.mode === "play" ? PLAY_OBSTACLES : ROAM_OBSTACLES;
    const dogWidth = DOG_RUN_FRAMES[0].width;
    const candidates = pool.filter(({ sprite }) => {
      const window = jumpWindow(sprite.height + CLEARANCE);
      if (!window) return false;
      const airborneSpan = (sprite.width + dogWidth) / this.speed;
      return window.fall - window.rise - airborneSpan > 0.06;
    });
    if (candidates.length === 0) return null;

    const total = candidates.reduce((sum, item) => sum + item.weight, 0);
    let roll = this.rng() * total;
    for (const candidate of candidates) {
      roll -= candidate.weight;
      if (roll <= 0) return candidate.sprite;
    }
    return candidates[candidates.length - 1].sprite;
  }

  /** Sometimes spawn a tight pair in play mode for denser runs. */
  private pickObstaclePack(): Sprite[] {
    const first = this.pickObstacle();
    if (!first) return [];

    if (this.mode !== "play" || this.rng() > 0.28) return [first];

    const second = this.pickObstacle();
    if (!second) return [first];

    const packWidth = first.width + 4 + second.width;
    const dogWidth = DOG_RUN_FRAMES[0].width;
    const window = jumpWindow(Math.max(first.height, second.height) + CLEARANCE);
    if (!window) return [first];

    const airborneSpan = (packWidth + dogWidth) / this.speed;
    if (window.fall - window.rise - airborneSpan <= 0.08) return [first];
    return [first, second];
  }

  private updateBones(dt: number) {
    const shift = this.speed * dt;
    for (const bone of this.bones) {
      bone.x -= shift;
      bone.phase += dt * 3;
    }
    this.bones = this.bones.filter((bone) => bone.x + BONE.width > 0);

    // Bones only appear once the scored run has started.
    if (this.mode !== "play") return;

    this.nextBoneIn -= dt;
    if (this.nextBoneIn <= 0 && this.bones.length === 0) {
      this.nextBoneIn = 2 + this.rng() * 3.2;
      this.bones.push({
        x: this.worldWidth + 20,
        lift: 22 + Math.floor(this.rng() * 7),
        phase: this.rng() * Math.PI * 2,
      });
    }
  }

  private updateBirds(dt: number) {
    for (const bird of this.birds) {
      bird.x -= (this.speed * 0.35 + bird.speed) * dt;
      bird.flap += dt;
    }
    this.birds = this.birds.filter((bird) => bird.x + 8 > 0);

    this.nextBirdIn -= dt;
    if (this.nextBirdIn <= 0) {
      this.nextBirdIn = 6 + this.rng() * 9;
      this.birds.push({
        x: this.worldWidth + 8,
        y: this.groundY - 60 - this.rng() * 50,
        speed: 18 + this.rng() * 14,
        flap: 0,
      });
    }
  }

  private updateClouds(dt: number) {
    for (const cloud of this.clouds) {
      cloud.x -= (this.speed * 0.06 + cloud.drift) * dt;
      if (cloud.x + cloud.sprite.width < -4) {
        cloud.x = this.worldWidth + 10 + this.rng() * 40;
        cloud.y = this.groundY - 70 - this.rng() * 70;
      }
    }
  }

  private updateParticles(dt: number) {
    for (const particle of this.particles) {
      particle.life += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
  }

  private autopilot() {
    const dogWidth = DOG_RUN_FRAMES[0].width;
    const dogLeft = this.dogX;
    const dogRight = dogLeft + dogWidth;

    const nextObstacle = this.obstacles.find(
      (obstacle) => !obstacle.knocked && obstacle.x + obstacle.sprite.width > dogLeft,
    );

    if (nextObstacle) {
      const { sprite, x } = nextObstacle;
      const window = jumpWindow(sprite.height + CLEARANCE);
      if (window) {
        const timeToEnter = (x - dogRight) / this.speed;
        const airborneSpan = (sprite.width + dogWidth) / this.speed;
        const allowedSlack = Math.max(0, window.fall - window.rise - airborneSpan);
        const slack = Math.min(this.autoSlack, allowedSlack * 0.8);
        if (timeToEnter <= window.rise + slack) {
          this.jump();
          return;
        }
      }
    }

    const bone = this.bones.find((item) => item.x + BONE.width > dogLeft);
    if (!bone) return;

    const boneCenter = bone.x + BONE.width / 2;
    const dogCenter = dogLeft + dogWidth / 2;
    const timeToBone = (boneCenter - dogCenter) / this.speed;
    if (timeToBone > AIR_TIME / 2 + 0.02) return;

    const safe =
      !nextObstacle ||
      (nextObstacle.x - dogRight) / this.speed >= AIR_TIME + 0.1;
    if (safe) this.jump();
  }

  private checkCollisions() {
    const dogLeft = this.dogX + DOG_HITBOX.left;
    const dogRight = this.dogX + DOG_HITBOX.right;
    const dogBottom = this.dogHeight;
    const dogTop = this.dogHeight + DOG_RUN_FRAMES[0].height;

    if (this.mode === "play") {
      for (const bone of this.bones) {
        const overlapsX = bone.x < dogRight && bone.x + BONE.width > dogLeft;
        const overlapsY =
          bone.lift < dogTop && bone.lift + BONE.height > dogBottom;
        if (overlapsX && overlapsY) {
          bone.x = -100;
          this.bonesCollected += 1;
          this.spawnCollect(bone);
          this.publishHud(0, true);
        }
      }
    }

    if (this.invulnerable > 0) return;

    for (const obstacle of this.obstacles) {
      if (obstacle.knocked) continue;
      const { sprite, x } = obstacle;
      const overlapsX = x + 1 < dogRight && x + sprite.width - 1 > dogLeft;
      const overlapsY = dogBottom < sprite.height - 1;
      if (overlapsX && overlapsY) {
        obstacle.knocked = true;
        this.stumble = STUMBLE_TIME;
        this.invulnerable = INVULNERABLE_TIME;
        this.spawnDust(x + sprite.width / 2);
        if (this.mode === "play") this.commitBest();
        break;
      }
    }
  }

  private publishHud(dt: number, force = false) {
    if (!this.onHud) return;
    this.hudClock += dt;
    const meters =
      this.mode === "play"
        ? Math.floor(this.playScroll / ART_PX_PER_METER)
        : 0;

    if (
      !force &&
      this.hudClock < 0.2 &&
      meters === this.lastMeters &&
      this.mode === this.lastMode
    ) {
      return;
    }

    this.hudClock = 0;
    this.lastMeters = meters;
    this.lastMode = this.mode;

    if (this.mode === "play" && meters > this.bestMeters) {
      this.bestMeters = meters;
      writeBestMeters(meters);
    }

    this.onHud({
      mode: this.mode,
      meters,
      bones: this.bonesCollected,
      best: this.bestMeters,
    });
  }

  private commitBest() {
    const meters = Math.floor(this.playScroll / ART_PX_PER_METER);
    if (meters > this.bestMeters) {
      this.bestMeters = meters;
      writeBestMeters(meters);
      this.publishHud(0, true);
    }
  }

  /* ─── Spawners ─────────────────────────────────────────────────────────── */

  private spawnWoof() {
    const alreadyBarking = this.particles.some(
      (particle) => particle.sprite === WOOF && particle.life < 0.35,
    );
    if (alreadyBarking) return;

    const dog = DOG_RUN_FRAMES[0];
    this.particles.push({
      sprite: WOOF,
      x: this.dogX + dog.width - 4,
      y: this.groundY - this.dogHeight - dog.height - WOOF.height - 3,
      vx: 0,
      vy: -8,
      life: 0,
      maxLife: 0.9,
      alpha: 1,
      scale: 1,
    });
  }

  private spawnGo() {
    const dog = DOG_RUN_FRAMES[0];
    this.particles.push({
      sprite: GO,
      x: this.dogX + dog.width - 2,
      y: this.groundY - dog.height - GO.height - 10,
      vx: 2,
      vy: -14,
      life: 0,
      maxLife: 1.1,
      alpha: 1,
      scale: 1.2,
    });
  }

  private spawnCollect(bone: Bone) {
    this.particles.push({
      sprite: BONE,
      x: this.dogX + 10,
      y: this.groundY - bone.lift - BONE.height,
      vx: 4,
      vy: -22,
      life: 0,
      maxLife: 0.6,
      alpha: 0.9,
      scale: 1,
    });
    this.particles.push({
      sprite: PLUS_ONE,
      x: this.dogX + 16,
      y: this.groundY - bone.lift - PLUS_ONE.height - 4,
      vx: 0,
      vy: -18,
      life: 0,
      maxLife: 0.7,
      alpha: 1,
      scale: 1,
    });
  }

  private spawnDust(x: number) {
    for (let i = 0; i < 6; i += 1) {
      this.particles.push({
        sprite: CLOUD_SMALL,
        x: x - 6 + this.rng() * 12,
        y: this.groundY - 3 - this.rng() * 4,
        vx: -10 + this.rng() * 30,
        vy: -12 - this.rng() * 14,
        life: 0,
        maxLife: 0.45 + this.rng() * 0.25,
        alpha: 0.55,
        scale: 0.25,
      });
    }
  }

  /* ─── Static layers (regenerated on resize / palette / night change) ───── */

  private rebuildStatic() {
    if (this.width === 0 || this.height === 0) return;
    const rng = mulberry32(this.seed);
    const segment = Math.max(this.worldWidth, 420);

    this.layers = {
      far: this.buildFarLayer(rng, segment),
      near: this.buildNearLayer(rng, segment),
      ground: this.buildGroundLayer(rng, segment),
    };

    if (this.clouds.length === 0) {
      const count = this.worldWidth > 420 ? 5 : 3;
      for (let i = 0; i < count; i += 1) {
        this.clouds.push({
          sprite: rng() > 0.5 ? CLOUD_LARGE : CLOUD_SMALL,
          x: rng() * this.worldWidth,
          y: this.groundY - 70 - rng() * 70,
          drift: 1.5 + rng() * 2.5,
        });
      }
    }

    this.stars = [];
    const starCount = Math.round(this.worldWidth / 14);
    for (let i = 0; i < starCount; i += 1) {
      this.stars.push({
        x: rng() * this.worldWidth,
        y: this.groundY - 45 - rng() * 100,
        phase: rng() * Math.PI * 2,
      });
    }
  }

  private createLayer(width: number, height: number, parallax: number): Layer & {
    ctx: CanvasRenderingContext2D;
  } {
    const canvas = document.createElement("canvas");
    const scale = this.px * this.dpr;
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx, width, height, parallax };
  }

  private buildFarLayer(rng: () => number, segment: number): Layer {
    const layer = this.createLayer(segment, BAND_HEIGHT, 0.22);
    const { ctx } = layer;
    const ground = BAND_HEIGHT;
    const windowAlpha = this.night ? 0.55 : 0.26;

    let x = 0;
    while (x < segment - 8) {
      const width = Math.min(segment - x, 12 + Math.floor(rng() * 28));
      const height = 20 + Math.floor(rng() * 46);
      const top = ground - height;

      ctx.globalAlpha = 0.16;
      ctx.fillStyle = this.palette.ink;
      ctx.fillRect(x, top, width, height);

      const feature = rng();
      if (feature < 0.22) {
        ctx.fillRect(x + Math.floor(width / 2), top - 6, 1, 6);
      } else if (feature < 0.36 && width > 16) {
        ctx.fillRect(x + 3, top - 5, 6, 4);
        ctx.fillRect(x + 4, top - 1, 1, 1);
        ctx.fillRect(x + 7, top - 1, 1, 1);
      }

      ctx.globalAlpha = windowAlpha;
      ctx.fillStyle = this.palette.paper;
      for (let row = top + 3; row + 2 <= ground - 3; row += 4) {
        for (let col = x + 2; col + 2 <= x + width - 2; col += 4) {
          if (rng() < 0.42) ctx.fillRect(col, row, 2, 2);
        }
      }

      x += width + Math.floor(rng() * 4);
    }

    ctx.globalAlpha = 1;
    return layer;
  }

  private buildNearLayer(rng: () => number, segment: number): Layer {
    const layer = this.createLayer(segment, BAND_HEIGHT, 0.55);
    const { ctx } = layer;
    const ground = BAND_HEIGHT;
    const ink = this.palette.ink;
    const paper = this.palette.paper;
    const INK_ALPHA = 0.36;
    const PAPER_ALPHA = this.night ? 0.62 : 0.42;

    const fill = (
      color: string,
      alpha: number,
      rx: number,
      ry: number,
      rw: number,
      rh: number,
    ) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(rx, ry, rw, rh);
    };

    const drawHouse = (x: number) => {
      const width = 24 + Math.floor(rng() * 13);
      const wall = 14 + Math.floor(rng() * 7);
      const wallTop = ground - wall;
      fill(ink, INK_ALPHA, x, wallTop, width, wall);

      const roofRows = Math.min(10, Math.floor(width / 4));
      for (let i = 0; i < roofRows; i += 1) {
        const inset = Math.round((i * (width / 2 + 1)) / roofRows);
        fill(ink, INK_ALPHA, x - 1 + inset, wallTop - 1 - i, width + 2 - inset * 2, 1);
      }
      fill(ink, INK_ALPHA, x + width - 7, wallTop - roofRows + 1, 3, roofRows - 2);

      fill(paper, PAPER_ALPHA, x + 3, ground - 7, 4, 7);
      fill(paper, PAPER_ALPHA, x + width - 9, wallTop + 4, 4, 4);
      if (width > 30) fill(paper, PAPER_ALPHA, x + 10, wallTop + 4, 4, 4);
      return width;
    };

    const drawShop = (x: number) => {
      const width = 28 + Math.floor(rng() * 17);
      const height = 16 + Math.floor(rng() * 7);
      const top = ground - height;
      fill(ink, INK_ALPHA, x, top, width, height);
      fill(ink, INK_ALPHA, x - 1, top - 2, width + 2, 2);
      fill(paper, PAPER_ALPHA * 0.8, x + 3, top + 3, width - 6, 3);
      fill(paper, PAPER_ALPHA * 0.7, x + 2, ground - 11, width - 4, 8);
      for (let col = 0; col * 3 < width - 4; col += 1) {
        if (col % 2 === 0) fill(paper, PAPER_ALPHA, x + 2 + col * 3, ground - 13, Math.min(3, width - 4 - col * 3), 2);
      }
      return width;
    };

    const drawTree = (x: number) => {
      const radius = 5 + Math.floor(rng() * 4);
      const cx = x + radius;
      const cy = ground - 8 - radius + 1;
      fill(ink, INK_ALPHA, cx - 1, ground - 8, 3, 8);
      for (let dy = -radius; dy <= radius; dy += 1) {
        const half = Math.floor(Math.sqrt(radius * radius - dy * dy));
        fill(ink, INK_ALPHA, cx - half, cy + dy, half * 2 + 1, 1);
      }
      return radius * 2 + 2;
    };

    const drawLamp = (x: number) => {
      fill(ink, INK_ALPHA + 0.1, x, ground - 26, 2, 26);
      fill(ink, INK_ALPHA + 0.1, x, ground - 26, 6, 1);
      fill(paper, this.night ? 0.9 : PAPER_ALPHA, x + 4, ground - 26, 4, 3);
      if (this.night) {
        const gradient = ctx.createRadialGradient(x + 6, ground - 24, 1, x + 6, ground - 24, 14);
        gradient.addColorStop(0, paper);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 8, ground - 38, 28, 38);
      }
      return 8;
    };

    const drawMailbox = (x: number) => {
      fill(ink, INK_ALPHA + 0.05, x + 1, ground - 6, 2, 6);
      fill(ink, INK_ALPHA + 0.05, x, ground - 11, 5, 5);
      return 6;
    };

    let x = 4;
    while (x < segment - 20) {
      const roll = rng();
      let width: number;
      if (roll < 0.28) width = drawHouse(x);
      else if (roll < 0.46) width = drawShop(x);
      else if (roll < 0.7) width = drawTree(x);
      else if (roll < 0.84) width = drawLamp(x);
      else if (roll < 0.92) width = drawMailbox(x);
      else width = 6 + Math.floor(rng() * 12);
      x += width + 4 + Math.floor(rng() * 12);
    }

    ctx.globalAlpha = 1;
    return layer;
  }

  private buildGroundLayer(rng: () => number, segment: number): Layer {
    const layer = this.createLayer(segment, GROUND_LAYER_HEIGHT, 1);
    const { ctx } = layer;
    ctx.fillStyle = this.palette.ink;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, 0, segment, 1);

    ctx.globalAlpha = 0.5;
    const pebbles = Math.floor(segment / 9);
    for (let i = 0; i < pebbles; i += 1) {
      ctx.fillRect(Math.floor(rng() * segment), 2 + Math.floor(rng() * 4), 1 + Math.floor(rng() * 2), 1);
    }
    ctx.globalAlpha = 1;
    return layer;
  }

  /* ─── Rendering ────────────────────────────────────────────────────────── */

  private draw() {
    if (this.width === 0 || this.height === 0 || !this.layers) return;
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.imageSmoothingEnabled = false;

    const groundY = this.groundY;

    this.drawSky();
    for (const cloud of this.clouds) {
      this.drawSprite(cloud.sprite, cloud.x, cloud.y, this.night ? 0.2 : 0.34);
    }
    for (const bird of this.birds) {
      const frame = BIRD_FRAMES[Math.floor(bird.flap / 0.18) % BIRD_FRAMES.length];
      this.drawSprite(frame, bird.x, bird.y, 0.7);
    }

    this.drawLayer(this.layers.far, groundY - BAND_HEIGHT);
    this.drawLayer(this.layers.near, groundY - BAND_HEIGHT);
    this.drawLayer(this.layers.ground, groundY);

    for (const bone of this.bones) {
      const bob = Math.round(Math.sin(bone.phase) * 1.5);
      this.drawSprite(BONE, bone.x, groundY - bone.lift - BONE.height + bob, 0.95);
    }

    for (const obstacle of this.obstacles) {
      this.drawObstacle(obstacle, groundY);
    }

    this.drawDog(groundY);

    for (const particle of this.particles) {
      const progress = particle.life / particle.maxLife;
      const alpha = particle.alpha * (1 - progress * progress);
      this.drawSprite(particle.sprite, particle.x, particle.y, alpha, particle.scale);
    }

    ctx.globalAlpha = 1;
  }

  private drawSky() {
    const groundY = this.groundY;
    const orbX = Math.round(this.worldWidth * 0.78);
    const orbY = groundY - 96;

    if (this.night) {
      const t = this.elapsed;
      for (const star of this.stars) {
        const twinkle = 0.35 + 0.35 * Math.sin(t * 1.6 + star.phase);
        this.fillRect(star.x, star.y, 1, 1, this.palette.paper, twinkle);
      }
      this.drawSprite(MOON, orbX, orbY, 0.7, 2);
    } else {
      this.drawSprite(SUN, orbX, orbY, 0.45, 2);
    }
  }

  private drawLayer(layer: Layer, topY: number) {
    const { ctx, px } = this;
    const offset = -((this.scroll * layer.parallax) % layer.width);
    const destWidth = layer.width * px;
    const destHeight = layer.height * px;
    const y = Math.round(topY * px);

    for (let x = offset; x < this.worldWidth; x += layer.width) {
      ctx.drawImage(layer.canvas, Math.round(x * px), y, destWidth, destHeight);
    }
  }

  private drawObstacle(obstacle: Obstacle, groundY: number) {
    const { sprite, x } = obstacle;
    if (!obstacle.knocked) {
      this.drawSprite(sprite, x, groundY - sprite.height, 0.95);
      return;
    }

    const { ctx, px } = this;
    const progress = clamp(obstacle.knockedFor / 0.28, 0, 1);
    const angle = (Math.PI / 2) * (1 - (1 - progress) * (1 - progress));
    const pivotX = Math.round((x + sprite.width) * px);
    const pivotY = Math.round(groundY * px);

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.95;
    const image = this.getSpriteImage(sprite);
    ctx.drawImage(image, -sprite.width * px, -sprite.height * px, sprite.width * px, sprite.height * px);
    ctx.restore();
  }

  private drawDog(groundY: number) {
    const sprite = this.grounded ? DOG_RUN_FRAMES[this.runFrame] : DOG_LEAP;
    const blink = this.stumble > 0 && Math.floor(this.stumble * 14) % 2 === 0;
    const alpha = blink ? 0.3 : 1;
    const y = groundY - this.dogHeight - sprite.height;
    this.drawSprite(sprite, this.dogX, y, alpha);
  }

  private fillRect(x: number, y: number, w: number, h: number, color: string, alpha: number) {
    const { ctx, px } = this;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x) * px, Math.round(y) * px, w * px, h * px);
  }

  private drawSprite(sprite: Sprite, x: number, y: number, alpha = 1, scale = 1) {
    const { ctx, px } = this;
    const image = this.getSpriteImage(sprite);
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      image,
      Math.round(x) * px,
      Math.round(y) * px,
      sprite.width * px * scale,
      sprite.height * px * scale,
    );
  }

  private getSpriteImage(sprite: Sprite) {
    const cached = this.spriteCache.get(sprite);
    if (cached) return cached;

    const scale = this.px * this.dpr;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(sprite.width * scale);
    canvas.height = Math.ceil(sprite.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");

    const colors: Record<string, string> = {
      "#": this.palette.ink,
      o: this.palette.paper,
      c: this.palette.collar,
    };

    sprite.rows.forEach((row, rowIndex) => {
      for (let col = 0; col < row.length; col += 1) {
        const color = colors[row[col]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(col * scale, rowIndex * scale, scale, scale);
      }
    });

    this.spriteCache.set(sprite, canvas);
    return canvas;
  }
}
