import type Lenis from "lenis";

type LenisWindow = Window & {
  __lenis__?: Lenis;
};

export function getLenis() {
  if (typeof window === "undefined") return undefined;
  return (window as LenisWindow).__lenis__;
}

export function scrollByDelta(top: number, left = 0) {
  const lenis = getLenis();

  if (lenis) {
    const next = Math.max(0, lenis.scroll + top);
    lenis.scrollTo(next, { immediate: true, force: true });
  } else {
    window.scrollBy({ top, left, behavior: "auto" });
    return;
  }

  if (left !== 0) {
    window.scrollBy({ left, behavior: "auto" });
  }
}

export function getScrollY() {
  const lenis = getLenis();
  return lenis ? lenis.scroll : window.scrollY;
}
