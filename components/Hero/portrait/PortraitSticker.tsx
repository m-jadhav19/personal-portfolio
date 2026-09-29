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

import { StickerPeel } from "@/lib/sticker";

import {
  PORTRAIT_BOXES as BOX,
  PORTRAIT_COLORS as COLOR,
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
  face: "boop",
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
const TEASE = 0.3;
const DRAG_THRESHOLD = 6;
const PUPIL_RANGE = { x: 7, y: 4.5 };
const TILT = 14;
/** Peel past this fraction and letting go tosses the sticker off to re-stick. */
const FLING_AT = 0.55;
const COMBO_HITS = 6;
const COMBO_WINDOW = 1400;
const IDLE_PEEK_MS = 6000;
const GLYPHS = ["</>", "{ }", "=>", ";", "( )", "✦", "#", "01"];
const GLYPH_COLORS = [COLOR.cobalt, COLOR.cream, COLOR.cobalt, "#ffd23f"];
const MAX_PARTICLES = 60;

function silhouetteMask(transform = "") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CROP.x} ${CROP.y} ${CROP.size} ${CROP.size}"><g transform="${transform}"><path fill="#000" d="${PATH.base}"/></g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Code glyphs that pop out of a click, arc up and fall with gravity. */
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

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type PortraitStickerProps = {
  label: string;
};

