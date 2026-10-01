/** 8 compass dirs matching the sheet column order (L→R). */
export const AIM_DIRS = ["r", "ur", "u", "ul", "l", "dl", "d", "dr"] as const;
export type AimDir = (typeof AIM_DIRS)[number];

export type PlayerPose = "idle" | "aim" | "shoot";

const playerPath = (pose: PlayerPose, dir: AimDir) =>
  `/destroy/sprites/player-${pose}-${dir}.png`;
const walkPath = (frame: number, dir: AimDir) =>
  `/destroy/sprites/walk-${frame}-${dir}.png`;
const gunPath = (dir: AimDir) => `/destroy/sprites/gun-${dir}.png`;

function buildPaths() {
  const paths: Record<string, string> = {
    // Compat fallbacks
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
    enemyRoach: "/destroy/sprites/enemy-roach.png",
    enemyDrone: "/destroy/sprites/enemy-drone.png",
    enemySlime: "/destroy/sprites/enemy-slime.png",
    pickupHealth: "/destroy/sprites/pickup-health.png",
    pickupShield: "/destroy/sprites/pickup-shield.png",
    pickupRapid: "/destroy/sprites/pickup-rapid.png",
    envCrate: "/destroy/sprites/env-crate.png",
    envBarrel: "/destroy/sprites/env-barrel.png",
    envBush: "/destroy/sprites/env-bush.png",
    envRock: "/destroy/sprites/env-rock.png",
    envTile: "/destroy/sprites/env-tile.png",
  };

  for (const dir of AIM_DIRS) {
    for (const pose of ["idle", "aim", "shoot"] as const) {
      paths[`player_${pose}_${dir}`] = playerPath(pose, dir);
    }
    paths[`gun_${dir}`] = gunPath(dir);
    for (let f = 1; f <= 6; f++) {
      paths[`walk_${f}_${dir}`] = walkPath(f, dir);
    }
  }

  for (const kind of ["roach", "drone", "slime"] as const) {
    for (let f = 1; f <= 6; f++) {
      const key =
        kind === "roach"
          ? `enemyRoach${f}`
          : kind === "drone"
            ? `enemyDrone${f}`
            : `enemySlime${f}`;
      paths[key] = `/destroy/sprites/enemy-${kind}-${f}.png`;
    }
  }

  return paths as Record<string, string>;
}

export const DESTROY_SPRITE_PATHS = buildPaths();

export type DestroySpriteId = keyof typeof DESTROY_SPRITE_PATHS;

/** Matches sheet-crop-manifest.json animation timing. */
export const ENEMY_FRAME_MS = 100;
export const WALK_FRAME_MS = 90;

/** Loop the first 4 frames — later sheet frames are death/attack tells. */
export const ENEMY_ANIM_FRAMES: Record<
  "roach" | "drone" | "slime",
  readonly DestroySpriteId[]
> = {
  roach: ["enemyRoach1", "enemyRoach2", "enemyRoach3", "enemyRoach4"],
  drone: ["enemyDrone1", "enemyDrone2", "enemyDrone3", "enemyDrone4"],
  slime: ["enemySlime1", "enemySlime2", "enemySlime3", "enemySlime4"],
};

/** Legacy 2-frame walk ids (compat). */
export const CHARACTER_IDLE_FRAMES = [
  "characterIdle",
] as const satisfies readonly DestroySpriteId[];

export const CHARACTER_WALK_FRAMES = [
  "characterWalkA",
  "characterWalkB",
] as const satisfies readonly DestroySpriteId[];

/**
 * Map a canvas aim angle (atan2(dy, dx), y-down) to one of 8 sheet directions.
 * Right=0, down=+π/2, left=±π, up=-π/2 → r, dr, d, dl, l, ul, u, ur.
 */
export function aimAngleToDir(angle: number): AimDir {
  const TWO_PI = Math.PI * 2;
  let a = angle % TWO_PI;
  if (a < 0) a += TWO_PI;
  const sector = Math.round(a / (Math.PI / 4)) % 8;
  const map: AimDir[] = ["r", "dr", "d", "dl", "l", "ul", "u", "ur"];
  return map[sector];
}

export function playerSpriteId(
  pose: PlayerPose,
  dir: AimDir,
): DestroySpriteId {
  return `player_${pose}_${dir}` as DestroySpriteId;
}

export function walkSpriteId(frame1to6: number, dir: AimDir): DestroySpriteId {
  const f = Math.min(6, Math.max(1, frame1to6));
  return `walk_${f}_${dir}` as DestroySpriteId;
}

export function gunSpriteId(dir: AimDir): DestroySpriteId {
  return `gun_${dir}` as DestroySpriteId;
}

export function characterDirFrame(
  moving: boolean,
  shooting: boolean,
  walkPhase: number,
  aimAngle: number,
): DestroySpriteId {
  const dir = aimAngleToDir(aimAngle);
  // Shoot pose wins briefly so muzzle flash tracks the cursor octant.
  if (shooting) return playerSpriteId("shoot", dir);
  if (moving) {
    const frame = (Math.floor(Math.abs(walkPhase) * 1.15) % 6) + 1;
    return walkSpriteId(frame, dir);
  }
  return playerSpriteId("aim", dir);
}

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

/** @deprecated Prefer characterDirFrame for 8-dir sheet. */
export function characterAnimFrame(
  moving: boolean,
  walkPhase: number,
): DestroySpriteId {
  const frames = moving ? CHARACTER_WALK_FRAMES : CHARACTER_IDLE_FRAMES;
  const rate = moving ? 1.15 : 0.7;
  const idx = Math.floor(Math.abs(walkPhase) * rate) % frames.length;
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

/** Muzzle offset from character center toward aim (px), for projectile spawn. */
export function muzzleOffset(aimAngle: number, dist = 26): {
  x: number;
  y: number;
} {
  return {
    x: Math.cos(aimAngle) * dist,
    y: Math.sin(aimAngle) * dist,
  };
}
