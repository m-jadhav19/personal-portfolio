import assert from "node:assert/strict";
import test from "node:test";

import { formatLoaderMessageLines, pickLoaderMessage } from "./loaderMessages.ts";

test("pickLoaderMessage returns one of the configured messages", () => {
  const messages = [
    { text: "Alpha", weight: 1 },
    { text: "Beta", weight: 1 },
  ];

  const result = pickLoaderMessage(messages);
  assert.ok(messages.some((message) => message.text === result));
});

test("formatLoaderMessageLines balances copy across two lines", () => {
  const [lineOne, lineTwo] = formatLoaderMessageLines(
  'This loading screen actually serves no purpose it\'s for the "aesthetics"',
  );

  assert.equal(
    `${lineOne} ${lineTwo}`.trim(),
    'This loading screen actually serves no purpose it\'s for the "aesthetics"',
  );
  assert.ok(lineOne.length > 0);
  assert.ok(lineTwo.length > 0);
});
