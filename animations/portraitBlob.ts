import { gsap } from "gsap";

import { prefersReducedShapeMotion } from "@/animations/shapeOverlay";

export const MERCURY_CORE = "#6ee7ff";
export const MERCURY_MID = "#38bdf8";
export const MERCURY_DEEP = "#0284c7";
export const MERCURY_GLOW = "rgba(110, 231, 255, 0.55)";

const NUM_POINTS = 16;
const CENTER = 50;
const RADIUS_MIN = 37;
const RADIUS_MAX = 43;
const RADIUS_MAX_HOVER = 45;
const POINTER_INFLUENCE = 5.5;
const POINTER_RADIUS = 40;
const SCROLL_STRETCH = 0.028;
const SCROLL_CENTER = 0.014;

type PointerState = {
  x: number;
  y: number;
  active: boolean;
  strength: number;
};

type BlobCenter = { x: number; y: number };
type BlobStretch = { x: number; y: number };
type BreatheStretch = { x: number; y: number };
type IdleWobble = { x: number; y: number };

function createRandomRadius(getHoverIntensity: () => number) {
  return () => {
    const hoverIntensity = getHoverIntensity();
    const max =
      RADIUS_MAX + hoverIntensity * (RADIUS_MAX_HOVER - RADIUS_MAX);
    const span = max - RADIUS_MIN;
    return RADIUS_MIN + Math.random() * span * 0.55 + span * 0.2;
  };
}

export function createBlobPath(
  radii: number[],
  pointer: PointerState,
  center: BlobCenter,
  scrollStretch: BlobStretch,
  breatheStretch: BreatheStretch,
  idleWobble: IdleWobble,
) {
  const points = radii.map((radius, index) => {
    const angle = (index / radii.length) * Math.PI * 2 - Math.PI / 2;
    const stretchX = 1 + scrollStretch.x + breatheStretch.x + idleWobble.x;
    const stretchY = 1 + scrollStretch.y + breatheStretch.y + idleWobble.y;
    let r = radius;

    if (pointer.active) {
      const pointX = center.x + Math.cos(angle) * r * stretchX;
      const pointY = center.y + Math.sin(angle) * r * stretchY;
      const distance = Math.hypot(pointer.x - pointX, pointer.y - pointY);
      const proximity = Math.max(0, 1 - distance / POINTER_RADIUS);
      const pointerAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x);
      const alignment = (Math.cos(angle - pointerAngle) + 1) * 0.5;
      r += proximity * alignment * POINTER_INFLUENCE * pointer.strength;
    }

    const x = center.x + Math.cos(angle) * r * stretchX;
    const y = center.y + Math.sin(angle) * r * stretchY;

    return [x, y] as const;
  });

  let path = `M ${points[0][0]},${points[0][1]}`;

  for (let index = 0; index < points.length; index += 1) {
    const previous = points[(index - 1 + points.length) % points.length];
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const afterNext = points[(index + 2) % points.length];

    const controlOneX = current[0] + (next[0] - previous[0]) / 7;
    const controlOneY = current[1] + (next[1] - previous[1]) / 7;
    const controlTwoX = next[0] - (afterNext[0] - current[0]) / 7;
    const controlTwoY = next[1] - (afterNext[1] - current[1]) / 7;

    path += ` C ${controlOneX},${controlOneY} ${controlTwoX},${controlTwoY} ${next[0]},${next[1]}`;
  }

  return `${path} Z`;
}

type PortraitBlobControllerOptions = {
  clipPath: SVGPathElement;
  outlinePath?: SVGPathElement | null;
  fillPath?: SVGPathElement | null;
  highlightPath?: SVGPathElement | null;
  onPathChange?: (path: string) => void;
};

