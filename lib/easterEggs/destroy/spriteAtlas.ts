export const DESTROY_SPRITE_PATHS = {
  characterIdle: "/destroy/sprites/character-idle.png",
  characterWalkA: "/destroy/sprites/character-walk-a.png",
  characterWalkB: "/destroy/sprites/character-walk-b.png",
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
} as const;

export type DestroySpriteId = keyof typeof DESTROY_SPRITE_PATHS;

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

export const HOLE_VARIANTS = ["holeA", "holeB", "holeC"] as const;
export type HoleVariant = (typeof HOLE_VARIANTS)[number];
