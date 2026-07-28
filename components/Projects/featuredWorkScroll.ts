import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { TextScramble } from "@/animations/scramble";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MEDIA_QUERY = "(min-width: 901px)";

type FeaturedWorkScrollCleanup = () => void;

function isDesktopViewport() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

export function setupFeaturedWorkScroll(
  section: HTMLElement,
): FeaturedWorkScrollCleanup {
  const headingWrap = section.querySelector<HTMLElement>(
    "[data-featured-heading-wrap]",
  );
  const projects = section.querySelector<HTMLElement>("[data-featured-projects]");
  const heading = section.querySelector<HTMLElement>("[data-featured-heading]");
  const rows = gsap.utils.toArray<HTMLElement>("[data-project-row]", section);
  const triggers: ScrollTrigger[] = [];
  const tweens: gsap.core.Tween[] = [];

  if (headingWrap && projects) {
    const pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${projects.offsetHeight}`,
      pin: headingWrap,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });

    triggers.push(pinTrigger);
  }

  if (heading) {
    const finalText = heading.textContent?.trim() ?? "Featured Work";
    const scramble = new TextScramble(heading);
    let lastProgress = -1;

    const headingTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const progress = Math.round(self.progress * 24) / 24;
        if (progress === lastProgress) return;
        lastProgress = progress;
        void scramble.setText(finalText);
      },
    });

    triggers.push(headingTrigger);
  }

  rows.forEach((row) => {
    const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]", row);

    reveals.forEach((element, index) => {
      gsap.set(element, { autoAlpha: 0, y: 24 });

      const tween = gsap.to(element, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: index * 0.08,
        scrollTrigger: {
          trigger: row,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });

      tweens.push(tween);
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    const media = row.querySelector<HTMLElement>("[data-project-media-inner]");
    const info = row.querySelector<HTMLElement>("[data-project-info]");

    if (media) {
      gsap.set(media, { y: 28 });

      const mediaParallax = gsap.to(media, {
        y: -28,
        ease: "none",
        scrollTrigger: {
          trigger: row,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      tweens.push(mediaParallax);
      if (mediaParallax.scrollTrigger) triggers.push(mediaParallax.scrollTrigger);
    }

    if (info) {
      gsap.set(info, { y: -16 });

      const infoParallax = gsap.to(info, {
        y: 16,
        ease: "none",
        scrollTrigger: {
          trigger: row,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      tweens.push(infoParallax);
      if (infoParallax.scrollTrigger) triggers.push(infoParallax.scrollTrigger);
    }
  });

  ScrollTrigger.refresh();

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    tweens.forEach((tween) => tween.kill());
    rows.forEach((row) => {
      gsap.utils
        .toArray<HTMLElement>(
          "[data-reveal], [data-project-media-inner], [data-project-info]",
          row,
        )
        .forEach((element) => gsap.set(element, { clearProps: "all" }));
    });
  };
}

export function initFeaturedWorkScroll(
  section: HTMLElement,
): FeaturedWorkScrollCleanup {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    return () => {};
  }

  section.setAttribute("data-scroll-sequence", "true");

  let cleanup = isDesktopViewport() ? setupFeaturedWorkScroll(section) : () => {};
  const desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);

  const handleViewportChange = () => {
    cleanup();
    cleanup = isDesktopViewport() ? setupFeaturedWorkScroll(section) : () => {};

    if (isDesktopViewport()) {
      section.setAttribute("data-scroll-sequence", "true");
    } else {
      section.removeAttribute("data-scroll-sequence");
    }

    ScrollTrigger.refresh();
  };

  desktopMedia.addEventListener("change", handleViewportChange);

  return () => {
    desktopMedia.removeEventListener("change", handleViewportChange);
    cleanup();
    section.removeAttribute("data-scroll-sequence");
  };
}
