/** Destroy mode is desktop-only (cursor follow + click weapons). */
export function isDestroyDesktop(): boolean {
  if (typeof window === "undefined" || typeof matchMedia !== "function") {
    return false;
  }

  const coarse = matchMedia("(pointer: coarse)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  return canHover && !coarse;
}
