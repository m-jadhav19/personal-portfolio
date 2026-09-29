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
  assert.deepEqual([...WEAPONS], ["blaster", "missile", "bomb", "swarm"]);
});

test("heavier weapons scar longer and wider", () => {
  const blaster = WEAPON_CONFIG.blaster;
  const missile = WEAPON_CONFIG.missile;
  const bomb = WEAPON_CONFIG.bomb;
  const swarm = WEAPON_CONFIG.swarm;

  assert.ok(weaponHoleLife(blaster) < weaponHoleLife(missile));
  assert.ok(weaponHoleLife(missile) < weaponHoleLife(bomb));
  assert.ok(weaponHoleLife(swarm) > weaponHoleLife(blaster));
  assert.ok(blaster.radius < missile.radius);
  assert.ok(missile.radius < bomb.radius);
  assert.ok(bomb.holeScale > blaster.holeScale);
});
