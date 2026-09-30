import assert from "node:assert/strict";
import test from "node:test";

import {
  clearDestroyWatchTarget,
  getDestroyWatchTarget,
  setDestroyWatchTarget,
} from "./watchTarget.ts";

test("watch target starts empty and can be set/cleared", () => {
  clearDestroyWatchTarget();
  assert.equal(getDestroyWatchTarget(), null);
  setDestroyWatchTarget(120, 340);
  assert.deepEqual(getDestroyWatchTarget(), { x: 120, y: 340 });
  setDestroyWatchTarget(10, 20);
  assert.deepEqual(getDestroyWatchTarget(), { x: 10, y: 20 });
  clearDestroyWatchTarget();
  assert.equal(getDestroyWatchTarget(), null);
});
