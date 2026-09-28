import { useSyncExternalStore } from "react";

import type { HudState } from "./engine";

export type DogTownState = HudState & {
  /** True once the scene is mounted and animating (false under reduced motion). */
  live: boolean;
};

const INITIAL_STATE: DogTownState = {
  mode: "roam",
  meters: 0,
  bones: 0,
  best: 0,
  live: false,
};

let state: DogTownState = INITIAL_STATE;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setDogTownState(patch: Partial<DogTownState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

export function resetDogTownState() {
  setDogTownState({ ...INITIAL_STATE });
}

/** Lets the footer HUD (outside the canvas stage) read the engine's counters. */
export function useDogTownState() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL_STATE,
  );
}
