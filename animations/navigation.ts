import { gsap } from "gsap";

import { DURATION, EASE_CSS } from "@/lib/motion";

export const INTRO_COMPLETE_EVENT = "intro:complete";
export const NAV_COMPLETE_EVENT = "nav:complete";

type NavigationIntroTargets = {
  logo: HTMLElement | null;
  links: HTMLElement[];
};

export function playNavigationIntro({ logo, links }: NavigationIntroTargets) {
  const tl = gsap.timeline({
    defaults: { ease: EASE_CSS },
    onComplete: () => {
      document.documentElement.classList.remove("intro-loading");
      document.documentElement.classList.add("intro-nav-only");
      window.dispatchEvent(new CustomEvent(NAV_COMPLETE_EVENT));
    },
  });

  if (logo) {
    gsap.set(logo, { yPercent: 120 });
    tl.to(logo, { yPercent: 0, duration: DURATION.large }, 0);
  }

  if (links.length) {
    gsap.set(links, { opacity: 0, y: 12 });
    tl.to(
      links,
      {
        opacity: 1,
        y: 0,
        duration: DURATION.fast,
        stagger: 0.08,
      },
      0.35,
    );
  }

  return tl;
}

type MobileMenuTargets = {
  overlay: HTMLElement;
  panel: HTMLElement;
  links: HTMLElement[];
};

export function openMobileMenu({ overlay, panel, links }: MobileMenuTargets) {
  const tl = gsap.timeline({ defaults: { ease: EASE_CSS } });

  tl.set(overlay, { pointerEvents: "auto", visibility: "visible" })
    .fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: DURATION.fast },
      0,
    )
    .fromTo(
      panel,
      { clipPath: "inset(0 0 100% 0)" },
      { clipPath: "inset(0 0 0% 0)", duration: DURATION.medium },
      0,
    )
    .from(
      links,
      {
        y: 32,
        opacity: 0,
        duration: DURATION.fast,
        stagger: 0.06,
      },
      0.25,
    );

  return tl;
}

export function closeMobileMenu({ overlay, panel, links }: MobileMenuTargets) {
  const tl = gsap.timeline({
    defaults: { ease: EASE_CSS },
    onComplete: () => {
      gsap.set(overlay, { pointerEvents: "none", visibility: "hidden" });
    },
  });

  tl.to(links, {
    y: -16,
    opacity: 0,
    duration: 0.25,
    stagger: 0.03,
  })
    .to(
      panel,
      { clipPath: "inset(0 0 100% 0)", duration: DURATION.fast },
      0.05,
    )
    .to(overlay, { opacity: 0, duration: DURATION.fast }, 0.1);

  return tl;
}
