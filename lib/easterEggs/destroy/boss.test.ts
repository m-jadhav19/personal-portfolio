import assert from "node:assert/strict";
import test from "node:test";

import {
  BOSS_MAX_HP,
  createPortraitBoss,
  hurtBoss,
  updatePortraitBoss,
} from "./boss.ts";

test("createPortraitBoss starts at full HP and alive", () => {
  const boss = createPortraitBoss(1280, 800);
  assert.equal(boss.hp, BOSS_MAX_HP);
  assert.equal(boss.alive, true);
  assert.ok(boss.radius > 30);
});

test("hurtBoss reduces HP and can kill", () => {
  const boss = createPortraitBoss(800, 600);
  const hit = hurtBoss(boss, 40);
  assert.equal(hit.hit, true);
  assert.equal(hit.killed, false);
  assert.equal(boss.hp, BOSS_MAX_HP - 40);

  const kill = hurtBoss(boss, 999);
  assert.equal(kill.killed, true);
  assert.equal(boss.alive, false);
  assert.equal(boss.hp, 0);
});

test("updatePortraitBoss eventually fires shots", () => {
  const boss = createPortraitBoss(800, 600);
  boss.attackTimer = 0;
  const shots = updatePortraitBoss(
    boss,
    0.016,
    { x: 100, y: 100 },
    800,
    600,
    false,
  );
  assert.ok(shots.length >= 2);
});