export function createPortraitBlobController({
  clipPath,
  outlinePath,
  fillPath,
  highlightPath,
  onPathChange,
}: PortraitBlobControllerOptions) {
  const hoverState = { value: 0 };
  const pointer: PointerState = {
    x: CENTER,
    y: CENTER,
    active: false,
    strength: 0,
  };
  const center: BlobCenter = { x: CENTER, y: CENTER };
  const scrollStretch: BlobStretch = { x: 0, y: 0 };
  const breatheStretch: BreatheStretch = { x: 0, y: 0 };
  const idleWobble: IdleWobble = { x: 0, y: 0 };
  const randomRadius = createRandomRadius(() => hoverState.value);
  const radii = Array.from({ length: NUM_POINTS }, () => randomRadius());

  const morphTweens: gsap.core.Tween[] = [];
  let hoverTween: gsap.core.Tween | null = null;
  let pointerTween: gsap.core.Tween | null = null;
  let scrollTween: gsap.core.Tween | null = null;
  let driftTween: gsap.core.Tween | null = null;
  let breatheTween: gsap.core.Tween | null = null;
  let wobbleTween: gsap.core.Tween | null = null;
  let morphSpeedTween: gsap.core.Tween | null = null;
  let baseMorphTimeScale = 1;
  let currentMorphTimeScale = 1;

  const render = () => {
    const path = createBlobPath(
      radii,
      pointer,
      center,
      scrollStretch,
      breatheStretch,
      idleWobble,
    );
    clipPath.setAttribute("d", path);
    outlinePath?.setAttribute("d", path);
    fillPath?.setAttribute("d", path);
    highlightPath?.setAttribute("d", path);
    onPathChange?.(path);
  };

  const setMorphTimeScale = (scale: number) => {
    morphTweens.forEach((tween) => {
      tween.timeScale(scale);
    });
    if (driftTween) driftTween.timeScale(scale);
    if (breatheTween) breatheTween.timeScale(scale);
    if (wobbleTween) wobbleTween.timeScale(scale);
  };

  const animateMorphTimeScale = (target: number, duration = 0.7) => {
    morphSpeedTween?.kill();
    morphSpeedTween = gsap.to(
      { value: currentMorphTimeScale },
      {
        value: target,
        duration,
        ease: "power2.out",
        onUpdate() {
          currentMorphTimeScale = this.targets()[0].value;
          setMorphTimeScale(currentMorphTimeScale);
        },
      },
    );
  };

  const start = () => {
    render();

    if (prefersReducedShapeMotion()) {
      return;
    }

    radii.forEach((_, pointIndex) => {
      const tween = gsap.to(radii, {
        [pointIndex]: randomRadius(),
        duration: 9 + Math.random() * 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: pointIndex * 0.45,
        onUpdate: render,
      });
      morphTweens.push(tween);
    });

    driftTween = gsap.to(center, {
      x: CENTER + 1.6,
      y: CENTER - 1.2,
      duration: 14,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      onUpdate: render,
    });

    breatheTween = gsap.to(breatheStretch, {
      x: 0.022,
      y: 0.028,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      onUpdate: render,
    });

    wobbleTween = gsap.to(idleWobble, {
      x: 0.012,
      y: 0.008,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      onUpdate: render,
    });
  };

  const setHover = (hovered: boolean) => {
    hoverTween?.kill();
    hoverTween = gsap.to(hoverState, {
      value: hovered ? 1 : 0,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: render,
    });
    animateMorphTimeScale(hovered ? 1.15 : baseMorphTimeScale);
  };

  const setPointer = (x: number, y: number, active: boolean) => {
    pointer.active = active;
    pointerTween?.kill();

    const targets = { x: pointer.x, y: pointer.y, strength: pointer.strength };

    pointerTween = gsap.to(targets, {
      x,
      y,
      strength: active ? 1 : 0,
      duration: active ? 0.75 : 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        pointer.x = targets.x;
        pointer.y = targets.y;
        pointer.strength = targets.strength;
        render();
      },
    });
  };

  const setScroll = (delta: number, progress: number) => {
    const isIdle = Math.abs(delta) < 0.25;
    const targetStretch = isIdle
      ? 0
      : Math.max(-0.1, Math.min(0.14, delta * SCROLL_STRETCH));

    scrollTween?.kill();
    scrollTween = gsap.to(scrollStretch, {
      y: targetStretch,
      x: targetStretch * 0.25,
      duration: isIdle ? 1.6 : 1,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: render,
    });

    gsap.to(center, {
      y: CENTER + (progress - 0.5) * 4 + (isIdle ? 0 : delta * SCROLL_CENTER),
      duration: isIdle ? 1.6 : 1,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: render,
    });

    baseMorphTimeScale = isIdle
      ? 1
      : 1 + Math.min(Math.abs(delta) * 0.03, 0.45);
    if (!hoverState.value) {
      animateMorphTimeScale(baseMorphTimeScale, isIdle ? 1.2 : 0.8);
    }
  };

  const destroy = () => {
    hoverTween?.kill();
    pointerTween?.kill();
    scrollTween?.kill();
    driftTween?.kill();
    breatheTween?.kill();
    wobbleTween?.kill();
    morphSpeedTween?.kill();
    morphTweens.forEach((tween) => tween.kill());
    morphTweens.length = 0;
  };

  return { start, setHover, setPointer, setScroll, destroy };
}

export function getBlobSpawnPoint(
  angle: number,
  radius = 41,
  center = CENTER,
) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: center + Math.cos(rad - Math.PI / 2) * radius,
    y: center + Math.sin(rad - Math.PI / 2) * radius,
  };
}
