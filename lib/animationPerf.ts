import { gsap } from "gsap";

const SETTLED_EPSILON = 0.002;

export function isDocumentVisible() {
  return document.visibilityState !== "hidden";
}

export function hasSettled(current: number, target: number, epsilon = SETTLED_EPSILON) {
  return Math.abs(current - target) < epsilon;
}

export function observeElementVisibility(
  element: HTMLElement,
  onChange: (visible: boolean) => void,
  rootMargin = "100px 0px",
) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      onChange(Boolean(entry?.isIntersecting));
    },
    { rootMargin },
  );

  observer.observe(element);
  return () => observer.disconnect();
}

type IdleAwareTickerOptions = {
  rootMargin?: string;
};

/** Cap animation rate — returns true when a new frame should run. */
export function createFrameThrottle(fps: number) {
  const frameMs = 1000 / fps;
  let last = 0;

  return () => {
    const now = performance.now();
    if (now - last < frameMs) return false;
    last = now;
    return true;
  };
}

export function getRenderPixelRatio(max = 1.25, scale = 1) {
  const dpr = window.devicePixelRatio || 1;
  const mobile = window.innerWidth < 768;
  const cap = mobile ? Math.min(max, 1) : max;
  return Math.min(dpr, cap) * scale;
}

/** Runs `tick` on gsap.ticker only while the element is on-screen and the tab is visible. */
export function bindIdleAwareTicker(
  element: HTMLElement,
  tick: () => void,
  options: IdleAwareTickerOptions = {},
) {
  let visible = true;

  const onTick = () => {
    if (!visible || !isDocumentVisible()) return;
    tick();
  };

  const stopVisibility = observeElementVisibility(
    element,
    (nextVisible) => {
      visible = nextVisible;
    },
    options.rootMargin,
  );

  gsap.ticker.add(onTick);

  return () => {
    stopVisibility();
    gsap.ticker.remove(onTick);
  };
}

type SmoothChannel = {
  current: number;
  target: number;
  epsilon?: number;
};

/** Ease channels toward targets; returns true when anything is still moving. */
export function stepSmoothChannels(
  channels: SmoothChannel[],
  rate: number,
): boolean {
  let moving = false;

  for (const channel of channels) {
    const epsilon = channel.epsilon ?? SETTLED_EPSILON;
    const delta = channel.target - channel.current;

    if (Math.abs(delta) > epsilon) {
      channel.current += delta * rate;
      moving = true;
      continue;
    }

    if (channel.current !== channel.target) {
      channel.current = channel.target;
    }
  }

  return moving;
}
