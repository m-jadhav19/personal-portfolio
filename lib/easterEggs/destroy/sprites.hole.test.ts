import assert from "node:assert/strict";
import test from "node:test";

import { createBulletHole, holeCoverAlpha } from "./sprites.ts";

test("createBulletHole stores hold and life timing", () => {
  const hole = createBulletHole(10, 20, { life: 4, hold: 1.5, scale: 1 });
  assert.equal(hole.life, 4);
  assert.equal(hole.maxLife, 4);
  assert.equal(hole.hold, 1.5);
});

test("holeCoverAlpha stays full during hold then fades", () => {
  const hole = createBulletHole(0, 0, { life: 4, hold: 2 });
  assert.equal(holeCoverAlpha(hole), 1);

  hole.life = 2; // end of hold
  assert.equal(holeCoverAlpha(hole), 1);

  hole.life = 1; // halfway through fade
  const mid = holeCoverAlpha(hole);
  assert.ok(mid > 0 && mid < 1, `expected mid fade, got ${mid}`);

  hole.life = 0;
  assert.equal(holeCoverAlpha(hole), 0);
});

test("longer-lived holes take longer to cover", () => {
  const short = createBulletHole(0, 0, { life: 2, hold: 1 });
  const long = createBulletHole(0, 0, { life: 5, hold: 3 });
  // After 1.5s age
  short.life = 0.5;
  long.life = 3.5;
  assert.ok(holeCoverAlpha(short) < holeCoverAlpha(long));
});
