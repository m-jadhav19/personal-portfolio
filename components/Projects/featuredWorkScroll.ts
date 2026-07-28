import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DESKTOP_MEDIA_QUERY = "(min-width: 901px)";

type FeaturedWorkScrollCleanup = () => void;

function isDesktopViewport() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

export function setupFeaturedWorkScroll(
  section: HTMLElement,
): FeaturedWorkScrollCleanup {
  const pinTrack = section.querySelector<HTMLElement>(
    "[data-featured-pin-track]",
  );
  const rows = gsap.utils.toArray<HTMLElement>(
    "[data-project-row]",
    section,
  );

  if (!pinTrack || rows.length === 0) {
    return () => {};
  }

  gsap.set(rows, { autoAlpha: 0, y: 48 });

  const getScrollDistance = () => window.innerHeight * rows.length;

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: pinTrack,
      start: "top top",
      end: () => `+=${getScrollDistance()}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  rows.forEach((row, index) => {
    const media = row.querySelector<HTMLElement>("[data-project-media]");
    const info = row.querySelector<HTMLElement>("[data-project-info]");

    if (index > 0) {
      timeline.to(
        rows[index - 1],
        {
          autoAlpha: 0,
          y: -32,
          duration: 0.22,
          ease: "power2.in",
        },
        index - 0.18,
      );
    }

    timeline.fromTo(
      row,
      { autoAlpha: 0, y: 48 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.78,
        ease: "power2.out",
      },
      index,
    );

    if (media) {
      timeline.fromTo(
        media,
        { y: 28 },
        { y: -28, duration: 1, ease: "none" },
        index,
      );
    }

    if (info) {
      timeline.fromTo(
        info,
        { y: -16 },
        { y: 16, duration: 1, ease: "none" },
        index,
      );
    }
  });

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
    gsap.set(rows, { clearProps: "all" });

    rows.forEach((row) => {
      const media = row.querySelector<HTMLElement>("[data-project-media]");
      const info = row.querySelector<HTMLElement>("[data-project-info]");
      gsap.set([media, info].filter(Boolean), { clearProps: "all" });
    });
  };
}

export function initFeaturedWorkScroll(
  section: HTMLElement,
): FeaturedWorkScrollCleanup {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || !isDesktopViewport()) {
    return () => {};
  }

  section.setAttribute("data-scroll-sequence", "true");

  let cleanup = setupFeaturedWorkScroll(section);
  const desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);

  const handleViewportChange = () => {
    cleanup();
    section.removeAttribute("data-scroll-sequence");

    if (!prefersReducedMotion && desktopMedia.matches) {
      section.setAttribute("data-scroll-sequence", "true");
      cleanup = setupFeaturedWorkScroll(section);
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
