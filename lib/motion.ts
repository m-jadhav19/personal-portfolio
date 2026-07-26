export const EASE = [0.22, 1, 0.36, 1] as const;

export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const DURATION = {
  fast: 0.4,
  medium: 0.8,
  large: 1.2,
  hero: 1.6,
} as const;

/** Shorter timings for the initial page intro sequence. */
export const INTRO_DURATION = {
  navLogo: 0.75,
  navLinks: 0.32,
  navLinksDelay: 0.2,
  navStagger: 0.05,
  heroMarquee: 0.8,
  heroMarqueeStagger: 0.06,
  heroPortrait: 1,
  heroPortraitDelay: 0.05,
  loaderReveal: 0.6,
} as const;

export const DURATION_MS = {
  fast: DURATION.fast * 1000,
  medium: DURATION.medium * 1000,
  large: DURATION.large * 1000,
  hero: DURATION.hero * 1000,
} as const;

export const TRANSITION = {
  fast: `${DURATION.fast}s ${EASE_CSS}`,
  medium: `${DURATION.medium}s ${EASE_CSS}`,
  large: `${DURATION.large}s ${EASE_CSS}`,
  hero: `${DURATION.hero}s ${EASE_CSS}`,
} as const;
