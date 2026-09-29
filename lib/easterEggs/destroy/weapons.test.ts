import assert from "node:assert/strict";
import test from "node:test";

import {
  WEAPON_CONFIG,
  WEAPONS,
  clampWeaponIndex,
  cycleWeaponIndex,
  weaponHoleLife,
} from "./weapons.ts";

test("clampWeaponIndex clamps to valid range", () => {
  assert.equal(clampWeaponIndex(-3), 0);
  assert.equal(clampWeaponIndex(0), 0);
  assert.equal(clampWeaponIndex(2), 2);
  assert.equal(clampWeaponIndex(99), WEAPONS.length - 1);
  assert.equal(clampWeaponIndex(Number.NaN), 0);
});

test("cycleWeaponIndex wraps forward and backward", () => {
  assert.equal(cycleWeaponIndex(0, 1), 1);
  assert.equal(cycleWeaponIndex(WEAPONS.length - 1, 1), 0);
  assert.equal(cycleWeaponIndex(0, -1), WEAPONS.length - 1);
  assert.equal(cycleWeaponIndex(2, 2), 0);
});

test("WEAPONS lists the chaos kit in order", () => {
  assert.deepEqual([...WEAPONS], ["blaster", "rocket", "vortex", "zap"]);
});

test("heavier weapons scar longer and wider", () => {
  const blaster = WEAPON_CONFIG.blaster;
  const rocket = WEAPON_CONFIG.rocket;
  const vortex = WEAPON_CONFIG.vortex;
  const zap = WEAPON_CONFIG.zap;

  assert.ok(weaponHoleLife(blaster) < weaponHoleLife(rocket));
  assert.ok(weaponHoleLife(rocket) < weaponHoleLife(vortex));
  assert.ok(weaponHoleLife(zap) > weaponHoleLife(blaster));
  assert.ok(blaster.radius < rocket.radius);
  assert.ok(rocket.radius < vortex.radius);
  assert.ok(vortex.holeScale > blaster.holeScale);
});
