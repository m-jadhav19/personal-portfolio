import { gsap } from "gsap";

import { EASE_CSS, INTRO_DURATION } from "@/lib/motion";

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
        duration: INTRO_DURATION.heroMarquee,
        stagger: INTRO_DURATION.heroMarqueeStagger,
      },
      0,
    );
  }

  if (portrait) {
    gsap.set(portrait, { clipPath: "inset(100% 0 0 0)", scale: 1.05 });
    tl.to(
      portrait,
      {
        clipPath: "inset(0% 0 0 0)",
        scale: 1,
        duration: INTRO_DURATION.heroPortrait,
      },
      INTRO_DURATION.heroPortraitDelay,
    );
  }

  return tl;
}
