"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./Cursor.module.css";

type CursorState =
  | "default"
  | "project"
  | "image"
  | "link"
  | "button"
  | "lab"
  | "capability"
  | "nav"
  | "interactive";

const SYMBOL: Record<CursorState, string> = {
  default: "·",
  project: "↗",
  image: "×",
  link: "→",
  button: "+",
  lab: "*",
  capability: "+",
  nav: "·",
  interactive: "+",
};

/** Half-size of the default square reticle (edge to center). */
const GAP = 10;
const FRAME_OUTSET = 6;
const BRACKET_FOLLOW = 0.45;
const FRAME_FOLLOW = 0.32;
const GLITCH_MS = 100;
const GLITCH_CHANCE = 0.04;

type Point = { x: number; y: number };

const CORNERS = [
  { key: "tl", className: "tl" },
  { key: "tr", className: "tr" },
  { key: "bl", className: "bl" },
  { key: "br", className: "br" },
] as const;

const FRAME_STATES = new Set<string>([
  "project",
  "image",
  "link",
  "button",
  "lab",
  "capability",
  "nav",
  "interactive",
]);

function resolveFromPoint(
  x: number,
  y: number,
): { state: CursorState; frameEl: HTMLElement | null } {
  const stack = document.elementsFromPoint(x, y);

  for (const el of stack) {
    if (!(el instanceof Element)) continue;
    if (el.closest("[data-cursor-root]")) continue;

    const target = el.closest("[data-cursor]");
    if (!(target instanceof HTMLElement)) continue;

    const raw = target.getAttribute("data-cursor") || "default";
    if (raw === "hide") return { state: "default", frameEl: null };

    const state = raw as CursorState;
    return {
      state,
      frameEl: FRAME_STATES.has(raw) ? target : null,
    };
  }

  // Magnetic wrappers sit above the child — walk for a framed descendant under the pointer.
  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue;
    if (el.closest("[data-cursor-root]")) continue;

    const child = el.querySelector<HTMLElement>("[data-cursor]");
    if (!child) continue;

    const raw = child.getAttribute("data-cursor") || "default";
    if (raw === "hide" || !FRAME_STATES.has(raw)) continue;

    const rect = child.getBoundingClientRect();
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      return { state: raw as CursorState, frameEl: child };
    }
  }

  return { state: "default", frameEl: null };
}

function defaultOffsets(mx: number, my: number) {
  return {
    tl: { x: mx - GAP, y: my - GAP },
    tr: { x: mx + GAP, y: my - GAP },
    bl: { x: mx - GAP, y: my + GAP },
    br: { x: mx + GAP, y: my + GAP },
  };
}

function frameOffsets(rect: DOMRect) {
  const left = rect.left - FRAME_OUTSET;
  const right = rect.right + FRAME_OUTSET;
  const top = rect.top - FRAME_OUTSET;
  const bottom = rect.bottom + FRAME_OUTSET;

  // Keep a readable square-ish frame on short text links.
  const width = right - left;
  const height = bottom - top;
  const minSide = Math.max(28, Math.min(width, height));
  let l = left;
  let r = right;
  let t = top;
  let b = bottom;

  if (height < minSide) {
    const mid = (top + bottom) / 2;
    t = mid - minSide / 2;
    b = mid + minSide / 2;
  }
  if (width < minSide) {
    const mid = (left + right) / 2;
    l = mid - minSide / 2;
    r = mid + minSide / 2;
  }

  return {
    tl: { x: l, y: t },
    tr: { x: r, y: t },
    bl: { x: l, y: b },
    br: { x: r, y: b },
  };
}

