import assert from "node:assert/strict";
import test from "node:test";

import {
  earliestCircleHit,
  sampleSegment,
  segmentCircleHit,
} from "./collision.ts";

test("segmentCircleHit detects a crossing", () => {
  const hit = segmentCircleHit(0, 0, 100, 0, 50, 0, 8);
  assert.ok(hit);
  assert.ok(hit.t > 0 && hit.t < 1);
  assert.ok(Math.abs(hit.x - 42) < 1 || Math.abs(hit.x - 50) < 10);
});

test("segmentCircleHit misses a distant circle", () => {
  assert.equal(segmentCircleHit(0, 0, 100, 0, 50, 40, 8), null);
});

test("earliestCircleHit prefers the first target along the path", () => {
  const hit = earliestCircleHit(0, 0, 200, 0, [
    { x: 150, y: 0, radius: 10 },
    { x: 60, y: 0, radius: 10 },
  ]);
  assert.ok(hit);
  assert.ok(hit.x < 80);
});

test("sampleSegment returns interior points", () => {
  const pts = sampleSegment(0, 0, 100, 0, 4);
  assert.equal(pts.length, 4);
  assert.equal(pts[0].x, 25);
  assert.equal(pts[3].x, 100);
});
