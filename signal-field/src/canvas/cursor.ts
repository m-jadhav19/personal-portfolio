import { gsap } from "gsap";

import { clamp } from "../utils/math.ts";

export type CursorState = {
  x: number;
  y: number;
  rawX: number;
  rawY: number;
  xNorm: number;
  yNorm: number;
  speed: number;
};

export type CursorTracker = {
  getState: () => CursorState;
  getSmoothed: () => { x: number; y: number };
  onMove: (x: number, y: number) => void;
};

export function createCursorTracker(): CursorTracker {
  const smoothed = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const cursorX = gsap.quickTo(smoothed, "x", { duration: 0.5, ease: "power3" });
  const cursorY = gsap.quickTo(smoothed, "y", { duration: 0.5, ease: "power3" });

  let rawX = smoothed.x;
  let rawY = smoothed.y;
  let lastX = rawX;
  let lastY = rawY;
  let lastT = performance.now();
  let speed = 0;

  const onMove = (x: number, y: number) => {
    rawX = x;
    rawY = y;
    cursorX(x);
    cursorY(y);

    const now = performance.now();
    const dt = Math.max(now - lastT, 1);
    const dx = rawX - lastX;
    const dy = rawY - lastY;
    const rawSpeed = Math.sqrt(dx * dx + dy * dy) / dt;
    speed = speed * 0.7 + rawSpeed * 0.3;
    lastX = rawX;
    lastY = rawY;
    lastT = now;
  };

  const getState = (): CursorState => {
    const xNorm = clamp(rawX / window.innerWidth, 0, 1);
    const yNorm = clamp(rawY / window.innerHeight, 0, 1);
    return { x: rawX, y: rawY, rawX, rawY, xNorm, yNorm, speed };
  };

  return {
    getState,
    getSmoothed: () => ({ x: smoothed.x, y: smoothed.y }),
    onMove,
  };
}
