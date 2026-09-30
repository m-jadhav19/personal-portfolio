import assert from "node:assert/strict";
import test from "node:test";

import {
  ENEMY_ANIM_FRAMES,
  ENEMY_FRAME_MS,
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
    enemyAnimFrame("roach", (ENEMY_FRAME_MS * 3) / 1000),
    "enemyRoach1",
  );
});

test("each enemy has a 3-frame walk cycle", () => {
  for (const kind of ["roach", "drone", "slime"] as const) {
    assert.equal(ENEMY_ANIM_FRAMES[kind].length, 3);
  }
  assert.equal(enemyAnimFrame("drone", 0.2), "enemyDrone2");
  assert.equal(enemyAnimFrame("slime", 0.25), "enemySlime3");
});
