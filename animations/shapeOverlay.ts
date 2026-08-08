import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { INTRO_DURATION } from "@/lib/motion";
import { getLenis, resetScrollToTop } from "@/lib/lenis";

const NUM_POINTS = 10;
const DELAY_POINTS_MAX = 0.3;
const DELAY_PER_PATH = 0.25;
const DURATION = 0.9;
const LOADER_DELAY_POINTS_MAX = 0.18;
const LOADER_DELAY_PER_PATH = 0.14;
const EASE = "power2.inOut";
const SCROLL_TOP_THRESHOLD = 4;

type OverlayTheme = "loader" | "scroll-top" | "myspace";

export function setOverlayTheme(theme: OverlayTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.overlayTheme = theme;
}

export function clearOverlayTheme() {
  if (typeof document === "undefined") return;
  delete document.documentElement.dataset.overlayTheme;
}

let controller: ShapeOverlayController | null = null;

export function registerShapeOverlay(next: ShapeOverlayController | null) {
  controller = next;
}

export type ShapeOverlayController = {
  playReveal: () => Promise<void>;
  playLoaderReveal: () => Promise<void>;
  playCover: () => Promise<void>;
  isAnimating: () => boolean;
};

export function playReveal() {
  return controller?.playReveal() ?? Promise.resolve();
}

export function playLoaderReveal() {
  setOverlayTheme("loader");
  return controller?.playLoaderReveal() ?? Promise.resolve();
}

export function playCover() {
  return controller?.playCover() ?? Promise.resolve();
}

export function isShapeOverlayAnimating() {
  return controller?.isAnimating() ?? false;
}

export function prefersReducedShapeMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getScrollTop() {
  const lenis = getLenis();
  if (lenis && typeof lenis.scroll === "number") {
    return lenis.scroll;
  }
  return window.scrollY;
}

function scrollToTopImmediate() {
  resetScrollToTop();
}

export async function playScrollToTop() {
  if (prefersReducedShapeMotion()) {
    scrollToTopImmediate();
    return;
  }

  if (getScrollTop() <= SCROLL_TOP_THRESHOLD) {
    return;
  }

  if (isShapeOverlayAnimating()) {
    return;
  }

  const lenis = getLenis();
  lenis?.stop();

  setOverlayTheme("scroll-top");

  try {
    await playCover();
    scrollToTopImmediate();
    await playReveal();
  } finally {
    lenis?.start();
  }
}

export function buildPathData(points: number[], isOpened: boolean) {
  let d = isOpened ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;

  for (let j = 0; j < NUM_POINTS - 1; j++) {
    const p = ((j + 1) / (NUM_POINTS - 1)) * 100;
    const cp = p - (1 / (NUM_POINTS - 1)) * 100 * 0.5;
    d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
  }

  d += isOpened ? ` V 100 H 0` : ` V 0 H 0`;
  return d;
}

function isRevealed(points: number[][]) {
  return points.every((path) => path.every((value) => value === 0));
}

function isCovered(points: number[][]) {
  return points.every((path) => path.every((value) => value === 100));
}

export function createShapeOverlayController(paths: SVGPathElement[]) {
  const numPaths = paths.length;
  const allPoints: number[][] = [];
  const pointsDelay: number[] = [];
  let isAnimating = false;
  let timeline: gsap.core.Timeline | null = null;

  for (let i = 0; i < numPaths; i++) {
    const points: number[] = [];
    allPoints.push(points);
    for (let j = 0; j < NUM_POINTS; j++) {
      points.push(100);
    }
  }

  const startRevealed = prefersReducedShapeMotion();

  if (startRevealed) {
    for (let i = 0; i < numPaths; i++) {
      for (let j = 0; j < NUM_POINTS; j++) {
        allPoints[i][j] = 0;
      }
    }
  }

  const render = () => {
    for (let i = 0; i < numPaths; i++) {
      // Keep isOpened=false — points at 0 reveal, points at 100 cover.
      paths[i].setAttribute("d", buildPathData(allPoints[i], false));
    }
  };

  const runToggle = (
    target: 0 | 100,
    options?: {
      duration?: number;
      delayPointsMax?: number;
      delayPerPath?: number;
    },
  ) => {
    const duration = options?.duration ?? DURATION;
    const delayPointsMax = options?.delayPointsMax ?? DELAY_POINTS_MAX;
    const delayPerPath = options?.delayPerPath ?? DELAY_PER_PATH;

    if (prefersReducedShapeMotion()) {
      for (let i = 0; i < numPaths; i++) {
        for (let j = 0; j < NUM_POINTS; j++) {
          allPoints[i][j] = target;
        }
      }
      render();
      return Promise.resolve();
    }

    if (timeline?.isActive()) {
      timeline.kill();
    }

    const revealing = target === 0;

    for (let i = 0; i < NUM_POINTS; i++) {
      pointsDelay[i] = Math.random() * delayPointsMax;
    }

    isAnimating = true;

    return new Promise<void>((resolve) => {
      timeline = gsap.timeline({
        onUpdate: render,
        defaults: {
          ease: EASE,
          duration,
        },
        onComplete: () => {
          isAnimating = false;
          resolve();
        },
      });

      for (let i = 0; i < numPaths; i++) {
        const points = allPoints[i];
        const pathDelay =
          delayPerPath * (revealing ? i : numPaths - i - 1);

        for (let j = 0; j < NUM_POINTS; j++) {
          const delay = pointsDelay[j];
          timeline.to(
            points,
            {
              [j]: target,
            },
            delay + pathDelay,
          );
        }
      }
    });
  };

  render();

  return {
    playReveal: () => {
      if (isRevealed(allPoints) && !isAnimating) {
        return Promise.resolve();
      }
      return runToggle(0);
    },
    playLoaderReveal: () => {
      if (isRevealed(allPoints) && !isAnimating) {
        return Promise.resolve();
      }
      return runToggle(0, {
        duration: INTRO_DURATION.loaderReveal,
        delayPointsMax: LOADER_DELAY_POINTS_MAX,
        delayPerPath: LOADER_DELAY_PER_PATH,
      });
    },
    playCover: () => {
      if (isCovered(allPoints) && !isAnimating) {
        return Promise.resolve();
      }
      return runToggle(100);
    },
    isAnimating: () => isAnimating,
    destroy: () => {
      timeline?.kill();
      timeline = null;
      isAnimating = false;
    },
  };
}
