import assert from "node:assert/strict";
import test from "node:test";

import {
  WEAPONS,
  clampWeaponIndex,
  cycleWeaponIndex,
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
