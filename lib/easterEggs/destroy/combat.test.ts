import assert from "node:assert/strict";
import test from "node:test";

import {
  ENEMY_STATS,
  PLAYER_MAX_HP,
  randomEnemyKind,
  spawnEnemyAtEdge,
  spawnPickupRandom,
  steerEnemyToward,
} from "./combat.ts";

test("PLAYER_MAX_HP is a positive pool", () => {
  assert.ok(PLAYER_MAX_HP >= 50);
});

test("spawnEnemyAtEdge places foes outside the viewport", () => {
  const enemy = spawnEnemyAtEdge(800, 600, "roach");
  const outside =
    enemy.x < 0 ||
    enemy.y < 0 ||
    enemy.x > 800 ||
    enemy.y > 600;
  assert.equal(outside, true);
  assert.equal(enemy.hp, ENEMY_STATS.roach.hp);
});

test("steerEnemyToward moves toward the player", () => {
  const enemy = spawnEnemyAtEdge(400, 400, "drone");
  enemy.x = 0;
  enemy.y = 0;
  const before = Math.hypot(200 - enemy.x, 200 - enemy.y);
  steerEnemyToward(enemy, 200, 200, 0.2);
  const after = Math.hypot(200 - enemy.x, 200 - enemy.y);
  assert.ok(after < before);
});

test("spawnPickupRandom stays in bounds", () => {
  const pickup = spawnPickupRandom(1000, 800);
  assert.ok(pickup.x > 40 && pickup.x < 960);
  assert.ok(pickup.y > 40 && pickup.y < 760);
  assert.ok(["health", "shield", "rapid"].includes(pickup.kind));
});

test("randomEnemyKind returns a known kind", () => {
  for (let i = 0; i < 20; i++) {
    assert.ok(["roach", "drone", "slime"].includes(randomEnemyKind()));
  }
});
