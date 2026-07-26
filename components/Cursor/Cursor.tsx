"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";

const BASE_SIZE = 10;
const HOVER_SIZE = 48;

const INTERACTIVE_SELECTOR =
  'a, button, [data-cursor="nav"], [data-cursor="interactive"]';

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef(BASE_SIZE);

  useEffect(() => {
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
    let frame = 0;

    const moveCursor = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const animateCursor = () => {
      curX += (mouseX - curX) * 0.2;
      curY += (mouseY - curY) * 0.2;
      gsap.set(dot, { x: curX, y: curY });
      frame = requestAnimationFrame(animateCursor);
    };

    const scaleTo = (size: number) => {
      if (sizeRef.current === size) return;
      sizeRef.current = size;
      gsap.to(dot, {
        width: size,
        height: size,
        duration: 0.25,
        ease: "power3.out",
      });
    };

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        scaleTo(HOVER_SIZE);
      }
    };

    const onMouseOut = (event: MouseEvent) => {
      const target = event.target;
      const related = event.relatedTarget;
      if (!(target instanceof Element)) return;
      if (!target.closest(INTERACTIVE_SELECTOR)) return;
      if (related instanceof Element && related.closest(INTERACTIVE_SELECTOR)) {
        return;
      }
      scaleTo(BASE_SIZE);
    };

    gsap.set(dot, {
      x: mouseX,
      y: mouseY,
      xPercent: -50,
      yPercent: -50,
      width: BASE_SIZE,
      height: BASE_SIZE,
    });

    frame = requestAnimationFrame(animateCursor);
    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[2000] rounded-full bg-white mix-blend-difference"
    />
  );
}
