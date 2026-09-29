export const DESTROY_SPRITE_PATHS = {
  characterIdle: "/destroy/sprites/character-idle.png",
  characterWalkA: "/destroy/sprites/character-walk-a.png",
  characterWalkB: "/destroy/sprites/character-walk-b.png",
  gun: "/destroy/sprites/gun.png",
  blasterBolt: "/destroy/sprites/blaster-bolt.png",
  missile: "/destroy/sprites/missile.png",
  bomb: "/destroy/sprites/bomb.png",
  roach: "/destroy/sprites/roach.png",
  explosion: "/destroy/sprites/explosion.png",
  iconBlaster: "/destroy/sprites/icon-blaster.png",
  iconMissile: "/destroy/sprites/icon-missile.png",
  iconBomb: "/destroy/sprites/icon-bomb.png",
  iconRoach: "/destroy/sprites/icon-roach.png",
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
          img.onerror = () => {
            // Keep going — engine falls back to procedural draw if missing.
            resolve();
          };
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
  },
) {
  if (!img || !img.complete || img.naturalWidth === 0) return false;
  const scale = opts?.scale ?? 1;
  const facing = opts?.facing ?? 1;
  const rotation = opts?.rotation ?? 0;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (rotation) ctx.rotate(rotation);
  if (facing < 0) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  return true;
}
