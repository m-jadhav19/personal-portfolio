"use client";

import { useCallback } from "react";

export function useSmoothScroll() {
  return useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    const lenis = (
      window as Window & { __lenis__?: { scrollTo: (el: HTMLElement, opts: object) => void } }
    ).__lenis__;

    if (lenis) {
      lenis.scrollTo(target, { offset: -96, duration: 1.2 });
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
}