export function PortraitSticker({ label }: PortraitStickerProps) {
  const artRef = useRef<HTMLDivElement>(null);
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
  const tiltRef = useRef<HTMLDivElement>(null);
  const tiltToRef = useRef<((x: number, y: number) => void) | null>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const hitsRef = useRef<number[]>([]);

  const [hint, setHint] = useState<string | null>(null);

  const maskVars = useMemo(() => {
    const mirrorX = `translate(${CROP.x * 2 + CROP.size} 0) scale(-1 1)`;
    const mirrorY = `translate(0 ${CROP.y * 2 + CROP.size}) scale(1 -1)`;
    return {
      "--sticker-mask": silhouetteMask(),
      "--sticker-mask-mirror-x": silhouetteMask(mirrorX),
      "--sticker-mask-mirror-y": silhouetteMask(mirrorY),
    } as CSSProperties;
  }, []);

  const stickerPosition: CSSProperties = {
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

  const onStickerPointerMove = (event: React.PointerEvent) => {
    const peel = peelRef.current;
    if (!peel || reducedRef.current || busyRef.current) return;
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
      setHint(drag.progress > FLING_AT ? "let go to toss it" : "peeling…");
      return;
    }

    if (event.pointerType !== "mouse") return;

    stickerRef.current?.setAttribute("data-hover", "");
    tiltToRef.current?.(
      (point.x / point.size) * 2 - 1,
      (point.y / point.size) * 2 - 1,
    );

    // Hover teaser: curl just the edge you're near, like a sticker corner lifting.
    if (!inEdge(point.x, point.y, point.size)) {
      if (peel.active) peel.release();
      return;
    }
    if (!peel.active) peel.begin(point.x, point.y);
    // The square crop has empty margin around the head, so the curl has to reach
    // past it to actually lift the artwork.
    // Curl grows as the pointer nears the edge it came from.
    const size = point.size;
    const zone = size * EDGE;
    const direction = peel.currentDirection;
    const distance =
      direction === "left"
        ? point.x
        : direction === "right"
          ? size - point.x
          : direction === "top"
            ? point.y
            : size - point.y;
    const closeness = 1 - Math.min(1, Math.max(0, distance / zone));
    const depth = size * TEASE * (0.45 + 0.55 * closeness);
    const x =
      direction === "left" ? depth : direction === "right" ? size - depth : point.x;
    const y =
      direction === "top" ? depth : direction === "bottom" ? size - depth : point.y;
    peel.update(x, y);
  };

  const onStickerPointerDown = (event: React.PointerEvent) => {
    suppressClickRef.current = false;
    const peel = peelRef.current;
    if (!peel || reducedRef.current || busyRef.current || event.button !== 0) {
      return;
    }
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
    if (!peel.active) peel.begin(point.x, point.y);
  };

  const endDrag = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.peeling) {
      suppressClickRef.current = true;
      setHint(null);
      if (drag.progress > FLING_AT) {
        run("fling");
      } else {
        peelRef.current?.release();
      }
    } else if (event.pointerType !== "mouse") {
      peelRef.current?.release();
    }
  };

  const onStickerPointerLeave = () => {
    stickerRef.current?.removeAttribute("data-hover");
    tiltToRef.current?.(0, 0);
    if (dragRef.current || busyRef.current) return;
    peelRef.current?.release();
  };

  // ─── Part animations ────────────────────────────────────────────────────
  useEffect(() => {
    const root = artRef.current;
    if (!root) return;
    const q = <T extends Element = SVGGraphicsElement>(part: string) =>
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
    const sticker = stickerRef.current;
    const tilt = tiltRef.current;
    const ring = ringRef.current;
    const burstLayer = burstRef.current;
    let trackEyes = true;

    const reduced = prefersReducedMotion();
    reducedRef.current = reduced;

    gsap.set(lids, { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set(hair, { transformOrigin: "50% 100%" });
    gsap.set(mouth, { transformOrigin: "50% 0%" });
    gsap.set(ear, { transformOrigin: "0% 50%" });
    gsap.set(sparks, { transformOrigin: "0% 100%" });
    gsap.set([bracketL, bracketR], { transformOrigin: "50% 50%" });

    const blink = (which: "both" | "left" | "right" = "both") => {
      const targets =
        which === "both" ? lids : [which === "left" ? lids[0] : lids[1]];
      gsap
        .timeline()
        .to(targets, { scaleY: 1, duration: 0.07, ease: "power2.in" })
        .to(targets, { scaleY: 0, duration: 0.12, ease: "power2.out" }, "+=0.04");
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
        .to(mouth, { scaleY: 1, duration: 0.2, ease: "elastic.out(1, 0.5)" });
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

    const boop = () => {
      if (sticker) {
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
      }
      blink();
      raiseBrows();
      popSparks();
    };

    const stickerCenter = () => {
      if (!sticker || !burstLayer) return { x: 0, y: 0 };
      const s = sticker.getBoundingClientRect();
      const l = burstLayer.getBoundingClientRect();
      return { x: s.left - l.left + s.width / 2, y: s.top - l.top + s.height / 2 };
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
      if (burstLayer) {
        const { x, y } = stickerCenter();
        spawnBurst(burstLayer, x, y, 16, 1.5);
      }
      blink();
      raiseBrows();
      popSparks();
      setHint("thwack!");
    };

    // Peeled far enough: toss the sticker off, then slap it back down.
    const fling = () => {
      const peel = peelRef.current;
      if (!sticker || !peel) return;
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
      if (!sticker) return;
      busyRef.current = true;
      trackEyes = false;
      peelRef.current?.release();
      setHint("whoa… dizzy");
      if (burstLayer) {
        const { x, y } = stickerCenter();
        spawnBurst(burstLayer, x, y, 22, 1.7);
      }
      shockwave();
      popSparks();
      const spinner = { a: 0 };
      gsap
        .timeline({
          onComplete: () => {
            busyRef.current = false;
            trackEyes = true;
            setHint(null);
          },
        })
        .to(sticker, { rotation: 720, duration: 1.1, ease: "power3.inOut" }, 0)
        .set(sticker, { rotation: 0 })
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
        if (!burstLayer) return;
        const { x, y } = stickerCenter();
        spawnBurst(burstLayer, x, y, 8);
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
      return;
    }

    // Idle life: blinking, twinkling sparks, breathing brackets.
    let blinkTimer = 0;
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        blink();
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

    // Pupils follow the pointer anywhere on the page.
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

    // 3D tilt + foil sheen that follows the pointer across the sticker.
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

    // Left alone for a while, a corner lifts by itself to invite a peel.
    let lastActive = performance.now();
    let peekTl: gsap.core.Timeline | null = null;
    const endPeek = () => {
      if (!peekTl) return;
      peekTl.kill();
      peekTl = null;
      setHint(null);
      const hovered = stickerRef.current?.hasAttribute("data-hover");
      if (!hovered && !dragRef.current) peelRef.current?.release();
    };
    const peek = () => {
      const peel = peelRef.current;
      if (!peel || !sticker) return;
      const size = sticker.getBoundingClientRect().width;
      const directions = ["left", "right", "bottom"] as const;
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const along = size * (0.55 + Math.random() * 0.3);
      const state = { depth: 0 };
      const apply = () => {
        const d = state.depth;
        if (direction === "left") peel.update(d, along);
        else if (direction === "right") peel.update(size - d, along);
        else peel.update(along, size - d);
      };
      peel.begin(
        direction === "left" ? 1 : direction === "right" ? size - 1 : along,
        direction === "bottom" ? size - 1 : along,
        direction,
      );
      setHint("psst… peel me");
      peekTl = gsap
        .timeline({ onComplete: endPeek })
        .to(state, { depth: size * 0.42, duration: 0.6, ease: "power2.out", onUpdate: apply })
        .to(state, {
          depth: size * 0.34,
          duration: 0.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 3,
          onUpdate: apply,
        })
        .to({}, { duration: 0.3 });
    };
    const peekTimer = window.setInterval(() => {
      const peel = peelRef.current;
      if (!peel || !sticker || peekTl || peel.active) return;
      if (busyRef.current || dragRef.current || document.hidden) return;
      if (performance.now() - lastActive < IDLE_PEEK_MS) return;
      const rect = sticker.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      lastActive = performance.now();
      peek();
    }, 1000);

    const onPointerMove = (event: PointerEvent) => {
      lastActive = performance.now();
      endPeek();
      if (!trackEyes) return;
      const rect = stickerRef.current?.getBoundingClientRect();
      if (!rect || rect.width < 1) return;
      const scale = rect.width / CROP.size;
      eyeCenters.forEach((eye, index) => {
        const mover = movers[index];
        if (!mover) return;
        const ex = rect.left + (eye.x - CROP.x) * scale;
        const ey = rect.top + (eye.y - CROP.y) * scale;
        const dx = Math.max(-1, Math.min(1, (event.clientX - ex) / 160));
        const dy = Math.max(-1, Math.min(1, (event.clientY - ey) / 160));
        mover.x(dx * PUPIL_RANGE.x);
        mover.y(dy * PUPIL_RANGE.y);
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.clearTimeout(blinkTimer);
      window.clearInterval(peekTimer);
      peekTl?.kill();
      tiltToRef.current = null;
      busyRef.current = false;
      twinkle.kill();
      breathe.kill();
      gsap.set([q("bracket-left-idle"), q("bracket-right-idle")], { x: 0 });
      window.removeEventListener("pointermove", onPointerMove);
      gsap.killTweensOf([
        hair,
        brows,
        mouth,
        ear,
        sticker,
        tilt,
        ring,
        bracketL,
        bracketR,
        ...pupils,
        ...lids,
        ...glints,
        ...sparks,
      ]);
    };
  }, []);

  const run = (...names: string[]) => {
    for (const name of names) actionsRef.current[name]?.();
  };

  const onEnter = (part: Part, ...actions: string[]) => () => {
    // Parts sliding under a still pointer mid-spin/fling aren't real hovers.
    if (busyRef.current) return;
    setHint(HINTS[part]);
    run(...actions);
  };

  const onLeave = () => {
    if (!busyRef.current) setHint(null);
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
      if (busyRef.current) return;
      if (registerHit()) return;
      const layer = burstRef.current;
      if (layer && !reducedRef.current) {
        const rect = layer.getBoundingClientRect();
        spawnBurst(layer, event.clientX - rect.left, event.clientY - rect.top, 6);
      }
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
    if (busyRef.current || registerHit()) return;
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
      <path
        data-part={interactive ? "ear" : undefined}
        className={interactive ? styles.part : undefined}
        d={PATH.ear}
        fill={COLOR.cream}
        onPointerEnter={interactive ? onEnter("ear", "wiggleEar") : undefined}
        onPointerLeave={interactive ? onLeave : undefined}
        onClick={interactive ? onPartClick("wiggleEar") : undefined}
      />
      <path
        data-part={interactive ? "hair" : undefined}
        className={interactive ? styles.part : undefined}
        d={PATH.hair}
        fill={COLOR.ink}
        onPointerEnter={interactive ? onEnter("hair", "boing") : undefined}
        onPointerLeave={interactive ? onLeave : undefined}
        onClick={interactive ? onPartClick("boing", "raiseBrows") : undefined}
      />
      <path
        data-part={interactive ? "brows" : undefined}
        className={interactive ? styles.part : undefined}
        d={PATH.brows}
        fill={COLOR.ink}
        onPointerEnter={interactive ? onEnter("brows", "raiseBrows") : undefined}
        onPointerLeave={interactive ? onLeave : undefined}
        onClick={interactive ? onPartClick("raiseBrows") : undefined}
      />
      <g
        className={interactive ? styles.part : undefined}
        onPointerEnter={interactive ? onEnter("beard") : undefined}
        onPointerLeave={interactive ? onLeave : undefined}
        onClick={interactive ? onPartClick("talk") : undefined}
      >
        <path d={PATH.beard} fill={COLOR.ink} />
        <path data-part={interactive ? "mouth" : undefined} d={PATH.mouth} fill={COLOR.cream} />
      </g>

      {/* The traced frame is solid over the lenses, so the eyes draw on top of it. */}
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
            onPointerLeave={() => {
              onLeave();
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
            onPointerLeave={() => {
              onLeave();
              run("hover-brackets-off");
            }}
            onClick={onPartClick("close-right")}
          />
        </g>
      </svg>

      <div
        ref={stickerRef}
        className={styles.sticker}
        style={stickerPosition}
        onPointerMove={onStickerPointerMove}
        onPointerDown={onStickerPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onStickerPointerLeave}
        onClick={onPartClick("boop")}
      >
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

      <div ref={ringRef} className={styles.ring} style={stickerPosition} aria-hidden="true" />
      <div ref={burstRef} className={styles.burst} aria-hidden="true" />

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
    </div>
  );
}