export function Cursor() {
  const cornerRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const centerRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const corners = useRef<Record<string, Point>>({
    tl: { x: 0, y: 0 },
    tr: { x: 0, y: 0 },
    bl: { x: 0, y: 0 },
    br: { x: 0, y: 0 },
  });
  const targets = useRef(defaultOffsets(0, 0));
  const frameEl = useRef<HTMLElement | null>(null);
  const framedRef = useRef(false);
  const velocity = useRef(0);
  const lastMouse = useRef({ x: 0, y: 0, t: 0 });
  const glitchUntil = useRef(0);

  const [state, setState] = useState<CursorState>("default");
  const [framed, setFramed] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer || prefersReducedMotion) return;

    setActive(true);
    document.body.classList.add("custom-cursor-active");

    const onMove = (event: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(now - lastMouse.current.t, 1);
      const dx = event.clientX - lastMouse.current.x;
      const dy = event.clientY - lastMouse.current.y;
      velocity.current = Math.hypot(dx, dy) / dt;

      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
      lastMouse.current = { x: event.clientX, y: event.clientY, t: now };

      const next = resolveFromPoint(event.clientX, event.clientY);
      frameEl.current = next.frameEl;
      const nextFramed = Boolean(next.frameEl);
      if (framedRef.current !== nextFramed) {
        framedRef.current = nextFramed;
        setFramed(nextFramed);
      }
      setState((current) => (current === next.state ? current : next.state));

      if (
        !glitchUntil.current &&
        velocity.current > 1.2 &&
        Math.random() < GLITCH_CHANCE
      ) {
        glitchUntil.current = now + GLITCH_MS;
        setGlitch(true);
      }
    };

    let frame = 0;
    const animate = () => {
      const now = performance.now();
      const mx = mouse.current.x;
      const my = mouse.current.y;

      if (glitchUntil.current && now >= glitchUntil.current) {
        glitchUntil.current = 0;
        setGlitch(false);
      }

      const el = frameEl.current;
      if (el) {
        targets.current = frameOffsets(el.getBoundingClientRect());
      } else if (glitchUntil.current) {
        const scramble = GAP + 3 + Math.random() * 5;
        targets.current = {
          tl: { x: mx - scramble, y: my - scramble },
          tr: { x: mx + scramble, y: my - scramble * 0.7 },
          bl: { x: mx - scramble * 0.7, y: my + scramble },
          br: { x: mx + scramble, y: my + scramble },
        };
      } else {
        targets.current = defaultOffsets(mx, my);
      }

      const follow = el ? FRAME_FOLLOW : BRACKET_FOLLOW;

      for (const item of CORNERS) {
        const current = corners.current[item.key];
        const target = targets.current[item.key];
        current.x += (target.x - current.x) * follow;
        current.y += (target.y - current.y) * follow;

        const node = cornerRefs.current[item.key];
        if (node) {
          node.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
        }
      }

      if (centerRef.current) {
        // Keep the glyph centered on the pointer while framed.
        const cx = el
          ? (targets.current.tl.x + targets.current.tr.x) / 2
          : mx;
        const cy = el
          ? (targets.current.tl.y + targets.current.bl.y) / 2
          : my;
        centerRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }

      if (coordsRef.current) {
        coordsRef.current.style.transform = `translate3d(${mx}px, ${my + 18}px, 0) translate(-50%, 0)`;
        coordsRef.current.textContent = `X ${Math.round(mx)}  Y ${Math.round(my)}`;
      }

      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("custom-cursor-active");
      setActive(false);
    };
  }, [mounted]);

  if (!mounted || !active) return null;

  const showCoords = state === "lab";

  return createPortal(
    <div
      data-cursor-root
      className={`${styles.root} ${framed ? styles.rootFramed : ""} ${
        glitch ? styles.rootGlitch : ""
      }`}
      aria-hidden="true"
    >
      {CORNERS.map(({ key, className }) => (
        <span
          key={key}
          ref={(node) => {
            cornerRefs.current[key] = node;
          }}
          className={`${styles.corner} ${styles[className]}`}
        />
      ))}
      <span ref={centerRef} className={styles.center}>
        {SYMBOL[state] ?? "·"}
      </span>
      <span
        ref={coordsRef}
        className={`${styles.coords} ${showCoords ? styles.coordsVisible : ""}`}
      />
    </div>,
    document.body,
  );
}
