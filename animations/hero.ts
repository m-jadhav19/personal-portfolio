import { gsap } from "gsap";

import { DURATION, EASE_CSS } from "@/lib/motion";

export const HERO_COMPLETE_EVENT = "hero:complete";

type HeroIntroTargets = {
  marqueeLines: HTMLElement[];
  portrait: HTMLElement | null;
};

export function playHeroIntro({ marqueeLines, portrait }: HeroIntroTargets) {
  const tl = gsap.timeline({
    defaults: { ease: EASE_CSS },
    onComplete: () => {
      document.documentElement.classList.remove("intro-nav-only");
      document.documentElement.dataset.hero = "complete";
      window.dispatchEvent(new CustomEvent(HERO_COMPLETE_EVENT));
    },
  });

  if (marqueeLines.length) {
    gsap.set(marqueeLines, { clipPath: "inset(100% 0 0 0)" });
    tl.to(
      marqueeLines,
      {
        clipPath: "inset(0% 0 0 0)",
        duration: DURATION.large,
        stagger: 0.12,
      },
      0,
    );
  }

  if (portrait) {
    gsap.set(portrait, { clipPath: "inset(100% 0 0 0)", scale: 1.08 });
    tl.to(
      portrait,
      {
        clipPath: "inset(0% 0 0 0)",
        scale: 1,
        duration: DURATION.hero,
      },
      0.2,
    );
  }

  return tl;
}
