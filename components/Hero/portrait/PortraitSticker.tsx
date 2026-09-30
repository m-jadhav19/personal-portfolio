"use client";

import { gsap } from "gsap";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { isDestroyEggActive } from "@/lib/easterEggs/destroy/isActive";
import { getDestroyWatchTarget } from "@/lib/easterEggs/destroy/watchTarget";
import { scrollByDelta } from "@/lib/lenis";
import { StickerPeel } from "@/lib/sticker";

import {
  PORTRAIT_BOXES as BOX,
  PORTRAIT_COLORS as COLOR,
  PORTRAIT_LIP as LIP,
  PORTRAIT_PATHS as PATH,
  PORTRAIT_VIEWBOX as VB,
} from "./portraitPaths";
import styles from "./PortraitSticker.module.css";

type Part =
  | "hair"
  | "brows"
  | "glasses"
  | "eyes"
  | "beard"
  | "ear"
  | "face"
  | "sparks"
  | "bracket-left"
  | "bracket-right";

const HINTS: Record<Part, string> = {
  hair: "boing",
  brows: "hmm?",
  glasses: "click to blink",
  eyes: "click to wink",
  beard: "click to chat",
  ear: "listening",
  face: "right-click to peel me off",
  sparks: "idea!",
  "bracket-left": "click to close the tag",
  "bracket-right": "click to close the tag",
};

/** Square crop around the head — the part that behaves like a sticker. */
const SIDE = Math.max(BOX.head.w, BOX.head.h) + 14;
const CROP = {
  x: BOX.head.cx - SIDE / 2,
  y: BOX.head.cy - SIDE / 2,
  size: SIDE,
};

/** Fraction of the sticker (from each edge) that grabs a peel. */
const EDGE = 0.2;
const DRAG_THRESHOLD = 6;
const PUPIL_RANGE = { x: 7, y: 4.5 };
const TILT = 14;
/** Peel past this fraction and letting go tosses the sticker off to re-stick. */
const FLING_AT = 0.55;
const COMBO_HITS = 6;
const COMBO_WINDOW = 1400;
const GLYPHS = ["</>", "{ }", "=>", ";", "( )", "✦", "#", "01"];
const GLYPH_COLORS = [COLOR.cobalt, COLOR.cream, COLOR.cobalt, "#ffd23f"];
const MAX_PARTICLES = 60;

/** How far (in artwork units) each feature shifts when the head "turns" toward the pointer. */
const FACE_SHIFT = {
  ear: { x: -4, y: 1.5 },
  hair: { x: 3, y: 2.5 },
  brows: { x: 5, y: 4 },
  beard: { x: 4, y: 2 },
  eyes: { x: 6, y: 4 },
} as const;
const SURPRISE_SPEED = 3.2;
const IDLE_LOOK_MS = 5000;
const IDLE_SLEEP_MS = 11000;
/** Gap kept between a carried sticker and the viewport edges. */
const BOUNDS_MARGIN = 16;
/** Dropping within this fraction of the sticker's width from home snaps it back. */
const SNAP_HOME = 0.45;
/** Off the hero the sticker shrinks to this fraction of its hero size. */
const AWAY_RATIO = 0.7;
const AWAY_MIN_WIDTH = 170;
const CARRY_SCALE = 1.1;
/** Touch: hold this long without moving to peel the sticker off. */
const LONG_PRESS_MS = 380;
const PRESS_SLOP = 10;
const HOLD_HINT = "hold to peel me off";
/** Touch-carrying near the top/bottom edge scrolls the page this fast (px per frame). */
const EDGE_SCROLL_ZONE = 72;
const EDGE_SCROLL_SPEED = 14;

type Mode = "home" | "lifting" | "carrying" | "moving" | "placed";
type CarryInput = "mouse" | "touch";

function silhouetteMask(transform = "") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CROP.x} ${CROP.y} ${CROP.size} ${CROP.size}"><g transform="${transform}"><path fill="#000" d="${PATH.base}"/></g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Code glyphs that pop out of a click, arc up and fall with gravity. `x`/`y` are viewport coords. */
function spawnBurst(
  layer: HTMLElement,
  x: number,
  y: number,
  count: number,
  power = 1,
) {
  const n = Math.min(count, MAX_PARTICLES - layer.childElementCount);
  for (let i = 0; i < n; i++) {
    const el = document.createElement("span");
    el.className = styles.glyph;
    el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    el.style.color = GLYPH_COLORS[i % GLYPH_COLORS.length];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    layer.appendChild(el);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
    const distance = (50 + Math.random() * 70) * power;
    const dx = Math.cos(angle) * distance;
    const rise = Math.sin(angle) * distance;
    const fall = 70 + Math.random() * 70;
    const duration = 0.9 + Math.random() * 0.45;

    gsap
      .timeline({ onComplete: () => el.remove() })
      .set(el, { xPercent: -50, yPercent: -50, scale: 0.3, rotation: (Math.random() - 0.5) * 60 })
      .to(el, { scale: 1, duration: 0.22, ease: "back.out(3)" }, 0)
      .to(el, { x: dx, duration, ease: "power1.out" }, 0)
      .to(el, { y: rise, duration: duration * 0.4, ease: "power2.out" }, 0)
      .to(el, { y: rise + fall, duration: duration * 0.6, ease: "power2.in" }, duration * 0.4)
      .to(el, { rotation: `+=${(Math.random() - 0.5) * 260}`, duration, ease: "none" }, 0)
      .to(el, { opacity: 0, duration: 0.3 }, duration - 0.3);
  }
}

