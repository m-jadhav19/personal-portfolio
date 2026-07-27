import assert from "node:assert/strict";
import test from "node:test";

import { pickLoaderMessage } from "./loaderMessages.ts";

test("pickLoaderMessage returns one of the configured messages", () => {
  const messages = [
    { text: "Alpha", weight: 1 },
    { text: "Beta", weight: 1 },
  ];

  const result = pickLoaderMessage(messages);
  assert.ok(messages.some((message) => message.text === result));
});
