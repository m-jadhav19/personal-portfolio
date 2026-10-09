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

/**
 * Maps 0–1 pin progress onto a chapter index.
 * Progress is divided into `count - 1` steps, and the index flips at the
 * midpoint of each step. Progress 1 stays on the last chapter.
 */
export function getChapterIndex(progress: number, count: number) {
  if (count <= 1) return 0;

  const clamped = Math.min(1, Math.max(0, progress));
  return Math.min(count - 1, Math.round(clamped * (count - 1)));
}

/** One gesture moves at most one chapter, even if the scroll lands much further. */
export function clampChapterStep(settled: number, nearest: number, count: number) {
  const max = Math.max(0, count - 1);
  const current = Math.min(max, Math.max(0, settled));
  const target = Math.min(max, Math.max(0, nearest));

  if (target > current) return Math.min(current + 1, max);
  if (target < current) return Math.max(current - 1, 0);
  return current;
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
