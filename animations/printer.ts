import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type BindPrinterScrollOptions = {
  root: HTMLElement;
  lines: HTMLElement[];
};

export function bindPrinterScroll({ root, lines }: BindPrinterScrollOptions) {
  if (!lines.length) return () => {};

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    gsap.set(lines, { xPercent: 0 });
    return () => {};
  }

  const tween = gsap.fromTo(
    lines,
    { xPercent: -100 },
    {
      xPercent: 0,
      ease: "none",
      stagger: 0.08,
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    },
  );

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
