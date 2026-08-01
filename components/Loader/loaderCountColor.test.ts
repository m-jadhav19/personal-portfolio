import assert from "node:assert/strict";
import test from "node:test";

import { loaderCountColor } from "./loaderCountColor.ts";

test("loader count color starts grey and ends blue", () => {
  assert.equal(loaderCountColor(0), "rgb(138 138 138)");
  assert.equal(loaderCountColor(100), "rgb(14 165 233)");
});

test("loader count color interpolates mid progress", () => {
  assert.equal(loaderCountColor(50), "rgb(76 152 186)");
});
