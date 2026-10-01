import assert from "node:assert/strict";
import test from "node:test";

import {
  AIM_DIRS,
  CHARACTER_IDLE_FRAMES,
  CHARACTER_WALK_FRAMES,
  ENEMY_ANIM_FRAMES,
  ENEMY_FRAME_MS,
  aimAngleToDir,
  characterAnimFrame,
  characterDirFrame,
  enemyAnimFrame,
  gunSpriteId,
  muzzleOffset,
  playerSpriteId,
  walkSpriteId,
} from "./spriteAtlas.ts";

test("enemyAnimFrame cycles every ENEMY_FRAME_MS over 4 loop frames", () => {
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
    enemyAnimFrame("roach", (ENEMY_FRAME_MS * 4) / 1000),
    "enemyRoach1",
  );
});

test("each enemy loops 4 movement frames (death/attack tells excluded)", () => {
  for (const kind of ["roach", "drone", "slime"] as const) {
    assert.equal(ENEMY_ANIM_FRAMES[kind].length, 4);
  }
  assert.equal(enemyAnimFrame("drone", 0.2), "enemyDrone3");
  assert.equal(enemyAnimFrame("slime", 0.25), "enemySlime3");
});

test("legacy characterAnimFrame still resolves compat sheet ids", () => {
  assert.equal(CHARACTER_IDLE_FRAMES.length, 1);
  assert.equal(CHARACTER_WALK_FRAMES.length, 2);
  assert.equal(characterAnimFrame(false, 0), "characterIdle");
  assert.equal(characterAnimFrame(true, 0), "characterWalkA");
  assert.equal(characterAnimFrame(true, 1), "characterWalkB");
});

test("aimAngleToDir maps canvas atan2 octants (y-down)", () => {
  assert.equal(aimAngleToDir(0), "r");
  assert.equal(aimAngleToDir(Math.PI / 4), "dr");
  assert.equal(aimAngleToDir(Math.PI / 2), "d");
  assert.equal(aimAngleToDir((3 * Math.PI) / 4), "dl");
  assert.equal(aimAngleToDir(Math.PI), "l");
  assert.equal(aimAngleToDir((-3 * Math.PI) / 4), "ul");
  assert.equal(aimAngleToDir(-Math.PI / 2), "u");
  assert.equal(aimAngleToDir(-Math.PI / 4), "ur");
});

test("characterDirFrame picks walk / shoot / aim by cursor direction", () => {
  assert.equal(characterDirFrame(false, false, 0, 0), "player_aim_r");
  assert.equal(characterDirFrame(false, true, 0, Math.PI / 2), "player_shoot_d");
  assert.equal(characterDirFrame(true, false, 0, -Math.PI / 2), "walk_1_u");
  assert.equal(characterDirFrame(true, false, 2, Math.PI), "walk_3_l");
  // Shoot pose wins over walk so muzzle flash stays readable.
  assert.equal(characterDirFrame(true, true, 0, 0), "player_shoot_r");
});

test("player / walk / gun ids cover all 8 sheet directions", () => {
  assert.deepEqual([...AIM_DIRS], ["r", "ur", "u", "ul", "l", "dl", "d", "dr"]);
  for (const dir of AIM_DIRS) {
    assert.equal(playerSpriteId("idle", dir), `player_idle_${dir}`);
    assert.equal(playerSpriteId("aim", dir), `player_aim_${dir}`);
    assert.equal(playerSpriteId("shoot", dir), `player_shoot_${dir}`);
    assert.equal(walkSpriteId(1, dir), `walk_1_${dir}`);
    assert.equal(walkSpriteId(6, dir), `walk_6_${dir}`);
    assert.equal(gunSpriteId(dir), `gun_${dir}`);
  }
  assert.equal(walkSpriteId(0, "r"), "walk_1_r");
  assert.equal(walkSpriteId(99, "r"), "walk_6_r");
});

test("muzzleOffset projects along aim angle", () => {
  const right = muzzleOffset(0, 28);
  assert.ok(Math.abs(right.x - 28) < 1e-9);
  assert.ok(Math.abs(right.y) < 1e-9);
  const down = muzzleOffset(Math.PI / 2, 28);
  assert.ok(Math.abs(down.x) < 1e-9);
  assert.ok(Math.abs(down.y - 28) < 1e-9);
});
