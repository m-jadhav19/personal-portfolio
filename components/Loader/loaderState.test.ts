import assert from "node:assert/strict";
import test from "node:test";

import {
  getLoaderTiming,
  nextLoaderCount,
  readLoaderSeen,
  shouldPersistLoaderSeen,
  writeLoaderSeen,
} from "./loaderState.ts";

test("progress stays below completion until assets are ready", () => {  assert.equal(nextLoaderCount(86, false, 12), 90);
  assert.equal(nextLoaderCount(90, false, 12), 90);
});

test("progress reaches 100 once assets are ready", () => {
  assert.equal(nextLoaderCount(90, true, 12), 100);
});

test("repeat visits use a shortened loader", () => {
  const firstVisit = getLoaderTiming(false, false);
  const repeatVisit = getLoaderTiming(true, false);

  assert.ok(repeatVisit.intervalMs < firstVisit.intervalMs);
  assert.ok(repeatVisit.exitDelayMs < firstVisit.exitDelayMs);
});

test("reduced motion completes immediately", () => {
  assert.deepEqual(getLoaderTiming(false, true), {
    intervalMs: 0,
    exitDelayMs: 0,
    exitDuration: 0,
  });
});

test("loader seen state is not persisted outside production", () => {
  assert.equal(shouldPersistLoaderSeen(), false);
  assert.equal(readLoaderSeen(), false);

  const storage = new Map<string, string>();
  const originalSessionStorage = globalThis.sessionStorage;

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
    },
  });

  writeLoaderSeen();
  assert.equal(storage.size, 0);

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: originalSessionStorage,
  });
});