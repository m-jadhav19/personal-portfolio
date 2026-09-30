export const DESTROY_SPRITE_PATHS = {
  characterIdle: "/destroy/sprites/character-idle.png",
  characterIdle1: "/destroy/sprites/character-idle-1.png",
  characterIdle2: "/destroy/sprites/character-idle-2.png",
  characterIdle3: "/destroy/sprites/character-idle-3.png",
  characterIdle4: "/destroy/sprites/character-idle-4.png",
  characterIdle5: "/destroy/sprites/character-idle-5.png",
  characterIdle6: "/destroy/sprites/character-idle-6.png",
  characterIdle7: "/destroy/sprites/character-idle-7.png",
  characterWalkA: "/destroy/sprites/character-walk-a.png",
  characterWalkB: "/destroy/sprites/character-walk-b.png",
  characterWalk1: "/destroy/sprites/character-walk-1.png",
  characterWalk2: "/destroy/sprites/character-walk-2.png",
  characterWalk3: "/destroy/sprites/character-walk-3.png",
  characterWalk4: "/destroy/sprites/character-walk-4.png",
  characterWalk5: "/destroy/sprites/character-walk-5.png",
  characterWalk6: "/destroy/sprites/character-walk-6.png",
  gun: "/destroy/sprites/gun.png",
  blasterBolt: "/destroy/sprites/blaster-bolt.png",
  rocket: "/destroy/sprites/rocket.png",
  vortex: "/destroy/sprites/vortex.png",
  explosion: "/destroy/sprites/explosion.png",
  holeA: "/destroy/sprites/hole-a.png",
  holeB: "/destroy/sprites/hole-b.png",
  holeC: "/destroy/sprites/hole-c.png",
  crack: "/destroy/sprites/crack.png",
  iconBlaster: "/destroy/sprites/icon-blaster.png",
  iconRocket: "/destroy/sprites/icon-rocket.png",
  iconVortex: "/destroy/sprites/icon-vortex.png",
  iconZap: "/destroy/sprites/icon-zap.png",
  enemyRoach: "/destroy/sprites/enemy-roach.png",
  enemyRoach1: "/destroy/sprites/enemy-roach-1.png",
  enemyRoach2: "/destroy/sprites/enemy-roach-2.png",
  enemyRoach3: "/destroy/sprites/enemy-roach-3.png",
  enemyRoach4: "/destroy/sprites/enemy-roach-4.png",
  enemyRoach5: "/destroy/sprites/enemy-roach-5.png",
  enemyRoach6: "/destroy/sprites/enemy-roach-6.png",
  enemyDrone: "/destroy/sprites/enemy-drone.png",
  enemyDrone1: "/destroy/sprites/enemy-drone-1.png",
  enemyDrone2: "/destroy/sprites/enemy-drone-2.png",
  enemyDrone3: "/destroy/sprites/enemy-drone-3.png",
  enemyDrone4: "/destroy/sprites/enemy-drone-4.png",
  enemyDrone5: "/destroy/sprites/enemy-drone-5.png",
  enemyDrone6: "/destroy/sprites/enemy-drone-6.png",
  enemySlime: "/destroy/sprites/enemy-slime.png",
  enemySlime1: "/destroy/sprites/enemy-slime-1.png",
  enemySlime2: "/destroy/sprites/enemy-slime-2.png",
  enemySlime3: "/destroy/sprites/enemy-slime-3.png",
  enemySlime4: "/destroy/sprites/enemy-slime-4.png",
  enemySlime5: "/destroy/sprites/enemy-slime-5.png",
  enemySlime6: "/destroy/sprites/enemy-slime-6.png",
  pickupHealth: "/destroy/sprites/pickup-health.png",
  pickupShield: "/destroy/sprites/pickup-shield.png",
  pickupRapid: "/destroy/sprites/pickup-rapid.png",
  envCrate: "/destroy/sprites/env-crate.png",
  envBarrel: "/destroy/sprites/env-barrel.png",
  envBush: "/destroy/sprites/env-bush.png",
  envRock: "/destroy/sprites/env-rock.png",
  envTile: "/destroy/sprites/env-tile.png",
} as const;

export type DestroySpriteId = keyof typeof DESTROY_SPRITE_PATHS;

