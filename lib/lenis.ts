import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

type LenisWindow = Window & {
  __lenis__?: Lenis;
};

export function getLenis() {
  if (typeof window === "undefined") return undefined;
  return (window as LenisWindow).__lenis__;
}

export function disableBrowserScrollRestoration() {
  if (typeof window === "undefined") return;
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
}

export function resetScrollToTop() {
  const lenis = getLenis();

  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  }

  window.scrollTo(0, 0);
  // Some mobile browsers ignore window.scrollTo while the root is
  // overflow-clipped (Lenis "stopped"); poke the scrolling elements directly.
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  ScrollTrigger.update();
}

/**
 * Re-checks on the next frame that the page really is at the top and retries
 * the reset if the browser dropped the programmatic scroll.
 */
export function ensureScrollTop(threshold = 4) {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      if (getScrollY() > threshold || window.scrollY > threshold) {
        resetScrollToTop();
      }
      resolve();
    });
  });
}

/**
 * Animated scroll to the top without stopping Lenis or touching overflow —
 * used on touch devices where the overlay hand-off is unreliable.
 */
export function smoothScrollToTop(duration = 1) {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      void ensureScrollTop().then(resolve);
    };

    const lenis = getLenis();
    if (lenis && !lenis.isStopped) {
      lenis.scrollTo(0, { duration, onComplete: finish });
      window.setTimeout(finish, duration * 1000 + 250);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(finish, 800);
  });
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
