import assert from "node:assert/strict";
import test from "node:test";

import {
  BOSS_DRAW_SIZE,
  BOSS_MAX_HP,
  BOSS_NAME,
  bossDrawSize,
  createPortraitBoss,
  hurtBoss,
  updatePortraitBoss,
} from "./boss.ts";

test("boss is named Mogambo", () => {
  assert.equal(BOSS_NAME, "Mogambo");
});

test("createPortraitBoss starts emerging at the portrait origin", () => {
  const boss = createPortraitBoss(1280, 800, { x: 420, y: 310, size: 240 });
  assert.equal(boss.hp, BOSS_MAX_HP);
  assert.equal(boss.alive, true);
  assert.equal(boss.mode, "emerge");
  assert.equal(boss.x, 420);
  assert.equal(boss.y, 310);
  assert.equal(boss.homeX, 420);
  assert.equal(boss.homeY, 310);
  assert.equal(boss.startSize, 240);
  assert.ok(boss.radius > 30);
  assert.ok(bossDrawSize(boss) > BOSS_DRAW_SIZE);
});

test("hurtBoss ignores the boss during emerge", () => {
  const boss = createPortraitBoss(800, 600, { x: 100, y: 100, size: 200 });
  const miss = hurtBoss(boss, 40);
  assert.equal(miss.hit, false);
  assert.equal(boss.hp, BOSS_MAX_HP);
});

test("hurtBoss reduces HP and can kill after emerge", () => {
  const boss = createPortraitBoss(800, 600);
  boss.mode = "float";
  boss.emerge = 1;
  const hit = hurtBoss(boss, 40);
  assert.equal(hit.hit, true);
  assert.equal(hit.killed, false);
  assert.equal(boss.hp, BOSS_MAX_HP - 40);

  const kill = hurtBoss(boss, 999);
  assert.equal(kill.killed, true);
  assert.equal(boss.alive, false);
  assert.equal(boss.hp, 0);
});

test("emerge finishes at home without teleporting to a screen orbit", () => {
  const boss = createPortraitBoss(800, 600, { x: 200, y: 180, size: 220 });
  for (let i = 0; i < 90; i++) {
    updatePortraitBoss(boss, 0.02, { x: 400, y: 400 }, 800, 600, false);
  }
  assert.equal(boss.mode, "float");
  assert.equal(boss.emerge, 1);
  // Soft strafe stays near the portrait home — not the old fixed orbit (~464, 240).
  assert.ok(Math.abs(boss.x - boss.homeX) < 50);
  assert.ok(Math.abs(boss.y - boss.homeY) < 40);
  assert.equal(bossDrawSize(boss), BOSS_DRAW_SIZE);
});

test("updatePortraitBoss eventually fires shots after emerge", () => {
  const boss = createPortraitBoss(800, 600, { x: 400, y: 300, size: 180 });
  boss.mode = "float";
  boss.emerge = 1;
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

test("boss facing flips toward the player", () => {
  const boss = createPortraitBoss(800, 600, { x: 400, y: 300, size: 180 });
  boss.mode = "float";
  boss.emerge = 1;
  updatePortraitBoss(boss, 0.016, { x: 100, y: 300 }, 800, 600, false);
  assert.equal(boss.facing, -1);
  updatePortraitBoss(boss, 0.016, { x: 700, y: 300 }, 800, 600, false);
  assert.equal(boss.facing, 1);
});
