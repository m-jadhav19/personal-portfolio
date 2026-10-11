export const FEATURED_PROJECT_COUNT = 4;

export function selectFeaturedProjects<T>(projects: readonly T[]) {
  return projects.slice(0, FEATURED_PROJECT_COUNT);
}

type CtaPositionInput = {
  pointerX: number;
  pointerY: number;
  containerWidth: number;
  containerHeight: number;
  ctaWidth: number;
  ctaHeight: number;
};

/** Pixels of wheel movement that count as one chapter tick. */
export const SCROLL_TICK_PX = 40;

/** Line and page wheel modes become pixels, so one notch is one tick. */
export function wheelDeltaPixels(deltaY: number, deltaMode: number, pageSize: number) {
  if (deltaMode === 1) return deltaY * 16;
  if (deltaMode === 2) return deltaY * pageSize;
  return deltaY;
}

/**
 * Adds wheel movement until it crosses a tick. The leftover is dropped so a
 * long flick does not turn into several chapters at once.
 */
export function consumeScrollTick(pending: number, delta: number, threshold = SCROLL_TICK_PX) {
  const next = pending + delta;
  if (Math.abs(next) < threshold) return { pending: next, direction: 0 };
  return { pending: 0, direction: Math.sign(next) };
}

/** The first and last chapters release the page instead of stepping again. */
export function isSequenceExit(settled: number, direction: number, count: number) {
  if (!direction || count <= 0) return false;
  if (direction > 0) return settled >= count - 1;
  return settled <= 0;
}

/**
 * A committed tick owns the sequence. A wheel tick the other way — the
 * small reversal at the end of a trackpad flick — must not step backward.
 */
export function shouldCommitWheel(gestureDir: number, direction: number) {
  if (!direction) return false;
  if (gestureDir !== 0 && direction !== gestureDir) return false;
  return true;
}

export function clampCtaPosition({
  pointerX,
  pointerY,
  containerWidth,
  containerHeight,
  ctaWidth,
  ctaHeight,
}: CtaPositionInput) {
  const halfWidth = ctaWidth / 2;
  const halfHeight = ctaHeight / 2;

  return {
    x: Math.min(Math.max(pointerX, halfWidth), containerWidth - halfWidth),
    y: Math.min(Math.max(pointerY, halfHeight), containerHeight - halfHeight),
  };
}
