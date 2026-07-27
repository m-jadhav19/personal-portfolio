"use client";

import { useEffect, type RefObject } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const LENIS_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

type UseCatalogScrollOptions = {
  wrapperRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  enabled: boolean;
};

export function useCatalogScroll({
  wrapperRef,
  contentRef,
  enabled,
}: UseCatalogScrollOptions) {
  useEffect(() => {
    if (!enabled) return;

    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      wrapper.style.overflowY = "auto";
      return () => {
        wrapper.style.overflowY = "";
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.1,
      easing: LENIS_EASING,
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const ctx = gsap.context(() => {
      const items = content.querySelectorAll<HTMLElement>("[data-catalog-item]");

      items.forEach((item) => {
        const thumb = item.querySelector<HTMLElement>("[data-catalog-thumb]");
        const copy = item.querySelector<HTMLElement>("[data-catalog-copy]");

        if (thumb) {
          gsap.fromTo(
            thumb,
            { y: 28 },
            {
              y: -28,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                scroller: wrapper,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        if (copy) {
          gsap.fromTo(
            copy,
            { y: -16 },
            {
              y: 16,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                scroller: wrapper,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      });
    }, content);

    return () => {
      cancelAnimationFrame(frame);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      ctx.revert();
      ScrollTrigger.refresh();
      wrapper.style.overflowY = "";
    };
  }, [contentRef, enabled, wrapperRef]);
}
