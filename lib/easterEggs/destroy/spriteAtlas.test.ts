import assert from "node:assert/strict";
import test from "node:test";

import {
  CHARACTER_IDLE_FRAMES,
  CHARACTER_WALK_FRAMES,
  ENEMY_ANIM_FRAMES,
  ENEMY_FRAME_MS,
  characterAnimFrame,
  enemyAnimFrame,
} from "./spriteAtlas.ts";

test("enemyAnimFrame cycles every ENEMY_FRAME_MS", () => {
  assert.equal(enemyAnimFrame("roach", 0), "enemyRoach1");
  assert.equal(
    enemyAnimFrame("roach", ENEMY_FRAME_MS / 1000),
    "enemyRoach2",
  );
  assert.equal(
    enemyAnimFrame("roach", (ENEMY_FRAME_MS * 2) / 1000),
    "enemyRoach3",
  );
  assert.equal(
    enemyAnimFrame("roach", (ENEMY_FRAME_MS * 6) / 1000),
    "enemyRoach1",
  );
});

test("each enemy has a 6-frame walk cycle from the sheet", () => {
  for (const kind of ["roach", "drone", "slime"] as const) {
    assert.equal(ENEMY_ANIM_FRAMES[kind].length, 6);
  }
  assert.equal(enemyAnimFrame("drone", 0.2), "enemyDrone2");
  assert.equal(enemyAnimFrame("slime", 0.25), "enemySlime3");
});

test("characterAnimFrame picks idle vs walk sheet frames", () => {
  assert.equal(CHARACTER_IDLE_FRAMES.length, 7);
  assert.equal(CHARACTER_WALK_FRAMES.length, 6);
  assert.equal(characterAnimFrame(false, 0), "characterIdle1");
  assert.equal(characterAnimFrame(true, 0), "characterWalk1");
  assert.equal(characterAnimFrame(true, 2), "characterWalk3");
});
