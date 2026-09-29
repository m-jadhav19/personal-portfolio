export type WeaponId = "blaster" | "missile" | "bomb" | "swarm";

export const WEAPONS = [
  "blaster",
  "missile",
  "bomb",
  "swarm",
] as const satisfies readonly WeaponId[];

export const WEAPON_LABELS: Record<WeaponId, string> = {
  blaster: "Blaster",
  missile: "Missile",
  bomb: "Bomb",
  swarm: "Roaches",
};

export const WEAPON_ICON_SRC: Record<WeaponId, string> = {
  blaster: "/destroy/sprites/icon-blaster.png",
  missile: "/destroy/sprites/icon-missile.png",
  bomb: "/destroy/sprites/icon-bomb.png",
  swarm: "/destroy/sprites/icon-roach.png",
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
  missile: {
    id: "missile",
    maxLive: 4,
    radius: 72,
    hits: 4,
    holeHold: 2.4,
    holeFade: 1.6,
    holeScale: 1.15,
  },
  bomb: {
    id: "bomb",
    maxLive: 3,
    radius: 110,
    hits: 6,
    holeHold: 3.2,
    holeFade: 2.2,
    holeScale: 1.35,
  },
  swarm: {
    id: "swarm",
    maxLive: 2,
    radius: 40,
    hits: 3,
    holeHold: 1.6,
    holeFade: 1.2,
    holeScale: 0.7,
  },
};

/** Total seconds until a scar from this weapon is fully covered. */
export function weaponHoleLife(cfg: WeaponConfig): number {
  return Math.max(0.2, cfg.holeHold + cfg.holeFade);
}
