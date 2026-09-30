import assert from "node:assert/strict";
import test from "node:test";

import {
  BOSS_SCORE_THRESHOLD,
  DOM_DESTROY_SCORE,
  ENEMY_SCORE,
  ENEMY_STATS,
  ENV_PROP_STATS,
  PLAYER_MAX_HP,
  randomEnemyKind,
  spawnEnemyAtEdge,
  spawnEnvProps,
  spawnPickupRandom,
  steerEnemyToward,
} from "./combat.ts";

test("PLAYER_MAX_HP is a positive pool", () => {
  assert.ok(PLAYER_MAX_HP >= 50);
});

test("boss score threshold is reachable via enemy kills", () => {
  assert.ok(BOSS_SCORE_THRESHOLD >= 500);
  assert.ok(ENEMY_SCORE.roach > 0);
  assert.ok(ENEMY_SCORE.slime >= ENEMY_SCORE.roach);
  assert.ok(DOM_DESTROY_SCORE > 0);
  const killsNeeded = Math.ceil(BOSS_SCORE_THRESHOLD / ENEMY_SCORE.roach);
  assert.ok(killsNeeded <= 15);
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

test("spawnEnvProps scatters destructible 8-bit props", () => {
  const props = spawnEnvProps(1000, 800, 8);
  assert.equal(props.length, 8);
  for (const prop of props) {
    assert.ok(["crate", "barrel", "bush", "rock"].includes(prop.kind));
    assert.equal(prop.hp, ENV_PROP_STATS[prop.kind].hp);
    assert.ok(prop.x > 40 && prop.x < 960);
    assert.ok(prop.y > 40 && prop.y < 760);
  }
});
