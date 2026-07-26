"use client";

import { useEffect } from "react";

import Lenis from "lenis";

import "lenis/dist/lenis.css";

export type LenisScrollCallback = (scroll: number) => void;

type LenisWindow = Window & {
  __lenis__?: Lenis;
  __lenisScrollListeners__?: Set<LenisScrollCallback>;
};

function getLenisWindow() {
  return window as LenisWindow;
}

export function subscribeLenisScroll(callback: LenisScrollCallback) {
  const win = getLenisWindow();
  if (!win.__lenisScrollListeners__) {
    win.__lenisScrollListeners__ = new Set();
  }
  win.__lenisScrollListeners__.add(callback);

  if (win.__lenis__) {
    callback(win.__lenis__.scroll);
  }

  return () => {
    win.__lenisScrollListeners__?.delete(callback);
  };
}

export function useLenis() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const win = getLenisWindow();
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    win.__lenis__ = lenis;
    if (!win.__lenisScrollListeners__) {
      win.__lenisScrollListeners__ = new Set();
    }

    document.documentElement.classList.add("lenis");

    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      win.__lenisScrollListeners__?.forEach((listener) => listener(scroll));
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
      delete win.__lenis__;
    };
  }, []);
}
