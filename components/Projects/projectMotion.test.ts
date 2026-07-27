import assert from "node:assert/strict";
import test from "node:test";

import {
  clampCtaPosition,
  getProjectSide,
  selectFeaturedProjects,
} from "./projectMotion.ts";

test("selects only the first three projects", () => {
  const projects = Array.from({ length: 7 }, (_, index) => ({ id: index + 1 }));

  assert.deepEqual(
    selectFeaturedProjects(projects).map((project) => project.id),
    [1, 2, 3],
  );
});

test("places zero-based even projects left and odd projects right", () => {
  assert.equal(getProjectSide(0), "left");
  assert.equal(getProjectSide(1), "right");
  assert.equal(getProjectSide(2), "left");
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
