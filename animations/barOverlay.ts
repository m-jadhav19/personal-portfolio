import { gsap } from "gsap";

const NUM_BARS = 12;
const DURATION = 0.85;
const STAGGER = 0.045;
const EASE = "power2.inOut";

export type BarOverlayController = {
  playReveal: () => Promise<void>;
  playCover: () => Promise<void>;
  isAnimating: () => boolean;
};

let controller: BarOverlayController | null = null;

export function registerBarOverlay(next: BarOverlayController | null) {
  controller = next;
}

export function playBarCover() {
  return controller?.playCover() ?? Promise.resolve();
}

export function playBarReveal() {
  return controller?.playReveal() ?? Promise.resolve();
}

export function isBarOverlayAnimating() {
  return controller?.isAnimating() ?? false;
}

export function prefersReducedBarMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createBarOverlayController(bars: HTMLElement[]) {
  let isAnimating = false;
  let timeline: gsap.core.Timeline | null = null;
  let pendingResolve: (() => void) | null = null;

  const settlePending = () => {
    if (pendingResolve) {
      pendingResolve();
      pendingResolve = null;
    }
    isAnimating = false;
  };

  const setCovered = (covered: boolean) => {
    bars.forEach((bar) => {
      bar.style.transform = covered ? "scaleY(1)" : "scaleY(0)";
    });
  };

  if (prefersReducedBarMotion()) {
    setCovered(false);
  }

  const runToggle = (covered: boolean) => {
    if (prefersReducedBarMotion()) {
      setCovered(covered);
      return Promise.resolve();
    }

    if (timeline?.isActive()) {
      timeline.kill();
      timeline = null;
      settlePending();
    }

    isAnimating = true;

    return new Promise<void>((resolve) => {
      pendingResolve = resolve;

      timeline = gsap.timeline({
        onComplete: () => {
          timeline = null;
          pendingResolve = null;
          isAnimating = false;
          resolve();
        },
      });

      timeline.to(bars, {
        scaleY: covered ? 1 : 0,
        transformOrigin: covered ? "top center" : "bottom center",
        duration: DURATION,
        ease: EASE,
        stagger: {
          each: STAGGER,
          from: covered ? "start" : "end",
        },
      });
    });
  };

  return {
    playReveal: () => runToggle(false),
    playCover: () => runToggle(true),
    isAnimating: () => isAnimating,
    destroy: () => {
      if (timeline?.isActive()) {
        timeline.kill();
      }
      timeline = null;
      settlePending();
    },
  };
}

export const BAR_OVERLAY_COUNT = NUM_BARS;
