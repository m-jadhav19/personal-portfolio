/**
 * Peel effect ported from Sticker.js by Jongmin Kim
 * (https://github.com/cmiscm/stickerjs, MIT License, © 2014 Jongmin Kim).
 *
 * The original is a browser global that injects styles on load and relies on
 * `arguments.callee`, so it can't be imported into an ES module / SSR build.
 * This keeps its fold geometry (`checkDirection` / `checkPos`) and transitions,
 * but drives caller-owned DOM nodes so React can render the layers and any
 * sticker shape (via CSS masks) instead of the original circle.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
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

const ANIMATE_MS = 600;
const ANIMATE = ["transform", "width", "height"]
  .map((prop) => `${prop} ${ANIMATE_MS / 1000}s cubic-bezier(.23,1,.32,1)`)
  .join(", ");
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

type PointPeel = {
  /** Grab point in the sticker's own box. */
  x: number;
  y: number;
  /** How far the paper has been pulled back from that spot. */
  depth: number;
};

function clampNum(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** The rim closest to the pinch, and where along that rim the pinch sits. */
function grabbedEdge(x: number, y: number, size: number) {
  const gaps: Record<StickerDirection, number> = {
    left: x,
    right: size - x,
    top: y,
    bottom: size - y,
  };
  let direction: StickerDirection = "left";
  let best = Infinity;
  (Object.keys(gaps) as StickerDirection[]).forEach((key) => {
    if (gaps[key] < best) {
      best = gaps[key];
      direction = key;
    }
  });
  const along = direction === "left" || direction === "right" ? y : x;
  return { direction, along: clampNum(along, 0, size) };
}

/** A smooth bite taken out of one rim, pinched around the grab. */
function bitePath(
  direction: StickerDirection,
  d: number,
  a0: number,
  a1: number,
  size: number,
) {
  const mid = (a0 + a1) / 2;
  const n = (v: number) => v.toFixed(1);
  const shoulder = (edge: number, tip: number) => edge + (tip - edge) * 0.42;
  if (direction === "left") {
    return `M 0 ${n(a0)} C ${n(d * 0.25)} ${n(a0)} ${n(d)} ${n(shoulder(a0, mid))} ${n(d)} ${n(mid)} C ${n(d)} ${n(shoulder(a1, mid))} ${n(d * 0.25)} ${n(a1)} 0 ${n(a1)} Z`;
  }
  if (direction === "right") {
    const x = size - d;
    return `M ${n(size)} ${n(a0)} C ${n(size - d * 0.25)} ${n(a0)} ${n(x)} ${n(shoulder(a0, mid))} ${n(x)} ${n(mid)} C ${n(x)} ${n(shoulder(a1, mid))} ${n(size - d * 0.25)} ${n(a1)} ${n(size)} ${n(a1)} Z`;
  }
  if (direction === "top") {
    return `M ${n(a0)} 0 C ${n(a0)} ${n(d * 0.25)} ${n(shoulder(a0, mid))} ${n(d)} ${n(mid)} ${n(d)} C ${n(shoulder(a1, mid))} ${n(d)} ${n(a1)} ${n(d * 0.25)} ${n(a1)} 0 Z`;
  }
  const y = size - d;
  return `M ${n(a0)} ${n(size)} C ${n(a0)} ${n(size - d * 0.25)} ${n(shoulder(a0, mid))} ${n(y)} ${n(mid)} ${n(y)} C ${n(shoulder(a1, mid))} ${n(y)} ${n(a1)} ${n(size - d * 0.25)} ${n(a1)} ${n(size)} Z`;
}

/**
 * Paper curl off the rim nearest the grab. The bite is cut out of the front
 * and the same scrap lifts around the crease, so the underside never sits
 * flat across the face.
 */
export function pointPeelGeometry(x: number, y: number, depth: number, size: number) {
  const { direction, along } = grabbedEdge(x, y, size);
  const d = clampNum(depth, 0, size * 0.2);
  const half = clampNum(size * 0.07 + d * 0.85, size * 0.08, size * 0.16);
  let a0 = along - half;
  let a1 = along + half;
  if (a0 < 0) {
    a1 = Math.min(size, a1 - a0);
    a0 = 0;
  }
  if (a1 > size) {
    a0 = Math.max(0, a0 - (a1 - size));
    a1 = size;
  }
  const mid = (a0 + a1) / 2;
  const hole = bitePath(direction, d, a0, a1, size);
  const origin =
    direction === "left"
      ? `${d}px ${mid}px`
      : direction === "right"
        ? `${size - d}px ${mid}px`
        : direction === "top"
          ? `${mid}px ${d}px`
          : `${mid}px ${size - d}px`;

  // Mirror the bitten scrap across the crease so it lies back on the sticker.
  // The hole stays open; the flap is the same piece, folded over.
  const curl = direction === "left" || direction === "right" ? "scaleX(-1)" : "scaleY(-1)";

  const lip = Math.max(10, d * 0.22);
  const towardCrease =
    direction === "left" ? "right" : direction === "right" ? "left" : direction === "top" ? "bottom" : "top";
  const fromRim = Math.max(0, d - lip).toFixed(1);
  // Soft contact shadow inside the hole, darkest where the paper hinges.
  const shade = `linear-gradient(to ${towardCrease}, transparent ${fromRim}px, rgba(0,0,0,0.42) ${d.toFixed(1)}px)`;
  // Highlight on the hinge, falling off toward the tip. Painted before the mirror.
  const curlShade = `linear-gradient(to ${towardCrease}, rgba(0,0,0,0.12) 0px, rgba(255,248,230,0.1) ${fromRim}px, rgba(255,255,255,0.9) ${d.toFixed(1)}px)`;

  return {
    d,
    direction,
    hole,
    frontClip: `path(evenodd, 'M 0 0 H ${size.toFixed(1)} V ${size.toFixed(1)} H 0 Z ${hole}')`,
    backClip: `path('${hole}')`,
    origin,
    curl,
    shade,
    curlShade,
  };
}

export class StickerPeel {
  private layers: StickerLayers;
  private size: number;
  private direction: StickerDirection | null = null;
  private rest: FoldGeometry | null = null;
  private hideTimer = 0;
  private point: PointPeel | null = null;
  private pointRaf = 0;

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
    if (Math.abs(size - this.size) < 0.5) return;
    this.size = size;
    if (this.point) {
      this.applyPoint();
      return;
    }
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
    this.showBack(true);

    setStyle(mask, { transition: INSTANT, width: `${this.size}px`, height: `${this.size}px`, transform: translate(0, 0) });
    setStyle(move, { transition: INSTANT, transform: translate(0, 0) });
    setStyle(back, { transition: INSTANT, transform: translate(bx, by) });
    setStyle(depth, { transform: translate(-10000, -10000) });
  }

  /**
   * Peel a flap from the grab point `(x, y)`. `depth` is how far that spot
   * has been folded back.
   */
  peelFrom(x: number, y: number, depth: number) {
    cancelAnimationFrame(this.pointRaf);
    window.clearTimeout(this.hideTimer);
    this.direction = "left";
    this.point = { x, y, depth };
    this.applyPoint();
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
    if (this.point) {
      cancelAnimationFrame(this.pointRaf);
      const from = this.point.depth;
      const started = performance.now();
      const duration = 280;
      const tick = (now: number) => {
        if (!this.point) return;
        const t = Math.min(1, (now - started) / duration);
        const eased = 1 - (1 - t) ** 3;
        this.point.depth = from * (1 - eased);
        this.applyPoint();
        if (t < 1) this.pointRaf = requestAnimationFrame(tick);
        else this.reset();
      };
      this.pointRaf = requestAnimationFrame(tick);
      this.direction = null;
      return;
    }
    if (!this.rest) return;
    const { bx, by } = this.rest;
    const { mask, move, back, depth } = this.layers;

    setStyle(mask, { transition: ANIMATE, width: `${this.size}px`, height: `${this.size}px`, transform: translate(0, 0) });
    setStyle(move, { transition: ANIMATE, transform: translate(0, 0) });
    setStyle(back, { transition: ANIMATE, transform: translate(bx, by) });
    setStyle(depth, { transform: translate(-10000, -10000) });
    this.hideTimer = window.setTimeout(() => this.showBack(false), ANIMATE_MS);

    this.direction = null;
    this.rest = null;
  }

  /**
   * At rest the flap is parked flush against the mask's edge; under a 3D tilt the
   * clip's anti-aliased edge leaks a hairline of it, so it's hidden between peels.
   */
  private showBack(visible: boolean) {
    window.clearTimeout(this.hideTimer);
    this.layers.back.style.visibility = visible ? "visible" : "hidden";
  }

  /** Artwork and sheen, clipped on their own so the crease shadow can sit in the bite. */
  private frontArt() {
    const front = this.layers.depth.parentElement;
    if (!front) return [] as Array<HTMLElement | SVGElement>;
    // The portrait is an SVG, which is not an HTMLElement, so a narrower check skips it.
    return Array.from(front.children).filter((el): el is HTMLElement | SVGElement => {
      return (el instanceof HTMLElement || el instanceof SVGElement) && el !== this.layers.depth;
    });
  }

  reset() {
    cancelAnimationFrame(this.pointRaf);
    const { mask, move, back, backShadow, depth } = this.layers;
    const px = `${this.size}px`;
    // Inner layers keep the full sticker size while `mask` shrinks around them.
    setStyle(move, { width: px, height: px });
    setStyle(back, { width: px, height: px });
    setStyle(mask, {
      transition: INSTANT,
      width: px,
      height: px,
      transform: translate(0, 0),
      clipPath: "none",
    });
    setStyle(move, { transition: INSTANT, transform: translate(0, 0) });
    setStyle(back, { transition: INSTANT, transform: translate(this.size, 0), clipPath: "none" });
    back.style.filter = "";
    setStyle(backShadow, {
      width: "100%",
      height: "100%",
      transform: translate(0, 0),
      background: "",
    });
    setStyle(depth, {
      width: "",
      height: "",
      opacity: "",
      background: "",
      clipPath: "none",
      transform: translate(-10000, -10000),
    });
    this.frontArt().forEach((el) => {
      el.style.setProperty("clip-path", "");
    });
    back.style.transformOrigin = "center";
    delete mask.dataset.peel;
    const paper = back.querySelector(":scope > div");
    if (paper instanceof HTMLElement) {
      paper.style.transform = "";
      paper.style.maskImage = "";
      paper.style.setProperty("-webkit-mask-image", "");
    }
    const ghost = back.querySelector("svg");
    if (ghost instanceof SVGElement) {
      ghost.style.transform = "";
      ghost.style.opacity = "";
    }
    this.showBack(false);
    this.direction = null;
    this.rest = null;
    this.point = null;
  }

  private applyPoint() {
    const point = this.point;
    if (!point) return;
    const { mask, move, back, backShadow, depth } = this.layers;
    const g = pointPeelGeometry(point.x, point.y, point.depth, this.size);
    const px = `${this.size}px`;

    back.dataset.direction = g.direction;
    backShadow.dataset.direction = g.direction;
    depth.dataset.direction = g.direction;
    mask.dataset.peel = "curl";
    const lifting = g.d > 1.5;
    this.showBack(lifting);

    const artClip = lifting ? g.frontClip : "";
    this.frontArt().forEach((el) => {
      el.style.setProperty("clip-path", artClip);
    });

    setStyle(mask, {
      transition: INSTANT,
      width: px,
      height: px,
      transform: translate(0, 0),
      clipPath: "none",
    });
    setStyle(move, { transition: INSTANT, transform: translate(0, 0) });
    setStyle(back, {
      transition: INSTANT,
      width: px,
      height: px,
      transform: lifting ? g.curl : translate(0, 0),
      clipPath: lifting ? g.backClip : "none",
    });
    back.style.transformOrigin = g.origin;
    back.style.filter = lifting ? "drop-shadow(3px 4px 3px rgba(0,0,0,0.32))" : "";
    const paper = back.querySelector(":scope > div");
    if (paper instanceof HTMLElement) {
      paper.style.transform = "";
      // Same silhouette as the front, so the fold matches the hole. The mirror
      // transform turns it over; the direction mask would flip it twice.
      const mask = lifting ? "var(--sticker-mask)" : "";
      paper.style.setProperty("mask-image", mask);
      paper.style.setProperty("-webkit-mask-image", mask);
    }
    const ghost = back.querySelector("svg");
    if (ghost instanceof SVGElement) {
      ghost.style.transform = "";
      ghost.style.opacity = lifting ? "0" : "";
    }
    setStyle(backShadow, {
      width: "100%",
      height: "100%",
      transform: translate(0, 0),
      background: lifting ? g.curlShade : "",
    });
    setStyle(depth, {
      width: "100%",
      height: "100%",
      opacity: lifting ? "1" : "",
      clipPath: lifting ? g.backClip : "none",
      transform: translate(0, 0),
      background: lifting ? g.shade : "",
    });
  }
}
