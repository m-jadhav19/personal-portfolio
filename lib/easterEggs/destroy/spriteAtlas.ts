export const DESTROY_SPRITE_PATHS = {
  characterIdle: "/destroy/sprites/character-idle.svg",
  characterWalkA: "/destroy/sprites/character-walk-a.svg",
  characterWalkB: "/destroy/sprites/character-walk-b.svg",
  gun: "/destroy/sprites/gun.svg",
  blasterBolt: "/destroy/sprites/blaster-bolt.svg",
  rocket: "/destroy/sprites/rocket.svg",
  vortex: "/destroy/sprites/vortex.svg",
  explosion: "/destroy/sprites/explosion.svg",
  holeA: "/destroy/sprites/hole-a.svg",
  holeB: "/destroy/sprites/hole-b.svg",
  holeC: "/destroy/sprites/hole-c.svg",
  crack: "/destroy/sprites/crack.svg",
  iconBlaster: "/destroy/sprites/icon-blaster.svg",
  iconRocket: "/destroy/sprites/icon-rocket.svg",
  iconVortex: "/destroy/sprites/icon-vortex.svg",
  iconZap: "/destroy/sprites/icon-zap.svg",
  enemyRoach: "/destroy/sprites/enemy-roach.svg",
  enemyRoach1: "/destroy/sprites/enemy-roach-1.svg",
  enemyRoach2: "/destroy/sprites/enemy-roach-2.svg",
  enemyRoach3: "/destroy/sprites/enemy-roach-3.svg",
  enemyDrone: "/destroy/sprites/enemy-drone.svg",
  enemyDrone1: "/destroy/sprites/enemy-drone-1.svg",
  enemyDrone2: "/destroy/sprites/enemy-drone-2.svg",
  enemyDrone3: "/destroy/sprites/enemy-drone-3.svg",
  enemySlime: "/destroy/sprites/enemy-slime.svg",
  enemySlime1: "/destroy/sprites/enemy-slime-1.svg",
  enemySlime2: "/destroy/sprites/enemy-slime-2.svg",
  enemySlime3: "/destroy/sprites/enemy-slime-3.svg",
  pickupHealth: "/destroy/sprites/pickup-health.svg",
  pickupShield: "/destroy/sprites/pickup-shield.svg",
  pickupRapid: "/destroy/sprites/pickup-rapid.svg",
  envCrate: "/destroy/sprites/env-crate.svg",
  envBarrel: "/destroy/sprites/env-barrel.svg",
  envBush: "/destroy/sprites/env-bush.svg",
  envRock: "/destroy/sprites/env-rock.svg",
  envTile: "/destroy/sprites/env-tile.svg",
} as const;

export type DestroySpriteId = keyof typeof DESTROY_SPRITE_PATHS;

/** Matches sprite-manifest.json animation timing (120ms / frame). */
export const ENEMY_FRAME_MS = 120;

export const ENEMY_ANIM_FRAMES: Record<
  "roach" | "drone" | "slime",
  readonly DestroySpriteId[]
> = {
  roach: ["enemyRoach1", "enemyRoach2", "enemyRoach3"],
  drone: ["enemyDrone1", "enemyDrone2", "enemyDrone3"],
  slime: ["enemySlime1", "enemySlime2", "enemySlime3"],
};

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