/** Sleepy "z"s drifting up from a point. */
function spawnSnore(layer: HTMLElement, x: number, y: number) {
  ["z", "Z", "z"].forEach((letter, i) => {
    const el = document.createElement("span");
    el.className = `${styles.glyph} ${styles.snore}`;
    el.textContent = letter;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    layer.appendChild(el);
    gsap
      .timeline({ delay: i * 0.35, onComplete: () => el.remove() })
      .set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.5 })
      .to(el, { autoAlpha: 1, scale: 1 + i * 0.25, duration: 0.3 })
      .to(el, { x: 18 + i * 10, y: -50 - i * 14, duration: 1.4, ease: "sine.out" }, 0)
      .to(el, { autoAlpha: 0, duration: 0.4 }, 1.1);
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Carry = {
  pickup: (clientX: number, clientY: number) => void;
  goHome: () => void;
};

type PortraitStickerProps = {
  label: string;
};

export function PortraitSticker({ label }: PortraitStickerProps) {
  const artRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const backShadowRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<HTMLDivElement>(null);
  const peelRef = useRef<StickerPeel | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    peeling: boolean;
    progress: number;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const reducedRef = useRef(false);
  const actionsRef = useRef<Record<string, () => void>>({});
  const carryRef = useRef<Carry | null>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const tiltToRef = useRef<((x: number, y: number) => void) | null>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);
  const modeRef = useRef<Mode>("home");
  const hitsRef = useRef<number[]>([]);

  const [hint, setHint] = useState<string | null>(null);
  const [carrying, setCarrying] = useState<CarryInput | null>(null);
  const [away, setAway] = useState(false);

  const maskVars = useMemo(() => {
    const mirrorX = `translate(${CROP.x * 2 + CROP.size} 0) scale(-1 1)`;
    const mirrorY = `translate(0 ${CROP.y * 2 + CROP.size}) scale(1 -1)`;
    return {
      "--sticker-mask": silhouetteMask(),
      "--sticker-mask-mirror-x": silhouetteMask(mirrorX),
      "--sticker-mask-mirror-y": silhouetteMask(mirrorY),
    } as CSSProperties;
  }, []);

  const slotPosition: CSSProperties = {
    left: `${(CROP.x / VB.width) * 100}%`,
    top: `${(CROP.y / VB.height) * 100}%`,
    width: `${(CROP.size / VB.width) * 100}%`,
  };

  // ─── Sticker.js peel ────────────────────────────────────────────────────
  useEffect(() => {
    const sticker = stickerRef.current;
    const mask = maskRef.current;
    const move = moveRef.current;
    const back = backRef.current;
    const backShadow = backShadowRef.current;
    const depth = depthRef.current;
    if (!sticker || !mask || !move || !back || !backShadow || !depth) return;

    reducedRef.current = prefersReducedMotion();
    const peel = new StickerPeel(
      { mask, move, back, backShadow, depth },
      sticker.getBoundingClientRect().width,
    );
    peelRef.current = peel;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) peel.setSize(entry.contentRect.width);
    });
    observer.observe(sticker);

    return () => {
      observer.disconnect();
      peelRef.current = null;
    };
  }, []);

  const localPoint = (clientX: number, clientY: number) => {
    const rect = stickerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: clientX - rect.left, y: clientY - rect.top, size: rect.width };
  };

  const inEdge = (x: number, y: number, size: number) => {
    const q = size * EDGE;
    return x < q || x > size - q || y < q || y > size - q;
  };

  const peelProgress = (x: number, y: number, size: number) => {
    const direction = peelRef.current?.currentDirection;
    const raw =
      direction === "left"
        ? x
        : direction === "right"
          ? size - x
          : direction === "top"
            ? y
            : size - y;
    return Math.min(1, Math.max(0, raw / size));
  };

  const interactive = () =>
    !reducedRef.current &&
    !busyRef.current &&
    (modeRef.current === "home" || modeRef.current === "placed");

  const onStickerPointerMove = (event: React.PointerEvent) => {
    const peel = peelRef.current;
    if (!peel || !interactive()) return;
    const point = localPoint(event.clientX, event.clientY);
    if (!point) return;

    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      if (!drag.peeling) {
        const moved = Math.hypot(
          event.clientX - drag.startX,
          event.clientY - drag.startY,
        );
        if (moved < DRAG_THRESHOLD) return;
        drag.peeling = true;
        stickerRef.current?.setPointerCapture(event.pointerId);
        tiltToRef.current?.(0, 0);
      }
      peel.update(point.x, point.y);
      drag.progress = peelProgress(point.x, point.y, point.size);
      const canToss = modeRef.current === "home" && drag.progress > FLING_AT;
      setHint(canToss ? "let go to toss it" : "peeling…");
      return;
    }

    if (event.pointerType !== "mouse") return;
    stickerRef.current?.setAttribute("data-hover", "");
    tiltToRef.current?.(
      (point.x / point.size) * 2 - 1,
      (point.y / point.size) * 2 - 1,
    );
  };

  const onStickerPointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse" || !interactive()) return;
    setHint(HINTS.face);
    run("hover-on");
  };

  const onStickerPointerDown = (event: React.PointerEvent) => {
    suppressClickRef.current = false;
    const peel = peelRef.current;
    if (!peel || !interactive() || event.button !== 0) return;
    const point = localPoint(event.clientX, event.clientY);
    if (!point || !inEdge(point.x, point.y, point.size)) return;

    // Capture only once the pointer actually drags, so taps on parts near the
    // edge (ear, hair) still land as clicks on those parts.
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      peeling: false,
      progress: 0,
    };
    peel.begin(point.x, point.y);
  };

  const endDrag = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.peeling) {
      suppressClickRef.current = true;
      setHint(null);
      if (modeRef.current === "home" && drag.progress > FLING_AT) {
        run("fling");
        return;
      }
    }
    peelRef.current?.release();
  };

  const onStickerPointerLeave = (event: React.PointerEvent) => {
    stickerRef.current?.removeAttribute("data-hover");
    tiltToRef.current?.(0, 0);
    run("hover-off");
    if (event.pointerType === "mouse" && !busyRef.current) setHint(null);
    if (dragRef.current || busyRef.current) return;
    peelRef.current?.release();
  };

  const onStickerContextMenu = (event: React.MouseEvent) => {
    if (!carryRef.current || !interactive()) return;
    event.preventDefault();
    event.stopPropagation();
    carryRef.current.pickup(event.clientX, event.clientY);
  };

  // ─── Face, part animations and the peel-and-place mechanic ─────────────
  useEffect(() => {
    const root = artRef.current;
    const sticker = stickerRef.current;
    const slot = slotRef.current;
    if (!root || !sticker || !slot) return;
    const q = <T extends Element = SVGGraphicsElement>(part: string) =>
      sticker.querySelector<T>(`[data-part="${part}"]`) ??
      root.querySelector<T>(`[data-part="${part}"]`);

    const hair = q("hair");
    const brows = q("brows");
    const pupils = [q("pupil-left"), q("pupil-right")];
    const lids = [q("lid-left"), q("lid-right")];
    const glints = [q("glint-left"), q("glint-right")];
    const mouth = q("mouth");
    const ear = q("ear");
    const sparks = [q("spark-a"), q("spark-b")];
    const bracketL = q("bracket-left");
    const bracketR = q("bracket-right");
    const tilt = tiltRef.current;
    const ring = ringRef.current;
    const faceGroups = (Object.keys(FACE_SHIFT) as (keyof typeof FACE_SHIFT)[])
      .map((key) => ({
        key,
        el: sticker.querySelector<SVGGElement>(`[data-face="${key}"]`),
      }))
      .filter((group): group is { key: keyof typeof FACE_SHIFT; el: SVGGElement } =>
        Boolean(group.el),
      );
    let trackEyes = true;
    let hovered = false;
    let lidRest = 0;
    /** 0 awake, 1 looking around, 2 dozing. */
    let idleStage = 0;

    const reduced = prefersReducedMotion();
    reducedRef.current = reduced;

    const fx = document.createElement("div");
    fx.className = styles.fx;
    document.body.appendChild(fx);
    fxRef.current = fx;

    gsap.set(lids, { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set(hair, { transformOrigin: "50% 100%" });
    gsap.set(mouth, { transformOrigin: "50% 0%" });
    gsap.set(ear, { transformOrigin: "0% 50%" });
    gsap.set(pupils, { transformOrigin: "50% 50%" });
    gsap.set(sparks, { transformOrigin: "0% 100%" });
    gsap.set([bracketL, bracketR], { transformOrigin: "50% 50%" });

    const stickerCenter = () => {
      const s = sticker.getBoundingClientRect();
      return { x: s.left + s.width / 2, y: s.top + s.height / 2 };
    };

    // ── Expressions ──
    const setLids = (value: number, duration = 0.25) => {
      lidRest = value;
      gsap.to(lids, { scaleY: value, duration, ease: "power2.out", overwrite: "auto" });
    };

    const mouthTo = (scaleX: number, scaleY: number, duration = 0.3, ease = "power2.out") =>
      gsap.to(mouth, { scaleX, scaleY, duration, ease, overwrite: "auto" });

    const blink = (which: "both" | "left" | "right" = "both") => {
      const targets =
        which === "both" ? lids : [which === "left" ? lids[0] : lids[1]];
      gsap
        .timeline()
        .to(targets, { scaleY: 1, duration: 0.07, ease: "power2.in" })
        .to(targets, { scaleY: () => lidRest, duration: 0.12, ease: "power2.out" }, "+=0.04");
    };

    const raiseBrows = () => {
      gsap.fromTo(
        brows,
        { y: 0 },
        { y: -6, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 },
      );
    };

    const popSparks = () => {
      gsap.fromTo(
        sparks,
        { scale: 1, x: 0, y: 0 },
        {
          keyframes: [
            { scale: 1.5, x: 6, y: -6, duration: 0.16, ease: "power2.out" },
            { scale: 1, x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" },
          ],
          stagger: 0.05,
        },
      );
    };

    const talk = () => {
      gsap
        .timeline()
        .to(mouth, { scaleY: 1.7, duration: 0.09, ease: "power1.out" })
        .to(mouth, { scaleY: 0.8, duration: 0.09 })
        .to(mouth, { scaleY: 1.5, duration: 0.09 })
        .to(mouth, {
          scaleY: hovered ? 0.72 : 1,
          duration: 0.2,
          ease: "elastic.out(1, 0.5)",
        });
    };

    const boing = () => {
      gsap.fromTo(
        hair,
        { scaleY: 1 },
        {
          keyframes: [
            { scaleY: 1.08, scaleX: 0.98, duration: 0.12, ease: "power2.out" },
            { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1.1, 0.3)" },
          ],
        },
      );
    };

    const wiggleEar = () => {
      gsap.fromTo(
        ear,
        { rotation: 0 },
        {
          keyframes: [
            { rotation: 10, duration: 0.08 },
            { rotation: -8, duration: 0.1 },
            { rotation: 5, duration: 0.1 },
            { rotation: 0, duration: 0.2, ease: "elastic.out(1, 0.5)" },
          ],
        },
      );
    };

    const glint = () => {
      gsap.fromTo(
        glints,
        { x: -34 },
        { x: 34, duration: 0.55, ease: "power2.inOut", stagger: 0.06 },
      );
    };

    const closeTag = (side: "left" | "right") => {
      const el = side === "left" ? bracketL : bracketR;
      const dir = side === "left" ? 1 : -1;
      gsap
        .timeline()
        .to(el, { x: dir * 30, scale: 0.92, duration: 0.14, ease: "power3.in" })
        .to(el, { x: 0, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" });
      popSparks();
    };

    // Happy squint + grin while the pointer is on the sticker.
    const hoverOn = () => {
      if (hovered) return;
      hovered = true;
      mouthTo(1.2, 0.72);
      setLids(0.26);
    };
    const hoverOff = () => {
      if (!hovered) return;
      hovered = false;
      mouthTo(1, 1, 0.6, "elastic.out(1, 0.5)");
      setLids(0);
    };

    let lastSurprise = 0;
    const surprise = () => {
      const now = performance.now();
      if (hovered || busyRef.current || now - lastSurprise < 1800) return;
      lastSurprise = now;
      gsap
        .timeline()
        .to(brows, { y: -8, duration: 0.12, ease: "power2.out" }, 0)
        .to(mouth, { scaleX: 0.7, scaleY: 1.9, duration: 0.12, ease: "power2.out" }, 0)
        .to(pupils, { scale: 0.62, duration: 0.12 }, 0)
        .to(brows, { y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }, 0.55)
        .to(mouth, { scaleX: 1, scaleY: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }, 0.55)
        .to(pupils, { scale: 1, duration: 0.4 }, 0.6);
    };

    const boop = () => {
      gsap.fromTo(
        sticker,
        { scale: 1 },
        {
          keyframes: [
            { scale: 0.95, duration: 0.08, ease: "power2.in" },
            { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.35)" },
          ],
        },
      );
      blink();
      raiseBrows();
      popSparks();
    };

    const shockwave = () => {
      gsap.fromTo(
        ring,
        { scale: 0.7, autoAlpha: 0.9 },
        { scale: 1.9, autoAlpha: 0, duration: 0.7, ease: "power2.out" },
      );
    };

    const slap = () => {
      shockwave();
      const { x, y } = stickerCenter();
      spawnBurst(fx, x, y, 16, 1.5);
      blink();
      raiseBrows();
      popSparks();
      setHint("thwack!");
    };

    // Peeled far enough: toss the sticker off, then slap it back down.
    const fling = () => {
      const peel = peelRef.current;
      if (!peel) return;
      const direction = peel.currentDirection;
      const dx =
        direction === "left"
          ? 1
          : direction === "right"
            ? -1
            : Math.random() < 0.5
              ? -1
              : 1;
      const spin = dx * (18 + Math.random() * 14);
      busyRef.current = true;
      gsap
        .timeline({
          onComplete: () => {
            busyRef.current = false;
            setHint(null);
          },
        })
        .to(sticker, {
          x: dx * 90,
          y: -70,
          rotation: spin,
          scale: 1.08,
          autoAlpha: 0,
          duration: 0.38,
          ease: "power2.in",
        })
        .add(() => peel.reset())
        .set(sticker, { x: -dx * 14, y: -46, rotation: -spin * 0.5, scale: 1.45 })
        .to(sticker, { autoAlpha: 1, duration: 0.08 }, "+=0.2")
        .to(
          sticker,
          { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.24, ease: "power4.in" },
          "<",
        )
        .add(slap)
        .to(sticker, {
          keyframes: [
            { scaleX: 1.07, scaleY: 0.93, duration: 0.07 },
            { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.35)" },
          ],
        })
        .to({}, { duration: 0.3 });
    };

    // Too many pokes in a row: spin out with googly eyes.
    const dizzy = () => {
      busyRef.current = true;
      trackEyes = false;
      peelRef.current?.release();
      setHint("whoa… dizzy");
      const { x, y } = stickerCenter();
      spawnBurst(fx, x, y, 22, 1.7);
      shockwave();
      popSparks();
      const baseRotation = Number(gsap.getProperty(sticker, "rotation")) || 0;
      const spinner = { a: 0 };
      gsap
        .timeline({
          onComplete: () => {
            busyRef.current = false;
            trackEyes = true;
            setHint(null);
          },
        })
        .to(sticker, { rotation: baseRotation + 720, duration: 1.1, ease: "power3.inOut" }, 0)
        .set(sticker, { rotation: baseRotation })
        .to(
          spinner,
          {
            a: Math.PI * 8,
            duration: 1.6,
            ease: "power1.out",
            onUpdate: () => {
              pupils.forEach((pupil, index) => {
                const phase = spinner.a * (index === 0 ? 1 : -1);
                gsap.set(pupil, {
                  x: Math.cos(phase) * PUPIL_RANGE.x,
                  y: Math.sin(phase) * PUPIL_RANGE.y,
                });
              });
            },
          },
          0,
        )
        .add(() => blink(), 1.2)
        .to(pupils, { x: 0, y: 0, duration: 0.3 }, 1.6);
    };

    actionsRef.current = {
      fling,
      dizzy,
      burst: () => {
        const { x, y } = stickerCenter();
        spawnBurst(fx, x, y, 8);
      },
      blink: () => blink(),
      "wink-left": () => blink("left"),
      "wink-right": () => blink("right"),
      raiseBrows,
      popSparks,
      talk,
      boing,
      wiggleEar,
      glint,
      "close-left": () => closeTag("left"),
      "close-right": () => closeTag("right"),
      boop,
      "hover-on": hoverOn,
      "hover-off": hoverOff,
      "hover-brackets-on": () =>
        gsap.to([bracketL, bracketR], {
          x: (i: number) => (i === 0 ? -12 : 12),
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto",
        }),
      "hover-brackets-off": () =>
        gsap.to([bracketL, bracketR], {
          x: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
          overwrite: "auto",
        }),
    };

    if (reduced) {
      // Keep everything still; clicks stay as no-ops.
      actionsRef.current = {};
      return () => {
        fx.remove();
        fxRef.current = null;
      };
    }

    // ── Idle life: blinking, twinkling sparks, breathing brackets ──
    let blinkTimer = 0;
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        if (idleStage < 2) blink();
        scheduleBlink();
      }, 2600 + Math.random() * 3400);
    };
    scheduleBlink();

    const twinkle = gsap.to(sparks, {
      opacity: 0.45,
      duration: 0.9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.35,
    });

    const breathe = gsap.to(
      [q("bracket-left-idle"), q("bracket-right-idle")],
      {
        x: (i: number) => (i === 0 ? -4 : 4),
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      },
    );

    // ── Pupils follow the pointer anywhere on the page ──
    const eyeCenters = [
      { x: BOX.pupilL.cx, y: BOX.pupilL.cy },
      { x: BOX.pupilR.cx, y: BOX.pupilR.cy },
    ];
    const movers = pupils.map((pupil) =>
      pupil
        ? {
            x: gsap.quickTo(pupil, "x", { duration: 0.35, ease: "power3.out" }),
            y: gsap.quickTo(pupil, "y", { duration: 0.35, ease: "power3.out" }),
          }
        : null,
    );

    // ── Head turn: features shift toward the pointer; scrolling makes them bob ──
    const face = { nx: 0, ny: 0, bob: 0 };
    const faceMovers = faceGroups.map(({ key, el }) => ({
      shift: FACE_SHIFT[key],
      x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
    }));
    const applyFace = () => {
      faceMovers.forEach(({ shift, x, y }) => {
        x(face.nx * shift.x);
        y(face.ny * shift.y + face.bob * Math.abs(shift.y) * 0.9);
      });
    };

    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      gsap.to(face, {
        bob: clamp(dy * 0.05, -1.6, 1.6),
        duration: 0.12,
        overwrite: true,
        onUpdate: applyFace,
        onComplete: () => {
          gsap.to(face, {
            bob: 0,
            duration: 0.9,
            ease: "elastic.out(1, 0.35)",
            onUpdate: applyFace,
          });
        },
      });
    };

    // ── 3D tilt + foil sheen that follows the pointer across the sticker ──
    if (tilt) {
      gsap.set(tilt, { transformPerspective: 700, transformOrigin: "50% 50%" });
      const rotateX = gsap.quickTo(tilt, "rotationX", { duration: 0.6, ease: "power3.out" });
      const rotateY = gsap.quickTo(tilt, "rotationY", { duration: 0.6, ease: "power3.out" });
      tiltToRef.current = (nx, ny) => {
        rotateY(nx * TILT);
        rotateX(-ny * TILT);
        tilt.style.setProperty("--mx", `${(nx + 1) * 50}%`);
        tilt.style.setProperty("--my", `${(ny + 1) * 50}%`);
      };
    }

    // ── Idle: look around, then yawn and doze off until the pointer moves ──
    let lastActive = performance.now();
    let idleTl: gsap.core.Timeline | null = null;
    let lastSnore = 0;

    const lookAround = () => {
      trackEyes = false;
      idleTl = gsap
        .timeline({ onComplete: () => (trackEyes = true) })
        .to(pupils, { x: -PUPIL_RANGE.x, y: 0, duration: 0.4, ease: "power2.inOut" })
        .to(faceGroups.map((g) => g.el), { x: -3, duration: 0.4, ease: "power2.inOut" }, "<")
        .to(pupils, { x: PUPIL_RANGE.x, duration: 0.55, ease: "power2.inOut" }, "+=0.5")
        .to(faceGroups.map((g) => g.el), { x: 3, duration: 0.55, ease: "power2.inOut" }, "<")
        .add(raiseBrows, "+=0.2")
        .to(pupils, { x: 0, y: -2, duration: 0.35 }, "+=0.4")
        .to(faceGroups.map((g) => g.el), { x: 0, duration: 0.35 }, "<");
    };

    // Yawn, then settle into heavy eyelids.
    const doze = () => {
      trackEyes = false;
      lidRest = 0.62;
      idleTl = gsap
        .timeline()
        .to(pupils, { x: 0, y: 2, duration: 0.4 })
        .to(mouth, { scaleX: 0.85, scaleY: 2.3, duration: 0.8, ease: "sine.inOut" }, 0)
        .to(lids, { scaleY: 0.85, duration: 0.8, ease: "sine.inOut" }, 0)
        .to(brows, { y: 3, duration: 0.8 }, 0)
        .to(mouth, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "sine.inOut" }, "+=0.7")
        .to(lids, { scaleY: lidRest, duration: 0.6, ease: "sine.inOut" }, "<");
    };

    const wake = () => {
      if (idleStage === 0) return;
      idleStage = 0;
      idleTl?.kill();
      idleTl = null;
      trackEyes = true;
      gsap.to(brows, { y: 0, duration: 0.3, overwrite: "auto" });
      mouthTo(hovered ? 1.2 : 1, hovered ? 0.72 : 1, 0.3);
      setLids(hovered ? 0.26 : 0, 0.12);
      window.setTimeout(() => blink(), 140);
    };

    const idleTimer = window.setInterval(() => {
      if (busyRef.current || modeRef.current === "carrying" || document.hidden) return;
      const idle = performance.now() - lastActive;
      if (idleStage === 0 && idle > IDLE_LOOK_MS) {
        idleStage = 1;
        lookAround();
      } else if (idleStage === 1 && idle > IDLE_SLEEP_MS) {
        idleStage = 2;
        doze();
      } else if (idleStage === 2 && performance.now() - lastSnore > 2600) {
        lastSnore = performance.now();
        const rect = sticker.getBoundingClientRect();
        spawnSnore(fx, rect.right - rect.width * 0.18, rect.top + rect.height * 0.2);
      }
    }, 700);

    // ── Peel it off with a right-click, carry it, click anywhere to stick it ──
    const layer = document.createElement("div");
    layer.className = styles.placeLayer;
    document.body.appendChild(layer);

    let grab = { x: 0, y: 0 };
    let lastClient = { x: 0, y: 0 };
    let lastMoveAt = 0;
    let follow: { x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null = null;
    let swallowClick = false;
    // Touch: a long press peels it off, dragging carries it, lifting the finger sticks it.
    let press: { id: number; x: number; y: number; timer: number } | null = null;
    let touchCarry: {
      id: number;
      x: number;
      y: number;
      moved: boolean;
      dropAt: { x: number; y: number } | null;
    } | null = null;
    let edgeRaf = 0;
    let hintTimer = 0;

    const headerHeight = () => document.querySelector("header")?.offsetHeight ?? 0;
    const stickerWidth = () => sticker.offsetWidth;

    const awayWidth = () =>
      Math.max(AWAY_MIN_WIDTH, slot.offsetWidth * AWAY_RATIO);

    /** Page coords for the sticker's top-left, kept inside the on-screen bounds. */
    const boundedTarget = (clientX: number, clientY: number) => {
      const w = stickerWidth();
      // Room for the lift scale, which grows the sticker around its centre.
      const inset = BOUNDS_MARGIN + (w * (CARRY_SCALE - 1)) / 2;
      const left = clamp(
        clientX - grab.x,
        inset,
        window.innerWidth - w - inset,
      );
      const top = clamp(
        clientY - grab.y,
        headerHeight() + inset,
        window.innerHeight - w - inset,
      );
      return { x: left + window.scrollX, y: top + window.scrollY };
    };

    const homeTarget = () => {
      const r = slot.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width };
    };

    const toLayer = () => {
      if (sticker.parentElement === layer) return;
      const r = sticker.getBoundingClientRect();
      sticker.style.width = `${slot.offsetWidth}px`;
      layer.appendChild(sticker);
      gsap.set(sticker, { x: r.left + window.scrollX, y: r.top + window.scrollY });
      setAway(true);
    };

    const toSlot = () => {
      gsap.killTweensOf(sticker, "x,y,rotation,scale,width");
      if (sticker.parentElement !== slot) slot.appendChild(sticker);
      sticker.style.width = "";
      gsap.set(sticker, { x: 0, y: 0, rotation: 0, scale: 1 });
      setAway(false);
    };

    const endCarry = () => {
      follow = null;
      sticker.classList.remove(styles.carried);
      setCarrying(null);
    };

    const whee = () => {
      gsap.to(brows, { y: -7, duration: 0.2, overwrite: "auto" });
      mouthTo(0.75, 1.8, 0.2);
      gsap.to(pupils, { scale: 0.8, duration: 0.2 });
    };

    const settle = () => {
      gsap.to(brows, { y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
      mouthTo(1, 1, 0.5, "elastic.out(1, 0.5)");
      gsap.to(pupils, { scale: 1, duration: 0.3 });
    };

    const pickup = (clientX: number, clientY: number, input: CarryInput = "mouse") => {
      const peel = peelRef.current;
      if (!peel) return;
      wake();
      hoverOff();
      tiltToRef.current?.(0, 0);
      setHint(null);
      modeRef.current = "lifting";
      busyRef.current = true;

      const r = sticker.getBoundingClientRect();
      grab = { x: clientX - r.left, y: clientY - r.top };
      lastClient = { x: clientX, y: clientY };

      // A quick Sticker.js lift from the nearest edge sells the "peel off" moment.
      const size = r.width;
      const local = { x: grab.x, y: grab.y };
      const distances = {
        left: local.x,
        right: size - local.x,
        top: local.y,
        bottom: size - local.y,
      };
      const direction = (Object.keys(distances) as (keyof typeof distances)[]).reduce(
        (a, b) => (distances[a] <= distances[b] ? a : b),
      );
      const along = direction === "left" || direction === "right" ? local.y : local.x;
      const lift = { depth: 0 };
      const applyLift = () => {
        const d = lift.depth;
        if (direction === "left") peel.update(d, along);
        else if (direction === "right") peel.update(size - d, along);
        else if (direction === "top") peel.update(along, d);
        else peel.update(along, size - d);
      };
      peel.begin(
        direction === "left" ? 1 : direction === "right" ? size - 1 : along,
        direction === "top" ? 1 : direction === "bottom" ? size - 1 : along,
        direction,
      );
      whee();

      gsap
        .timeline({
          onComplete: () => {
            peel.reset();
            const wasHome = sticker.parentElement !== layer;
            toLayer();
            sticker.classList.add(styles.carried);
            setCarrying(input);
            if (wasHome) {
              const from = sticker.offsetWidth;
              const to = awayWidth();
              grab = { x: (grab.x * to) / from, y: (grab.y * to) / from };
              gsap.to(sticker, { width: to, duration: 0.3, ease: "power3.out" });
            }
            follow = {
              x: gsap.quickTo(sticker, "x", { duration: 0.3, ease: "power3.out" }),
              y: gsap.quickTo(sticker, "y", { duration: 0.3, ease: "power3.out" }),
            };
            const target = boundedTarget(lastClient.x, lastClient.y);
            follow.x(target.x);
            follow.y(target.y);
            gsap.to(sticker, {
              scale: CARRY_SCALE,
              rotation: -6,
              duration: 0.3,
              ease: "back.out(2)",
            });
            modeRef.current = "carrying";
            busyRef.current = false;
            // The finger may already have lifted mid-peel after dragging.
            const drop = touchCarry?.dropAt;
            if (drop) {
              touchCarry = null;
              place(drop.x, drop.y);
            } else if (touchCarry) {
              startEdgeScroll();
            }
          },
        })
        .to(lift, { depth: size * 0.3, duration: 0.2, ease: "power2.out", onUpdate: applyLift });
    };

    const goHome = () => {
      if (sticker.parentElement !== layer) return;
      endCarry();
      modeRef.current = "moving";
      busyRef.current = true;
      const home = homeTarget();
      gsap
        .timeline({
          onComplete: () => {
            toSlot();
            modeRef.current = "home";
            busyRef.current = false;
            shockwave();
            settle();
            blink();
          },
        })
        .to(sticker, {
          x: home.x,
          y: home.y,
          width: home.w,
          rotation: 0,
          scale: 1,
          duration: 0.55,
          ease: "power3.inOut",
        });
    };

    const place = (clientX: number, clientY: number) => {
      const target = boundedTarget(clientX, clientY);
      const home = homeTarget();
      const w = stickerWidth();
      const homeVisible =
        home.y - window.scrollY < window.innerHeight && home.y + home.w - window.scrollY > 0;
      const nearHome = Math.hypot(target.x - home.x, target.y - home.y) < w * SNAP_HOME;
      if (homeVisible && nearHome) {
        goHome();
        return;
      }

      endCarry();
      modeRef.current = "moving";
      busyRef.current = true;
      gsap
        .timeline({
          onComplete: () => {
            modeRef.current = "placed";
            busyRef.current = false;
            window.setTimeout(() => setHint(null), 700);
          },
        })
        .to(sticker, {
          x: target.x,
          y: target.y,
          scale: 1.18,
          rotation: (Math.random() - 0.5) * 16,
          duration: 0.14,
          ease: "power2.out",
        })
        .to(sticker, { scale: 1, duration: 0.14, ease: "power4.in" })
        .add(() => {
          shockwave();
          const { x, y } = stickerCenter();
          spawnBurst(fx, x, y, 12, 1.2);
          settle();
          blink();
          setHint("stuck!");
        })
        .to(sticker, {
          keyframes: [
            { scaleX: 1.06, scaleY: 0.94, duration: 0.07 },
            { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1, 0.35)" },
          ],
        });
    };

    carryRef.current = { pickup, goHome };

    const followPointer = () => {
      if (!follow) return;
      const target = boundedTarget(lastClient.x, lastClient.y);
      follow.x(target.x);
      follow.y(target.y);
    };

    const stopEdgeScroll = () => {
      cancelAnimationFrame(edgeRaf);
      edgeRaf = 0;
    };

    const edgeScroll = () => {
      edgeRaf = 0;
      if (!touchCarry || modeRef.current !== "carrying") return;
      const top = headerHeight() + EDGE_SCROLL_ZONE;
      const bottom = window.innerHeight - EDGE_SCROLL_ZONE;
      const y = lastClient.y;
      const push = y < top ? (y - top) / EDGE_SCROLL_ZONE : y > bottom ? (y - bottom) / EDGE_SCROLL_ZONE : 0;
      if (push) scrollByDelta(clamp(push, -1, 1) * EDGE_SCROLL_SPEED);
      edgeRaf = requestAnimationFrame(edgeScroll);
    };

    const startEdgeScroll = () => {
      if (!edgeRaf) edgeRaf = requestAnimationFrame(edgeScroll);
    };

    const clearHoldHint = (delay: number) => {
      window.clearTimeout(hintTimer);
      hintTimer = window.setTimeout(() => {
        setHint((current) => (current === HOLD_HINT ? null : current));
      }, delay);
    };

    const cancelPress = () => {
      if (!press) return;
      window.clearTimeout(press.timer);
      press = null;
      gsap.to(sticker, { scale: 1, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      clearHoldHint(1200);
    };

    const onTouchPressStart = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || !event.isPrimary) return;
      if (reducedRef.current || busyRef.current) return;
      if (modeRef.current !== "home" && modeRef.current !== "placed") return;
      cancelPress();
      const { pointerId: id, clientX: x, clientY: y } = event;
      window.clearTimeout(hintTimer);
      setHint(HOLD_HINT);
      // Swelling while held shows the press is registering before it lets go.
      gsap.to(sticker, {
        scale: 1.06,
        duration: LONG_PRESS_MS / 1000,
        ease: "power1.out",
        overwrite: "auto",
      });
      press = {
        id,
        x,
        y,
        timer: window.setTimeout(() => {
          press = null;
          dragRef.current = null;
          suppressClickRef.current = true;
          navigator.vibrate?.(12);
          touchCarry = { id, x, y, moved: false, dropAt: null };
          pickup(x, y, "touch");
        }, LONG_PRESS_MS),
      };
    };

    const onPointerEnd = (event: PointerEvent) => {
      if (press?.id === event.pointerId) cancelPress();
      if (touchCarry?.id !== event.pointerId) return;
      stopEdgeScroll();
      if (event.type !== "pointerup" || !touchCarry.moved) {
        // Held without dragging: it stays peeled until the next tap sticks it.
        touchCarry = null;
        return;
      }
      if (modeRef.current === "lifting") {
        touchCarry.dropAt = { x: event.clientX, y: event.clientY };
        return;
      }
      touchCarry = null;
      if (modeRef.current === "carrying") place(event.clientX, event.clientY);
    };

    // Keeps the page still while a finger drags the sticker around.
    const onTouchMove = (event: TouchEvent) => {
      if (touchCarry && event.cancelable) event.preventDefault();
    };

    const onCapturePointerDown = (event: PointerEvent) => {
      if (modeRef.current !== "carrying") return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      swallowClick = true;
      place(event.clientX, event.clientY);
    };

    const onCaptureClick = (event: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const onCaptureContextMenu = (event: MouseEvent) => {
      // Touch long presses also raise a context menu; the gesture owns those.
      if (press || touchCarry || modeRef.current === "lifting" || modeRef.current === "moving") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (modeRef.current !== "carrying") return;
      event.preventDefault();
      event.stopPropagation();
      place(event.clientX, event.clientY);
    };

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (modeRef.current === "carrying" || modeRef.current === "placed") goHome();
    };

    const lookAtPoint = (clientX: number, clientY: number) => {
      const rect = sticker.getBoundingClientRect();
      if (rect.width < 1) return;

      face.nx = clamp(
        (clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2),
        -1,
        1,
      );
      face.ny = clamp(
        (clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2),
        -1,
        1,
      );
      if (trackEyes) applyFace();

      if (!trackEyes) return;
      const scale = rect.width / CROP.size;
      eyeCenters.forEach((eye, index) => {
        const mover = movers[index];
        if (!mover) return;
        const ex = rect.left + (eye.x - CROP.x) * scale;
        const ey = rect.top + (eye.y - CROP.y) * scale;
        const dx = clamp((clientX - ex) / 160, -1, 1);
        const dy = clamp((clientY - ey) / 160, -1, 1);
        mover.x(dx * PUPIL_RANGE.x);
        mover.y(dy * PUPIL_RANGE.y);
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (press?.id === event.pointerId) {
        // Moving before the hold completes is a scroll or an edge peel, not a pickup.
        if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > PRESS_SLOP) cancelPress();
      }
      if (
        touchCarry?.id === event.pointerId &&
        Math.hypot(event.clientX - touchCarry.x, event.clientY - touchCarry.y) > PRESS_SLOP
      ) {
        touchCarry.moved = true;
      }
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveAt);
      const speed = Math.hypot(event.clientX - lastClient.x, event.clientY - lastClient.y) / dt;
      const vx = (event.clientX - lastClient.x) / dt;
      lastMoveAt = now;
      lastClient = { x: event.clientX, y: event.clientY };

      // In Destroy mode the sticker stares at the character instead of the pointer.
      if (isDestroyEggActive()) return;

      lastActive = now;
      wake();

      if (modeRef.current === "carrying") {
        followPointer();
        gsap.to(sticker, {
          rotation: -6 + clamp(vx * 5, -14, 14),
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
        return;
      }
      if (speed > SURPRISE_SPEED && dt < 40) surprise();
      lookAtPoint(event.clientX, event.clientY);
    };

    let destroyLookRaf = 0;
    let lastDestroyLook = 0;
    const tickDestroyLook = (now: number) => {
      destroyLookRaf = requestAnimationFrame(tickDestroyLook);
      if (!isDestroyEggActive() || busyRef.current) return;
      // ~12fps eye tracking is plenty and avoids GSAP thrash every frame.
      if (now - lastDestroyLook < 80) return;
      lastDestroyLook = now;
      const target = getDestroyWatchTarget();
      if (!target) return;
      lastActive = now;
      if (idleStage !== 0) wake();
      lookAtPoint(target.x, target.y);
    };
    destroyLookRaf = requestAnimationFrame(tickDestroyLook);

    const onWindowScroll = () => {
      onScroll();
      if (modeRef.current === "carrying") followPointer();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("pointerdown", onCapturePointerDown, true);
    window.addEventListener("click", onCaptureClick, true);
    window.addEventListener("contextmenu", onCaptureContextMenu, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    sticker.addEventListener("pointerdown", onTouchPressStart);

    return () => {
      cancelAnimationFrame(destroyLookRaf);
      cancelPress();
      stopEdgeScroll();
      window.clearTimeout(hintTimer);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      window.removeEventListener("touchmove", onTouchMove);
      sticker.removeEventListener("pointerdown", onTouchPressStart);
      window.clearTimeout(blinkTimer);
      window.clearInterval(idleTimer);
      idleTl?.kill();
      tiltToRef.current = null;
      carryRef.current = null;
      busyRef.current = false;
      modeRef.current = "home";
      twinkle.kill();
      breathe.kill();
      gsap.set([q("bracket-left-idle"), q("bracket-right-idle")], { x: 0 });
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("pointerdown", onCapturePointerDown, true);
      window.removeEventListener("click", onCaptureClick, true);
      window.removeEventListener("contextmenu", onCaptureContextMenu, true);
      window.removeEventListener("keydown", onKey);
      gsap.killTweensOf([
        face,
        hair,
        brows,
        mouth,
        ear,
        sticker,
        tilt,
        ring,
        bracketL,
        bracketR,
        ...faceGroups.map((g) => g.el),
        ...pupils,
        ...lids,
        ...glints,
        ...sparks,
      ]);
      // React only knows the sticker as a child of its slot.
      sticker.classList.remove(styles.carried);
      toSlot();
      setCarrying(null);
      layer.remove();
      fx.remove();
      fxRef.current = null;
    };
  }, []);

  const run = (...names: string[]) => {
    for (const name of names) actionsRef.current[name]?.();
  };

  // Touch taps fire enter/leave too; those shouldn't flash hover hints over the tap's own.
  const onEnter = (part: Part, ...actions: string[]) => (event: React.PointerEvent) => {
    // Parts sliding under a still pointer mid-spin/fling aren't real hovers.
    if (event.pointerType !== "mouse" || !interactive()) return;
    setHint(HINTS[part]);
    run(...actions);
  };

  const onLeave = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse" || busyRef.current) return;
    setHint(stickerRef.current?.hasAttribute("data-hover") ? HINTS.face : null);
  };

  // A drag that peeled the sticker shouldn't also fire part actions.
  const onPartClick =
    (...actions: string[]) =>
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      if (!interactive()) return;
      if (registerHit()) return;
      const fx = fxRef.current;
      if (fx) spawnBurst(fx, event.clientX, event.clientY, 6);
      run(...actions);
    };

  /** Returns true when this hit completes a combo (and triggers it). */
  const registerHit = () => {
    const now = performance.now();
    const hits = hitsRef.current.filter((t) => now - t < COMBO_WINDOW);
    hits.push(now);
    hitsRef.current = hits;
    if (hits.length < COMBO_HITS) return false;
    hitsRef.current = [];
    run("dizzy");
    return true;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (!interactive() || registerHit()) return;
    run("boop", "burst");
  };

  const lensClip = (id: string, d: string) => (
    <clipPath id={id}>
      <path d={d} />
    </clipPath>
  );

  const lid = (side: "left" | "right") => {
    const box = side === "left" ? BOX.lensL : BOX.lensR;
    return (
      <rect
        data-part={`lid-${side}`}
        x={box.x - 2}
        y={box.y - 2}
        width={box.w + 4}
        height={box.h + 4}
        fill={COLOR.ink}
      />
    );
  };

  const glintBar = (side: "left" | "right") => {
    const box = side === "left" ? BOX.lensL : BOX.lensR;
    return (
      <rect
        data-part={`glint-${side}`}
        x={box.cx - 5}
        y={box.y - 6}
        width={9}
        height={box.h + 12}
        fill={COLOR.cobalt}
        opacity={0.35}
        transform={`rotate(20 ${box.cx} ${box.cy})`}
      />
    );
  };

  const artwork = (interactive: boolean) => (
    <>
      <path d={PATH.base} fill={COLOR.cream} />
      <g data-face={interactive ? "ear" : undefined}>
        <path
          data-part={interactive ? "ear" : undefined}
          className={interactive ? styles.part : undefined}
          d={PATH.ear}
          fill={COLOR.cream}
          onPointerEnter={interactive ? onEnter("ear", "wiggleEar") : undefined}
          onPointerLeave={interactive ? onLeave : undefined}
          onClick={interactive ? onPartClick("wiggleEar") : undefined}
        />
      </g>
      <g data-face={interactive ? "hair" : undefined}>
        <path
          data-part={interactive ? "hair" : undefined}
          className={interactive ? styles.part : undefined}
          d={PATH.hair}
          fill={COLOR.ink}
          onPointerEnter={interactive ? onEnter("hair", "boing") : undefined}
          onPointerLeave={interactive ? onLeave : undefined}
          onClick={interactive ? onPartClick("boing", "raiseBrows") : undefined}
        />
      </g>
      <g data-face={interactive ? "brows" : undefined}>
        <path
          data-part={interactive ? "brows" : undefined}
          className={interactive ? styles.part : undefined}
          d={PATH.brows}
          fill={COLOR.ink}
          onPointerEnter={interactive ? onEnter("brows", "raiseBrows") : undefined}
          onPointerLeave={interactive ? onLeave : undefined}
          onClick={interactive ? onPartClick("raiseBrows") : undefined}
        />
      </g>
      <g data-face={interactive ? "beard" : undefined}>
        <g
          className={interactive ? styles.part : undefined}
          onPointerEnter={interactive ? onEnter("beard") : undefined}
          onPointerLeave={interactive ? onLeave : undefined}
          onClick={interactive ? onPartClick("talk") : undefined}
        >
          <path d={PATH.beard} fill={COLOR.ink} />
          <g data-part={interactive ? "mouth" : undefined}>
            <path d={PATH.mouth} fill={COLOR.cream} />
            <path d={LIP.lower} fill={COLOR.lip} />
            <path
              d={LIP.shine}
              fill="none"
              stroke={COLOR.cream}
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={0.55}
            />
            <path
              d={LIP.line}
              fill="none"
              stroke={COLOR.ink}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>

      {/* Glasses and eyes move as one so the lens clips stay aligned. The traced
          frame is solid over the lenses, so the eyes draw on top of it. */}
      <g data-face={interactive ? "eyes" : undefined}>
        <path
          data-part={interactive ? "glasses" : undefined}
          className={interactive ? styles.part : undefined}
          d={PATH.glasses}
          fill={COLOR.ink}
          onPointerEnter={interactive ? onEnter("glasses", "glint") : undefined}
          onPointerLeave={interactive ? onLeave : undefined}
          onClick={interactive ? onPartClick("blink", "raiseBrows") : undefined}
        />

        <g
          className={interactive ? styles.part : undefined}
          onPointerEnter={interactive ? onEnter("eyes", "glint") : undefined}
          onPointerLeave={interactive ? onLeave : undefined}
        >
          <g
            clipPath={interactive ? "url(#lens-left)" : undefined}
            onClick={interactive ? onPartClick("wink-left", "raiseBrows") : undefined}
          >
            <path d={PATH.lensL} fill={COLOR.cream} />
            <path data-part={interactive ? "pupil-left" : undefined} d={PATH.pupilL} fill={COLOR.ink} />
            {interactive ? glintBar("left") : null}
            {interactive ? lid("left") : null}
          </g>
          <g
            clipPath={interactive ? "url(#lens-right)" : undefined}
            onClick={interactive ? onPartClick("wink-right", "raiseBrows") : undefined}
          >
            <path d={PATH.lensR} fill={COLOR.cream} />
            <path data-part={interactive ? "pupil-right" : undefined} d={PATH.pupilR} fill={COLOR.ink} />
            {interactive ? glintBar("right") : null}
            {interactive ? lid("right") : null}
          </g>
        </g>
      </g>
    </>
  );

  const viewBox = `0 0 ${VB.width} ${VB.height}`;
  const cropViewBox = `${CROP.x} ${CROP.y} ${CROP.size} ${CROP.size}`;

  return (
    <div
      ref={artRef}
      className={styles.art}
      style={maskVars}
      tabIndex={0}
      role="img"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {/* Brackets sit behind the sticker so "closing the tag" tucks them under it. */}
      <svg className={styles.extras} viewBox={viewBox} aria-hidden="true">
        <g data-part="bracket-left-idle">
          <path
            data-part="bracket-left"
            className={styles.part}
            d={PATH.bracketL}
            fill={COLOR.cobalt}
            onPointerEnter={onEnter("bracket-left", "hover-brackets-on")}
            onPointerLeave={(event) => {
              onLeave(event);
              run("hover-brackets-off");
            }}
            onClick={onPartClick("close-left")}
          />
        </g>
        <g data-part="bracket-right-idle">
          <path
            data-part="bracket-right"
            className={styles.part}
            d={PATH.bracketR}
            fill={COLOR.cobalt}
            onPointerEnter={onEnter("bracket-right", "hover-brackets-on")}
            onPointerLeave={(event) => {
              onLeave(event);
              run("hover-brackets-off");
            }}
            onClick={onPartClick("close-right")}
          />
        </g>
      </svg>

      {/* Children stay static: the sticker node is moved out to the page while
          it's carried or stuck elsewhere, and returned here afterwards. */}
      <div ref={slotRef} className={styles.slot} style={slotPosition}>
        <button
          type="button"
          className={`${styles.homeGhost} ${away ? styles.homeGhostVisible : ""}`}
          onClick={() => carryRef.current?.goHome()}
          tabIndex={away ? 0 : -1}
          aria-hidden={!away}
          aria-label="Put the sticker back"
        />
        <div
          ref={stickerRef}
          className={styles.sticker}
          style={maskVars}
          onPointerEnter={onStickerPointerEnter}
          onPointerMove={onStickerPointerMove}
          onPointerDown={onStickerPointerDown}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={onStickerPointerLeave}
          onContextMenu={onStickerContextMenu}
          onClick={onPartClick("boop")}
        >
          <div ref={ringRef} className={styles.ring} aria-hidden="true" />
          <div ref={tiltRef} className={styles.tilt}>
            <div ref={maskRef} className={styles.peelMask}>
              <div ref={moveRef} className={styles.peelMove}>
                <div className={styles.front}>
                  <svg
                    className={styles.frontSvg}
                    viewBox={cropViewBox}
                    aria-hidden="true"
                  >
                    <defs>
                      {lensClip("lens-left", PATH.lensL)}
                      {lensClip("lens-right", PATH.lensR)}
                    </defs>
                    {artwork(true)}
                  </svg>
                  <div className={styles.sheen} aria-hidden="true" />
                  <div ref={depthRef} className={styles.depth} />
                </div>
                <div ref={backRef} className={styles.back}>
                  <div className={styles.backClip}>
                    <svg className={styles.ghost} viewBox={cropViewBox} aria-hidden="true">
                      {artwork(false)}
                    </svg>
                    <div ref={backShadowRef} className={styles.backShadow} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <svg
        className={`${styles.extras} ${styles.extrasTop}`}
        viewBox={viewBox}
        aria-hidden="true"
      >
        <g
          className={styles.part}
          onPointerEnter={onEnter("sparks", "popSparks")}
          onPointerLeave={onLeave}
          onClick={onPartClick("popSparks", "raiseBrows")}
        >
          {/* Invisible pad so the thin sparks are easy to hit. */}
          <circle cx={BOX.sparkA.cx + 10} cy={BOX.sparkA.cy + 10} r={26} fill="transparent" />
          <path data-part="spark-a" d={PATH.sparkA} fill={COLOR.cream} />
          <path data-part="spark-b" d={PATH.sparkB} fill={COLOR.cream} />
        </g>
      </svg>

      <p
        className={`${styles.hint} ${hint ? styles.hintVisible : ""}`}
        aria-hidden="true"
      >
        {hint ?? ""}
      </p>

      {carrying
        ? createPortal(
            <div className={styles.bounds} aria-hidden="true">
              <span className={styles.boundsLabel}>
                {carrying === "touch"
                  ? "Let go anywhere to stick it · drop it on its spot to put it back"
                  : "Click anywhere to stick it · Esc puts it back"}
              </span>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
