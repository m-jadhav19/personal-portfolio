"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { gsap } from "gsap";

const BASE_SIZE = 12;
const HOVER_SIZE = 28;
/** Snappy enough to feel attached; soft enough to avoid jitter. */
const FOLLOW = 0.42;

const INTERACTIVE_SELECTOR =
  'a, button, [data-cursor="nav"], [data-cursor="interactive"]';
const HIDE_CURSOR_SELECTOR = '[data-cursor="hide"]';

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef(BASE_SIZE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const dot = dotRef.current;
    if (!dot) return;

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
        gsap.set(dot, { x: curX, y: curY, opacity: 1 });
      }

      if (!visible) {
        visible = true;
        gsap.to(dot, { opacity: 1, duration: 0.12, overwrite: "auto" });
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
      gsap.set(dot, { x: curX, y: curY });
    };

    const scaleTo = (size: number) => {
      if (sizeRef.current === size) return;
      sizeRef.current = size;
      gsap.to(dot, {
        width: size,
        height: size,
        duration: 0.16,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest(HIDE_CURSOR_SELECTOR)) {
        gsap.to(dot, { opacity: 0, duration: 0.1, overwrite: "auto" });
        scaleTo(BASE_SIZE);
        return;
      }

      if (hasMoved) {
        gsap.to(dot, { opacity: 1, duration: 0.1, overwrite: "auto" });
      }

      if (
        target.closest(INTERACTIVE_SELECTOR) &&
        !target.closest(HIDE_CURSOR_SELECTOR)
      ) {
        scaleTo(HOVER_SIZE);
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
          gsap.to(dot, { opacity: 1, duration: 0.1, overwrite: "auto" });
        }
        return;
      }

      if (!target.closest(INTERACTIVE_SELECTOR)) return;
      if (related instanceof Element && related.closest(INTERACTIVE_SELECTOR)) {
        return;
      }
      scaleTo(BASE_SIZE);
    };

    const onLeaveWindow = () => {
      visible = false;
      gsap.to(dot, { opacity: 0, duration: 0.15, overwrite: "auto" });
    };

    gsap.set(dot, {
      x: mouseX,
      y: mouseY,
      xPercent: -50,
      yPercent: -50,
      width: BASE_SIZE,
      height: BASE_SIZE,
      opacity: 0,
    });

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
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 rounded-full bg-white mix-blend-difference"
      style={{ willChange: "transform", zIndex: "var(--z-cursor)" }}
    />,
    document.body,
  );
}
