export type WeaponId = "blaster" | "rocket" | "vortex" | "zap";

export const WEAPONS = [
  "blaster",
  "rocket",
  "vortex",
  "zap",
] as const satisfies readonly WeaponId[];

export const WEAPON_LABELS: Record<WeaponId, string> = {
  blaster: "Neon Blaster",
  rocket: "Rocket Launcher",
  vortex: "Void Orb",
  zap: "Arc Gun",
};

export const WEAPON_ICON_SRC: Record<WeaponId, string> = {
  blaster: "/destroy/sprites/icon-blaster.png",
  rocket: "/destroy/sprites/icon-rocket.png",
  vortex: "/destroy/sprites/icon-vortex.png",
  zap: "/destroy/sprites/icon-zap.png",
};

export function clampWeaponIndex(index: number): number {
  if (!Number.isFinite(index)) return 0;
  const max = WEAPONS.length - 1;
  return Math.min(max, Math.max(0, Math.trunc(index)));
}

export function cycleWeaponIndex(index: number, delta: number): number {
  const len = WEAPONS.length;
  const start = clampWeaponIndex(index);
  const step = Math.trunc(delta);
  return ((start + step) % len + len) % len;
}

export type WeaponConfig = {
  id: WeaponId;
  /** Max simultaneous live projectiles of this type */
  maxLive: number;
  /** Blast / damage radius in CSS pixels (0 = single-target point) */
  radius: number;
  /** Damage applications per impact */
  hits: number;
  /** Seconds a scar stays fully visible before it starts covering over */
  holeHold: number;
  /** Seconds spent fading/covering after the hold */
  holeFade: number;
  /** Relative scar size multiplier for holes from this weapon */
  holeScale: number;
};

export const WEAPON_CONFIG: Record<WeaponId, WeaponConfig> = {
  blaster: {
    id: "blaster",
    maxLive: 12,
    radius: 0,
    hits: 1,
    holeHold: 1.1,
    holeFade: 0.9,
    holeScale: 0.95,
  },
  rocket: {
    id: "rocket",
    maxLive: 4,
    radius: 78,
    hits: 5,
    holeHold: 2.4,
    holeFade: 1.6,
    holeScale: 1.2,
  },
  vortex: {
    id: "vortex",
    maxLive: 3,
    radius: 120,
    hits: 7,
    holeHold: 3.4,
    holeFade: 2.4,
    holeScale: 1.4,
  },
  zap: {
    id: "zap",
    maxLive: 6,
    radius: 54,
    hits: 4,
    holeHold: 1.7,
    holeFade: 1.3,
    holeScale: 0.85,
  },
};

/** Total seconds until a scar from this weapon is fully covered. */
export function weaponHoleLife(cfg: WeaponConfig): number {
  return Math.max(0.2, cfg.holeHold + cfg.holeFade);
}
