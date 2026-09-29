/** Destroy mode is desktop-only (cursor follow + click weapons). */
export function isDestroyDesktop(): boolean {
  if (typeof window === "undefined" || typeof matchMedia !== "function") {
    return false;
  }

  const coarse = matchMedia("(pointer: coarse)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const canHover = matchMedia("(hover: hover)").matches;

  // Prefer hover+non-coarse; also accept fine pointer (trackpads / some VMs).
  if (coarse && !fine) return false;
  return canHover || fine;
}
