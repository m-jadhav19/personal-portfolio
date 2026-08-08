"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { gsap } from "gsap";

const BASE_SIZE = 12;
const HOVER_SIZE = 28;
const LABEL_SIZE = 56;
/** Snappy enough to feel attached; soft enough to avoid jitter. */
const FOLLOW = 0.42;

const INTERACTIVE_SELECTOR =
  'a, button, [data-cursor="nav"], [data-cursor="interactive"], [data-cursor="project"], [data-cursor="external"], [data-cursor="explore"]';
const HIDE_CURSOR_SELECTOR = '[data-cursor="hide"]';

type CursorMode = "default" | "project" | "external" | "explore" | "interactive";

function resolveMode(element: Element): CursorMode {
  if (element.closest('[data-cursor="project"]')) return "project";
  if (element.closest('[data-cursor="external"]')) return "external";
  if (element.closest('[data-cursor="explore"]')) return "explore";
  if (
    element.closest(
      'a[target="_blank"], a[href^="http"], a[href^="mailto:"]',
    )
  ) {
    return "external";
  }
  if (element.closest(INTERACTIVE_SELECTOR)) return "interactive";
  return "default";
}

function labelForMode(mode: CursorMode) {
  switch (mode) {
    case "project":
      return "VIEW";
    case "external":
      return "OPEN ↗";
    case "explore":
      return "EXPLORE";
    default:
      return "+";
  }
}

export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const sizeRef = useRef(BASE_SIZE);
  const modeRef = useRef<CursorMode>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = rootRef.current;
    const label = labelRef.current;
    if (!root || !label) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (!isFinePointer || prefersReducedMotion) return;

    document.body.classList.add("custom-cursor-active");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let hasMoved = false;
    let visible = true;

    const moveCursor = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!hasMoved) {
        hasMoved = true;
        curX = mouseX;
        curY = mouseY;
        gsap.set(root, { x: curX, y: curY, opacity: 1 });
      }

      if (!visible) {
        visible = true;
        gsap.to(root, { opacity: 1, duration: 0.12, overwrite: "auto" });
      }
    };

    const animateCursor = () => {
      const dx = mouseX - curX;
      const dy = mouseY - curY;

      if (Math.abs(dx) < 0.35 && Math.abs(dy) < 0.35) {
        return;
      }

      curX += dx * FOLLOW;
      curY += dy * FOLLOW;
      gsap.set(root, { x: curX, y: curY });
    };

    const scaleTo = (size: number) => {
      if (sizeRef.current === size) return;
      sizeRef.current = size;
      gsap.to(root, {
        width: size,
        height: size,
        duration: 0.16,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const setMode = (mode: CursorMode) => {
      if (modeRef.current === mode) return;
      modeRef.current = mode;
      label.textContent = labelForMode(mode);
      const showLabel = mode !== "default" && mode !== "interactive";
      label.style.opacity = showLabel || mode === "default" ? "1" : "0.85";
      if (mode === "default") {
        label.style.fontSize = "0.7rem";
      } else if (showLabel) {
        label.style.fontSize = "0.55rem";
      }
    };

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest(HIDE_CURSOR_SELECTOR)) {
        gsap.to(root, { opacity: 0, duration: 0.1, overwrite: "auto" });
        scaleTo(BASE_SIZE);
        setMode("default");
        return;
      }

      if (hasMoved) {
        gsap.to(root, { opacity: 1, duration: 0.1, overwrite: "auto" });
      }

      const mode = resolveMode(target);
      setMode(mode);

      if (mode === "project" || mode === "external" || mode === "explore") {
        scaleTo(LABEL_SIZE);
      } else if (target.closest(INTERACTIVE_SELECTOR)) {
        scaleTo(HOVER_SIZE);
      } else {
        scaleTo(BASE_SIZE);
      }
    };

    const onMouseOut = (event: MouseEvent) => {
      const target = event.target;
      const related = event.relatedTarget;
      if (!(target instanceof Element)) return;

      if (target.closest(HIDE_CURSOR_SELECTOR)) {
        if (
          related instanceof Element &&
          related.closest(HIDE_CURSOR_SELECTOR)
        ) {
          return;
        }
        if (hasMoved) {
          gsap.to(root, { opacity: 1, duration: 0.1, overwrite: "auto" });
        }
        return;
      }

      if (!target.closest(INTERACTIVE_SELECTOR)) return;
      if (related instanceof Element && related.closest(INTERACTIVE_SELECTOR)) {
        return;
      }
      scaleTo(BASE_SIZE);
      setMode("default");
    };

    const onLeaveWindow = () => {
      visible = false;
      gsap.to(root, { opacity: 0, duration: 0.15, overwrite: "auto" });
    };

    gsap.set(root, {
      x: mouseX,
      y: mouseY,
      xPercent: -50,
      yPercent: -50,
      width: BASE_SIZE,
      height: BASE_SIZE,
      opacity: 0,
    });
    setMode("default");

    gsap.ticker.add(animateCursor);
    window.addEventListener("mousemove", moveCursor, { passive: true });
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      gsap.ticker.remove(animateCursor);
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 flex items-center justify-center overflow-hidden rounded-full bg-white mix-blend-difference"
      style={{ willChange: "transform", zIndex: "var(--z-cursor)" }}
    >
      <span
        ref={labelRef}
        className="select-none font-mono font-semibold tracking-widest text-black"
        style={{
          fontSize: "0.7rem",
          lineHeight: 1,
          letterSpacing: "0.12em",
        }}
      >
        +
      </span>
    </div>,
    document.body,
  );
}
