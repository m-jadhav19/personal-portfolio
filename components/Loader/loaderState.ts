export const LOADER_SEEN_KEY = "portfolio-loader-seen";

/** Keep the gate brief — content should be available immediately. */
export const MIN_LOADER_VISIBLE_MS = 180;
export const MIN_LOADER_REPEAT_VISIBLE_MS = 0;
export const MIN_LOADER_ASSETS_READY_MS = 120;
export const MIN_LOADER_REPEAT_ASSETS_READY_MS = 0;

export type LoaderTiming = {
  intervalMs: number;
  exitDelayMs: number;
  exitDuration: number;
};

export function shouldPersistLoaderSeen() {
  return process.env.NODE_ENV === "production";
}

export function readLoaderSeen() {
  if (!shouldPersistLoaderSeen()) return false;
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(LOADER_SEEN_KEY) === "true";
}

export function writeLoaderSeen() {
  if (!shouldPersistLoaderSeen()) return;
  window.sessionStorage.setItem(LOADER_SEEN_KEY, "true");
}

export function getLoaderTiming(
  hasSeenLoader: boolean,
  prefersReducedMotion: boolean,
): LoaderTiming {
  if (prefersReducedMotion) {
    return { intervalMs: 0, exitDelayMs: 0, exitDuration: 0 };
  }

  // Repeat visits (and first visits after a prior session) skip the theater.
  if (hasSeenLoader) {
    return { intervalMs: 16, exitDelayMs: 0, exitDuration: 0.2 };
  }

  return { intervalMs: 28, exitDelayMs: 60, exitDuration: 0.35 };
}

export function nextLoaderCount(
  current: number,
  assetsReady: boolean,
  increment: number,
) {
  if (assetsReady) return Math.min(100, current + increment);
  return Math.min(90, current + increment);
}
