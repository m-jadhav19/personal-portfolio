import { gsap } from "gsap";

const NUM_BARS = 12;
const DURATION = 0.62;
const STAGGER = 0.03;

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
  let pendingResolve: (() => void) | null = null;

  const settlePending = () => {
    if (pendingResolve) {
      pendingResolve();
      pendingResolve = null;
    }
    isAnimating = false;
  };

  gsap.set(bars, { scaleY: 0, transformOrigin: "top center" });

  const timeline = gsap.timeline({ paused: true });
  timeline.to(bars, {
    scaleY: 1,
    duration: DURATION,
    ease: "power3.out",
    easeReverse: "power3.in",
    stagger: STAGGER,
    transformOrigin: "top center",
  });

  const run = (forward: boolean) => {
    if (prefersReducedBarMotion()) {
      gsap.set(bars, { scaleY: forward ? 1 : 0, transformOrigin: "top center" });
      return Promise.resolve();
    }

    const settled = forward ? timeline.progress() === 1 : timeline.progress() === 0;
    if (settled && !timeline.isActive()) return Promise.resolve();

    settlePending();
    isAnimating = true;

    return new Promise<void>((resolve) => {
      pendingResolve = resolve;
      const event = forward ? "onComplete" : "onReverseComplete";
      const other = forward ? "onReverseComplete" : "onComplete";
      timeline.eventCallback(other, null);
      timeline.eventCallback(event, () => {
        timeline.eventCallback(event, null);
        pendingResolve = null;
        isAnimating = false;
        resolve();
      });

      if (forward) timeline.play();
      else timeline.reverse();
    });
  };

  return {
    playReveal: () => run(false),
    playCover: () => run(true),
    isAnimating: () => isAnimating,
    destroy: () => {
      timeline.kill();
      settlePending();
    },
  };
}

export const BAR_OVERLAY_COUNT = NUM_BARS;
