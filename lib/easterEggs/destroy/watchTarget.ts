/** Shared aim point so the hero portrait can watch the destroy character. */

let watchTarget: { x: number; y: number } | null = null;

export function setDestroyWatchTarget(x: number, y: number) {
  if (!watchTarget) watchTarget = { x, y };
  else {
    watchTarget.x = x;
    watchTarget.y = y;
  }
}

export function clearDestroyWatchTarget() {
  watchTarget = null;
}

export function getDestroyWatchTarget(): { x: number; y: number } | null {
  return watchTarget;
}
