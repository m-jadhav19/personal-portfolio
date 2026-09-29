/** True while DESTROY overlay owns the page (works outside React). */
export function isDestroyEggActive(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.easterEgg === "destroy";
}