/** Matches sheet-crop-manifest.json animation timing (120ms / frame). */
export const ENEMY_FRAME_MS = 120;

export const ENEMY_ANIM_FRAMES: Record<
  "roach" | "drone" | "slime",
  readonly DestroySpriteId[]
> = {
  roach: [
    "enemyRoach1",
    "enemyRoach2",
    "enemyRoach3",
    "enemyRoach4",
    "enemyRoach5",
    "enemyRoach6",
  ],
  drone: [
    "enemyDrone1",
    "enemyDrone2",
    "enemyDrone3",
    "enemyDrone4",
    "enemyDrone5",
    "enemyDrone6",
  ],
  slime: [
    "enemySlime1",
    "enemySlime2",
    "enemySlime3",
    "enemySlime4",
    "enemySlime5",
    "enemySlime6",
  ],
};

export const CHARACTER_IDLE_FRAMES = [
  "characterIdle1",
  "characterIdle2",
  "characterIdle3",
  "characterIdle4",
  "characterIdle5",
  "characterIdle6",
  "characterIdle7",
] as const satisfies readonly DestroySpriteId[];

export const CHARACTER_WALK_FRAMES = [
  "characterWalk1",
  "characterWalk2",
  "characterWalk3",
  "characterWalk4",
  "characterWalk5",
  "characterWalk6",
] as const satisfies readonly DestroySpriteId[];

export type DestroySpriteAtlas = {
  ready: Promise<void>;
  get: (id: DestroySpriteId) => HTMLImageElement | null;
  isReady: () => boolean;
};

export function loadDestroySpriteAtlas(): DestroySpriteAtlas {
  const images = new Map<DestroySpriteId, HTMLImageElement>();
  let readyFlag = false;

  const entries = Object.entries(DESTROY_SPRITE_PATHS) as [
    DestroySpriteId,
    string,
  ][];

  const ready = Promise.all(
    entries.map(
      ([id, src]) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            images.set(id, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => {
    readyFlag = true;
  });

  return {
    ready,
    get(id) {
      return images.get(id) ?? null;
    },
    isReady() {
      return readyFlag;
    },
  };
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  opts?: {
    facing?: 1 | -1;
    scale?: number;
    rotation?: number;
    alpha?: number;
  },
) {
  if (!img || !img.complete || img.naturalWidth === 0) return false;
  const scale = opts?.scale ?? 1;
  const facing = opts?.facing ?? 1;
  const rotation = opts?.rotation ?? 0;
  const alpha = opts?.alpha ?? 1;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x), Math.round(y));
  if (rotation) ctx.rotate(rotation);
  if (facing < 0) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  return true;
}

export function enemyAnimFrame(
  kind: "roach" | "drone" | "slime",
  phaseSeconds: number,
): DestroySpriteId {
  const frames = ENEMY_ANIM_FRAMES[kind];
  const idx =
    Math.floor((Math.max(0, phaseSeconds) * 1000) / ENEMY_FRAME_MS) %
    frames.length;
  return frames[idx];
}

export function characterAnimFrame(
  moving: boolean,
  walkPhase: number,
): DestroySpriteId {
  // walkPhase is an engine accumulator (~14/sec while moving), not wall-clock.
  const frames = moving ? CHARACTER_WALK_FRAMES : CHARACTER_IDLE_FRAMES;
  const rate = moving ? 1.15 : 0.7;
  const idx =
    Math.floor(Math.abs(walkPhase) * rate) % frames.length;
  return frames[idx];
}

export const HOLE_VARIANTS = ["holeA", "holeB", "holeC"] as const;
export type HoleVariant = (typeof HOLE_VARIANTS)[number];

export const ENEMY_SPRITE: Record<"roach" | "drone" | "slime", DestroySpriteId> =
  {
    roach: "enemyRoach",
    drone: "enemyDrone",
    slime: "enemySlime",
  };

export const PICKUP_SPRITE: Record<
  "health" | "shield" | "rapid",
  DestroySpriteId
> = {
  health: "pickupHealth",
  shield: "pickupShield",
  rapid: "pickupRapid",
};

export const ENV_SPRITE: Record<
  "crate" | "barrel" | "bush" | "rock",
  DestroySpriteId
> = {
  crate: "envCrate",
  barrel: "envBarrel",
  bush: "envBush",
  rock: "envRock",
};
