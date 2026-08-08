import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getNextOpenCapability } from "./capabilityAccordion.ts";

describe("getNextOpenCapability", () => {
  it("opens a different capability", () => {
    assert.equal(getNextOpenCapability("1", "2"), "2");
  });

  it("closes the active capability when clicked again", () => {
    assert.equal(getNextOpenCapability("2", "2"), null);
  });
});
