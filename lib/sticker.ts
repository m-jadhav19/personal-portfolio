/**
 * Peel effect ported from Sticker.js by Jongmin Kim
 * (https://github.com/cmiscm/stickerjs, MIT License, © 2014 Jongmin Kim).
 *
 * The original is a browser global that injects styles on load and relies on
 * `arguments.callee`, so it can't be imported into an ES module / SSR build.
 * This keeps its fold geometry (`checkDirection` / `checkPos`) and transitions,
 * but drives caller-owned DOM nodes so React can render the layers and any
 * sticker shape (via CSS masks) instead of the original circle.
 */

export type StickerDirection = "left" | "right" | "top" | "bottom";

export type StickerLayers = {
  /** Clips the remaining (un-peeled) front. */
  mask: HTMLElement;
  /** Counter-translates so front content stays put while `mask` shrinks. */
  move: HTMLElement;
  /** Peeled flap (sticker back). */
  back: HTMLElement;
  /** Gradient inside the flap. */
  backShadow: HTMLElement;
  /** Shadow cast on the front just under the fold. */
  depth: HTMLElement;
};

type FoldGeometry = {
  bx: number;
  by: number;
  bs: StickerDirection;
  bmx: number;
  bmy: number;
  bsw: number;
  bsh: number;
  bsx: number;
  bsy: number;
  cw: number;
  ch: number;
  cx: number;
  cy: number;
  dw: number;
  dh: number;
  dx: number;
  dy: number;
};

const ANIMATE = "all 0.6s cubic-bezier(.23,1,.32,1)";
const INSTANT = "all 0s";

function translate(x: number, y: number) {
  return `translate(${x}px, ${y}px)`;
}

function setStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, style);
}

/** Which edge the peel starts from, given a point inside a `size` square. */
export function stickerDirection(
  x: number,
  y: number,
  size: number,
): StickerDirection {
  const q = size / 4;
  if (x < q) return "left";
  if (x > q * 3) return "right";
  if (y < q) return "top";
  return "bottom";
}

/** Sticker.js fold math — `x`/`y` are relative to the sticker's top-left. */
export function stickerFold(
  direction: StickerDirection,
  x: number,
  y: number,
  size: number,
): FoldGeometry {
  const a = size - x;
  const b = size - y;
  const c = x / 2;
  const d = y / 2;
  const e = a / 2;
  const f = b / 2;

  switch (direction) {
    case "left":
      return { bx: -size, by: 0, bs: direction, bmx: -size + x, bmy: 0, bsw: x, bsh: size, bsx: a, bsy: 0, cw: size - c, ch: size, cx: c, cy: 0, dw: c, dh: size, dx: c - c / 2, dy: 0 };
    case "right":
      return { bx: size, by: 0, bs: direction, bmx: x, bmy: 0, bsw: a, bsh: size, bsx: 0, bsy: 0, cw: size - e, ch: size, cx: 0, cy: 0, dw: e, dh: size, dx: size - a + e / 2, dy: 0 };
    case "top":
      return { bx: 0, by: -size, bs: direction, bmx: 0, bmy: -size + y, bsw: size, bsh: y, bsx: 0, bsy: b, cw: size, ch: size - d, cx: 0, cy: d, dw: size, dh: d, dx: 0, dy: d - d / 2 };
    default:
      return { bx: 0, by: size, bs: direction, bmx: 0, bmy: y, bsw: size, bsh: b, bsx: 0, bsy: 0, cw: size, ch: size - f, cx: 0, cy: 0, dw: size, dh: f, dx: 0, dy: size - b + f / 2 };
  }
}

export class StickerPeel {
  private layers: StickerLayers;
  private size: number;
  private direction: StickerDirection | null = null;
  private rest: FoldGeometry | null = null;

  constructor(layers: StickerLayers, size: number) {
    this.layers = layers;
    this.size = size;
    this.reset();
  }

  get active() {
    return this.direction !== null;
  }

  get currentDirection() {
    return this.direction;
  }

  setSize(size: number) {
    this.size = size;
    this.reset();
  }

  /** Start a peel from the edge nearest to (x, y). */
  begin(x: number, y: number, direction = stickerDirection(x, y, this.size)) {
    const { mask, move, back, depth } = this.layers;
    this.direction = direction;
    this.rest = stickerFold(direction, x, y, this.size);
    const { bx, by } = this.rest;

    back.dataset.direction = direction;
    this.layers.backShadow.dataset.direction = direction;
    depth.dataset.direction = direction;

    setStyle(mask, { transition: INSTANT, width: `${this.size}px`, height: `${this.size}px`, transform: translate(0, 0) });
    setStyle(move, { transition: INSTANT, transform: translate(0, 0) });
    setStyle(back, { transition: INSTANT, transform: translate(bx, by) });
    setStyle(depth, { transform: translate(-10000, -10000) });
  }

  /** Follow the pointer; (x, y) relative to the sticker's top-left. */
  update(x: number, y: number) {
    if (!this.direction) this.begin(x, y);
    const direction = this.direction as StickerDirection;
    const clampedX = Math.min(this.size, Math.max(0, x));
    const clampedY = Math.min(this.size, Math.max(0, y));
    const g = stickerFold(direction, clampedX, clampedY, this.size);
    const { mask, move, back, backShadow, depth } = this.layers;

    setStyle(mask, { width: `${g.cw}px`, height: `${g.ch}px`, transform: translate(g.cx, g.cy) });
    setStyle(move, { transform: translate(-g.cx, -g.cy) });
    setStyle(back, { transform: translate(g.bmx, g.bmy) });
    setStyle(backShadow, { width: `${g.bsw}px`, height: `${g.bsh}px`, transform: translate(g.bsx, g.bsy) });
    setStyle(depth, { width: `${g.dw}px`, height: `${g.dh}px`, transform: translate(g.dx, g.dy) });
  }

  /** Smoothly lay the sticker back down (Sticker.js `onLeave`). */
  release() {
    if (!this.rest) return;
    const { bx, by } = this.rest;
    const { mask, move, back, depth } = this.layers;

    setStyle(mask, { transition: ANIMATE, width: `${this.size}px`, height: `${this.size}px`, transform: translate(0, 0) });
    setStyle(move, { transition: ANIMATE, transform: translate(0, 0) });
    setStyle(back, { transition: ANIMATE, transform: translate(bx, by) });
    setStyle(depth, { transform: translate(-10000, -10000) });

    this.direction = null;
    this.rest = null;
  }

  reset() {
    const { mask, move, back, depth } = this.layers;
    const px = `${this.size}px`;
    // Inner layers keep the full sticker size while `mask` shrinks around them.
    setStyle(move, { width: px, height: px });
    setStyle(back, { width: px, height: px });
    setStyle(mask, { transition: INSTANT, width: px, height: px, transform: translate(0, 0) });
    setStyle(move, { transition: INSTANT, transform: translate(0, 0) });
    setStyle(back, { transition: INSTANT, transform: translate(this.size, 0) });
    setStyle(depth, { transform: translate(-10000, -10000) });
    this.direction = null;
    this.rest = null;
  }
}
