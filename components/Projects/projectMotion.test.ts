import assert from "node:assert/strict";
import test from "node:test";

import {
  clampCtaPosition,
  canCatchSequenceTouch,
  consumeScrollTick,
  dialTurnDegrees,
  exitGlideDistance,
  isSequenceExit,
  selectFeaturedProjects,
  shouldCommitWheel,
  wheelDeltaPixels,
} from "./projectMotion.ts";

test("keeps the pinned sequence to the first four projects", () => {
  assert.deepEqual(
    selectFeaturedProjects(["a", "b", "c", "d", "e", "f", "g"]),
    ["a", "b", "c", "d"],
  );
});

test("turns line and page wheel modes into pixels", () => {
  assert.equal(wheelDeltaPixels(3, 1, 800), 48);
  assert.equal(wheelDeltaPixels(1, 2, 800), 800);
  assert.equal(wheelDeltaPixels(12, 0, 800), 12);
});

test("a wheel tick advances one chapter and drops the leftover", () => {
  assert.deepEqual(consumeScrollTick(0, 16), { pending: 16, direction: 0 });
  assert.deepEqual(consumeScrollTick(16, 30), { pending: 0, direction: 1 });
  assert.deepEqual(consumeScrollTick(0, -120), { pending: 0, direction: -1 });
});

test("fills the dial one segment per chapter and closes it on the last", () => {
  assert.equal(dialTurnDegrees(0, 4), 90);
  assert.equal(dialTurnDegrees(1, 4), 180);
  assert.equal(dialTurnDegrees(3, 4), 360);
  assert.equal(dialTurnDegrees(8, 4), 360);
  assert.equal(dialTurnDegrees(-2, 4), 90);
});

test("catches a touch when the work card is at the top of the viewport", () => {
  assert.equal(canCatchSequenceTouch(0), true);
  assert.equal(canCatchSequenceTouch(120), true);
  assert.equal(canCatchSequenceTouch(-140), true);
  assert.equal(canCatchSequenceTouch(240), false);
  assert.equal(canCatchSequenceTouch(-220), false);
});

test("the exit glide stays with the block after the last card", () => {
  assert.equal(exitGlideDistance(800, 260), 260);
  assert.equal(exitGlideDistance(800, 0), 336);
  assert.equal(exitGlideDistance(1400, 900), 480);
  assert.equal(exitGlideDistance(400, 40), 220);
});

test("the end chapters release the page", () => {
  assert.equal(isSequenceExit(0, -1, 4), true);
  assert.equal(isSequenceExit(3, 1, 4), true);
  assert.equal(isSequenceExit(1, 1, 4), false);
  assert.equal(isSequenceExit(2, -1, 4), false);
});

test("ignores the opposite tick at the end of a scroll gesture", () => {
  assert.equal(shouldCommitWheel(1, -1), false);
  assert.equal(shouldCommitWheel(-1, 1), false);
  assert.equal(shouldCommitWheel(1, 1), true);
  assert.equal(shouldCommitWheel(0, -1), true);
  assert.equal(shouldCommitWheel(0, 0), false);
});

test("keeps the CTA fully inside the media bounds", () => {
  assert.deepEqual(
    clampCtaPosition({
      pointerX: 2,
      pointerY: 298,
      containerWidth: 500,
      containerHeight: 300,
      ctaWidth: 144,
      ctaHeight: 44,
    }),
    { x: 72, y: 278 },
  );
});

test("preserves pointer coordinates away from the edges", () => {
  assert.deepEqual(
    clampCtaPosition({
      pointerX: 250,
      pointerY: 150,
      containerWidth: 500,
      containerHeight: 300,
      ctaWidth: 144,
      ctaHeight: 44,
    }),
    { x: 250, y: 150 },
  );
});
