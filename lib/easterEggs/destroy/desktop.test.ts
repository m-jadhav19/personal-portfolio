import assert from "node:assert/strict";
import test from "node:test";

import { isDestroyDesktop } from "./desktop.ts";

test("isDestroyDesktop is false without window matchMedia", () => {
  // Under node:test there is no window — helper should fail closed.
  assert.equal(isDestroyDesktop(), false);
});
