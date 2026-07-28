import { gsap } from "gsap";

import { getLenis, getScrollY } from "@/lib/lenis";

export type ScrollMode =
  | "normal"
  | "inverted"
  | "chaotic"
  | "sideways"
  | "sticky"
  | "laggy"
  | "rubberband";

type BrokenScrollController = {
  apply: (deltaY: number, deltaX: number) => void;
  setMode: (mode: ScrollMode) => void;
  destroy: () => void;
};

function getMaxScrollY() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

function clampScroll(y: number) {
  return Math.max(0, Math.min(getMaxScrollY(), y));
}

export function createBrokenScrollController(): BrokenScrollController {
  let mode: ScrollMode = "inverted";
  let activeTween: gsap.core.Tween | null = null;
  const proxy = { y: 0 };
  const lagBuffer: number[] = [];
  let lagTimeout = 0;

  const setScrollY = (y: number) => {
    const lenis = getLenis();
    const next = clampScroll(y);

    if (lenis) {
      lenis.scrollTo(next, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: next, behavior: "auto" });
    }
  };

  const animateTo = (
    targetY: number,
    options?: { duration?: number; ease?: string; overshoot?: number },
  ) => {
    activeTween?.kill();
    proxy.y = getScrollY();

    const overshoot = options?.overshoot ?? 0;
    const destination = clampScroll(targetY + overshoot);

    activeTween = gsap.to(proxy, {
      y: destination,
      duration: options?.duration ?? 0.32,
      ease: options?.ease ?? "power2.out",
      onUpdate: () => setScrollY(proxy.y),
      onComplete: () => {
        if (overshoot !== 0) {
          activeTween = gsap.to(proxy, {
            y: clampScroll(targetY),
            duration: 0.28,
            ease: "elastic.out(1, 0.75)",
            onUpdate: () => setScrollY(proxy.y),
          });
        }
      },
    });
  };

  const flushLag = () => {
    if (lagBuffer.length === 0) return;

    const burst = lagBuffer.reduce((sum, value) => sum + value, 0);
    lagBuffer.length = 0;

    const current = getScrollY();
    animateTo(current - burst * 1.35, {
      duration: 0.55,
      ease: "back.out(2)",
    });
  };

  const apply = (deltaY: number, deltaX: number) => {
    const current = getScrollY();
    let top = deltaY;
    let left = deltaX;

    switch (mode) {
      case "inverted":
        top = -deltaY * 1.15;
        break;
      case "chaotic":
        top =
          (Math.random() > 0.5 ? 1 : -1) *
          Math.abs(deltaY) *
          (1.2 + Math.random() * 0.8);
        left = (Math.random() - 0.5) * Math.abs(deltaY) * 1.1;
        break;
      case "sideways":
        top = deltaY * 0.08;
        left = deltaY * 1.55;
        break;
      case "sticky": {
        const fightingBack = Math.random() > 0.3;
        top = fightingBack ? -deltaY * 1.1 : deltaY * 0.15;
        break;
      }
      case "laggy":
        lagBuffer.push(deltaY);
        window.clearTimeout(lagTimeout);
        lagTimeout = window.setTimeout(flushLag, 280);
        if (left !== 0) window.scrollBy({ left, behavior: "auto" });
        return;
      case "rubberband":
        top = deltaY * (Math.random() > 0.5 ? -1 : 1);
        animateTo(current + top, {
          duration: 0.42,
          ease: "power3.out",
          overshoot: top * 0.35,
        });
        if (left !== 0) window.scrollBy({ left, behavior: "auto" });
        return;
      default:
        break;
    }

    const targetY = current + top;

    if (mode === "chaotic" || mode === "sticky") {
      animateTo(targetY, {
        duration: mode === "chaotic" ? 0.48 : 0.58,
        ease: mode === "chaotic" ? "elastic.out(1, 0.55)" : "power4.inOut",
        overshoot: mode === "sticky" && Math.random() > 0.5 ? -top * 0.45 : 0,
      });
    } else {
      animateTo(targetY, {
        duration: 0.26,
        ease: "power2.out",
      });
    }

    if (left !== 0) {
      window.scrollBy({ left, behavior: "auto" });
    }

    if (mode === "chaotic" && Math.random() > 0.55) {
      window.setTimeout(() => {
        animateTo(getScrollY() - top * 0.4, {
          duration: 0.22,
          ease: "power1.inOut",
        });
      }, 120);
    }
  };

  return {
    apply,
    setMode: (nextMode) => {
      mode = nextMode;
      lagBuffer.length = 0;
      window.clearTimeout(lagTimeout);
    },
    destroy: () => {
      activeTween?.kill();
      lagBuffer.length = 0;
      window.clearTimeout(lagTimeout);
    },
  };
}

export const SCROLL_MODE_META: Record<
  ScrollMode,
  { label: string; short: string; tone: string }
> = {
  normal: { label: "Normal (temporary)", short: "NORMAL", tone: "modeNormal" },
  inverted: { label: "Inverted scroll", short: "INVERTED", tone: "modeInverted" },
  chaotic: { label: "Chaotic scroll", short: "CHAOTIC", tone: "modeChaotic" },
  sideways: { label: "Sideways scroll", short: "SIDEWAYS", tone: "modeSideways" },
  sticky: { label: "Sticky / fighting back", short: "STICKY", tone: "modeSticky" },
  laggy: { label: "Laggy buffered scroll", short: "LAGGY", tone: "modeLaggy" },
  rubberband: {
    label: "Rubberband overshoot",
    short: "BOUNCE",
    tone: "modeRubberband",
  },
};

export function pickScrollMode(current: ScrollMode): ScrollMode {
  const roll = Math.random();
  if (current === "inverted" && roll < 0.35) return "inverted";
  if (roll < 0.28) return "inverted";
  if (roll < 0.42) return "chaotic";
  if (roll < 0.55) return "sticky";
  if (roll < 0.68) return "laggy";
  if (roll < 0.8) return "rubberband";
  if (roll < 0.9) return "sideways";
  return "normal";
}
