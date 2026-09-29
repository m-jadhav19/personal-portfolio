/** Destroy mode is desktop-only (cursor follow + click weapons). */
export function isDestroyDesktop(): boolean {
  if (typeof window === "undefined" || typeof matchMedia !== "function") {
    return false;
  }

  // Manual override for local QA / automation (set in DevTools).
  if (
    (window as unknown as { __DESTROY_FORCE_DESKTOP__?: boolean })
      .__DESTROY_FORCE_DESKTOP__ === true
  ) {
    return true;
  }

  const coarse = matchMedia("(pointer: coarse)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const anyFine = matchMedia("(any-pointer: fine)").matches;
  const canHover = matchMedia("(hover: hover)").matches;

  // Touch-only devices: coarse primary pointer and no fine pointer at all.
  if (coarse && !fine && !anyFine) return false;

  return canHover || fine || anyFine;
}
