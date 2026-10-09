import assert from "node:assert/strict";
import test from "node:test";

import {
  clampChapterStep,
  clampCtaPosition,
  getChapterIndex,
} from "./projectMotion.ts";

test("returns the first chapter when there is nothing to advance", () => {
  assert.equal(getChapterIndex(0, 0), 0);
  assert.equal(getChapterIndex(0, 1), 0);
  assert.equal(getChapterIndex(1, 1), 0);
});

test("maps the start of the sequence to the first chapter", () => {
  assert.equal(getChapterIndex(0, 7), 0);
  assert.equal(getChapterIndex(-0.4, 7), 0);
});

test("stays on the last chapter at progress 1", () => {
  assert.equal(getChapterIndex(1, 7), 6);
  assert.equal(getChapterIndex(1.2, 7), 6);
});

test("flips to the next chapter halfway through each step", () => {
  assert.equal(getChapterIndex(0.04, 7), 0);
  assert.equal(getChapterIndex(0.5 / 6, 7), 1);
  assert.equal(getChapterIndex(0.5, 7), 3);
  assert.equal(getChapterIndex(5.5 / 6, 7), 6);
});

test("a heavy scroll advances only one chapter", () => {
  assert.equal(clampChapterStep(0, 3, 7), 1);
  assert.equal(clampChapterStep(2, 0, 7), 1);
  assert.equal(clampChapterStep(4, 4, 7), 4);
  assert.equal(clampChapterStep(6, 2, 7), 5);
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
