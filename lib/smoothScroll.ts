import { playScrollToTop } from "@/animations/shapeOverlay";

export const SCROLL_HEADER_OFFSET = -96;
export const SCROLL_DURATION = 1.2;

type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean },
  ) => void;
};

function getLenis() {
  return (window as Window & { __lenis__?: LenisLike }).__lenis__;
}

export async function smoothScrollTo(id: string) {
  const lenis = getLenis();

  if (id === "top") {
    await playScrollToTop();
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target, {
      offset: SCROLL_HEADER_OFFSET,
      duration: SCROLL_DURATION,
    });
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
