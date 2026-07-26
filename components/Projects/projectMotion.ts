type CtaPositionInput = {
  pointerX: number;
  pointerY: number;
  containerWidth: number;
  containerHeight: number;
  ctaWidth: number;
  ctaHeight: number;
};

export function selectFeaturedProjects<T>(projects: readonly T[]) {
  return projects.slice(0, 3);
}

export function getProjectSide(index: number): "left" | "right" {
  return index % 2 === 0 ? "left" : "right";
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
