import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLoaderCountPaletteCss,
  LOADER_COUNT_PALETTE_NAME,
  LOADER_INK_PALETTE_SIZE,
  loaderCountColor,
} from "./loaderCountColor.ts";

test("loader count color starts grey and ends blue", () => {
  assert.equal(loaderCountColor(0), "rgb(138 138 138)");
  assert.equal(loaderCountColor(100), "rgb(14 165 233)");
});

test("loader count color interpolates mid progress", () => {
  assert.equal(loaderCountColor(50), "rgb(76 152 186)");
});

test("palette css overrides every ink CPAL entry", () => {
  const css = buildLoaderCountPaletteCss('"Bitcount Grid Single Ink"', "rgb(14 165 233)");
  assert.match(css, new RegExp(LOADER_COUNT_PALETTE_NAME));
  assert.match(css, /font-family: "Bitcount Grid Single Ink"/);
  assert.equal(
    (css.match(/\d+ rgb\(14 165 233\)/g) ?? []).length,
    LOADER_INK_PALETTE_SIZE,
  );
});
