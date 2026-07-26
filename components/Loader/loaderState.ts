export const LOADER_SEEN_KEY = "portfolio-loader-seen";

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
    return { intervalMs: 24, exitDelayMs: 80, exitDuration: 0.45 };
  }

  return { intervalMs: 70, exitDelayMs: 1500, exitDuration: 1 };
}

export function nextLoaderCount(
  current: number,
  assetsReady: boolean,
  increment: number,
) {
  if (assetsReady) return Math.min(100, current + increment);
  return Math.min(90, current + increment);
}
