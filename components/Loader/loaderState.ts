export const LOADER_SEEN_KEY = "portfolio-loader-seen";

export const MIN_LOADER_VISIBLE_MS = 1000;
export const MIN_LOADER_REPEAT_VISIBLE_MS = 550;
export const MIN_LOADER_ASSETS_READY_MS = 700;
export const MIN_LOADER_REPEAT_ASSETS_READY_MS = 400;

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

export function getLoaderTiming(  hasSeenLoader: boolean,
  prefersReducedMotion: boolean,
): LoaderTiming {
  if (prefersReducedMotion) {
    return { intervalMs: 0, exitDelayMs: 0, exitDuration: 0 };
  }

  if (hasSeenLoader) {
    return { intervalMs: 35, exitDelayMs: 250, exitDuration: 0.35 };
  }

  return { intervalMs: 60, exitDelayMs: 500, exitDuration: 0.7 };
}

export function nextLoaderCount(
  current: number,
  assetsReady: boolean,
  increment: number,
) {
  if (assetsReady) return Math.min(100, current + increment);
  return Math.min(90, current + increment);
}
