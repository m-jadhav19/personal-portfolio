import assert from "node:assert/strict";
import test from "node:test";

import { getNextOpenService } from "./serviceAccordion.ts";

test("opens a closed service and closes the previous one", () => {
  assert.equal(getNextOpenService("1", "2"), "2");
});

test("closes the selected service when it is already open", () => {
  assert.equal(getNextOpenService("2", "2"), null);
});
