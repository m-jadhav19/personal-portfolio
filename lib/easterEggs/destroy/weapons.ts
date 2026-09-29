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
  /** Blast radius in CSS pixels (0 = single-target) */
  radius: number;
  /** Damage applications per impact */
  hits: number;
};

export const WEAPON_CONFIG: Record<WeaponId, WeaponConfig> = {
  blaster: { id: "blaster", maxLive: 12, radius: 0, hits: 1 },
  missile: { id: "missile", maxLive: 4, radius: 72, hits: 4 },
  bomb: { id: "bomb", maxLive: 3, radius: 96, hits: 6 },
  swarm: { id: "swarm", maxLive: 2, radius: 40, hits: 3 },
};
