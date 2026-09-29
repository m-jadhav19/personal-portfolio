import assert from "node:assert/strict";
import test from "node:test";

import { isIgnorable, matchesDestroyIgnore } from "./targets.ts";

test("matchesDestroyIgnore detects data-destroy-ignore", () => {
  assert.equal(
    matchesDestroyIgnore((sel) =>
      sel === "[data-destroy-ignore]" ? {} : null,
    ),
    true,
  );
});

test("matchesDestroyIgnore detects canvas ancestors", () => {
  assert.equal(
    matchesDestroyIgnore((sel) => (sel === "canvas" ? {} : null)),
    true,
  );
});

test("matchesDestroyIgnore allows normal content", () => {
  assert.equal(
    matchesDestroyIgnore(() => null),
    false,
  );
});

test("isIgnorable treats null as ignorable", () => {
  assert.equal(isIgnorable(null), true);
});
