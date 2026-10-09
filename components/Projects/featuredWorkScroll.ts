import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getLenis } from "@/lib/lenis";

import { clampChapterStep, getChapterIndex } from "./projectMotion";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MEDIA_QUERY = "(min-width: 901px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const CHAPTER_STEP_VH = 0.4;

function chapterMotion(duration: number): gsap.TweenVars {
  return {
    duration,
    ease: "power3.out",
    easeReverse: "power3.in",
  } as gsap.TweenVars;
}

type WorkScrollMode = "sequence" | "stack";

type WorkScrollOptions = {
  onModeChange?: (mode: WorkScrollMode) => void;
  onIndexChange?: (index: number) => void;
};

type FeaturedWorkScrollCleanup = () => void;

function isDesktopViewport() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function setupStackedFade(section: HTMLElement): FeaturedWorkScrollCleanup {
  const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", section);
  const ctx = gsap.context(() => {
    chapters.forEach((chapter) => {
      gsap.set(chapter, { autoAlpha: 0, y: 24 });
      gsap.to(chapter, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: chapter,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });
  }, section);

  ScrollTrigger.refresh();

  return () => ctx.revert();
}

function setupPinnedSequence(
  section: HTMLElement,
  onIndexChange?: (index: number) => void,
): FeaturedWorkScrollCleanup {
  const track = section.querySelector<HTMLElement>("[data-work-track]");
  const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", section);
  const count = chapters.length;

  if (!track || count === 0) {
    return () => {};
  }

  let activeIndex = -1;
  const publishIndex = (index: number) => {
    if (index === activeIndex) return;
    activeIndex = index;
    onIndexChange?.(index);
  };

  let release = () => {};

  const ctx = gsap.context(() => {
    chapters.forEach((chapter, index) => {
      const title = chapter.querySelector<HTMLElement>("[data-chapter-title]");
      const media = chapter.querySelector<HTMLElement>("[data-chapter-media]");
      const fades = gsap.utils.toArray<HTMLElement>("[data-chapter-fade]", chapter);
      const isFirst = index === 0;

      if (title) {
        gsap.set(title, { yPercent: isFirst ? 0 : 110, opacity: isFirst ? 1 : 0 });
      }
      if (media) {
        gsap.set(media, {
          opacity: isFirst ? 1 : 0,
          scale: isFirst ? 1 : 1.06,
          transformOrigin: "center center",
        });
      }
      if (fades.length > 0) {
        gsap.set(fades, { opacity: isFirst ? 1 : 0, y: isFirst ? 0 : 16 });
      }
    });

    const steps = Math.max(count - 1, 1);
    let settled = 0;
    let writing = false;
    let ignoreEcho = false;
    let lastWritten = 0;
    let snapTimer = 0;
    let transition: gsap.core.Timeline | null = null;
    let scrollTween: gsap.core.Tween | null = null;

    const readScroll = () => {
      const lenis = getLenis();
      return lenis ? lenis.scroll : window.scrollY;
    };

    const writeScroll = (value: number) => {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(value, { immediate: true, force: true });
      } else {
        window.scrollTo(0, value);
      }
    };

    const orchestrate = (from: number, to: number) => {
      const forward = to > from;
      const current = chapters[from];
      const next = chapters[to];
      const timeline = gsap.timeline({ data: { from, to } });

      const currentTitle = current?.querySelector("[data-chapter-title]");
      const nextTitle = next?.querySelector("[data-chapter-title]");
      const currentMedia = current?.querySelector("[data-chapter-media]");
      const nextMedia = next?.querySelector("[data-chapter-media]");
      const currentFades = current
        ? gsap.utils.toArray("[data-chapter-fade]", current)
        : [];
      const nextFades = next ? gsap.utils.toArray("[data-chapter-fade]", next) : [];

      if (currentTitle) {
        timeline.to(
          currentTitle,
          {
            ...chapterMotion(0.45),
            yPercent: forward ? -110 : 110,
            opacity: 0,
          },
          0,
        );
      }
      if (nextTitle) {
        timeline.fromTo(
          nextTitle,
          { yPercent: forward ? 110 : -110, opacity: 0 },
          { ...chapterMotion(0.5), yPercent: 0, opacity: 1 },
          0.08,
        );
      }
      if (currentFades.length > 0) {
        timeline.to(
          currentFades,
          { ...chapterMotion(0.35), opacity: 0, y: forward ? -12 : 12 },
          0,
        );
      }
      if (nextFades.length > 0) {
        timeline.fromTo(
          nextFades,
          { opacity: 0, y: forward ? 16 : -16 },
          { ...chapterMotion(0.4), opacity: 1, y: 0 },
          0.1,
        );
      }
      if (currentMedia) {
        timeline.to(
          currentMedia,
          { ...chapterMotion(0.5), opacity: 0, scale: 1.04 },
          0,
        );
      }
      if (nextMedia) {
        timeline.fromTo(
          nextMedia,
          { opacity: 0, scale: 1.06 },
          { ...chapterMotion(0.5), opacity: 1, scale: 1 },
          0,
        );
      }
      return timeline;
    };

    const goTo = (index: number) => {
      if (transition) {
        const { from, to } = transition.data as { from: number; to: number };
        if (index === to || index === from) {
          if (index === from) {
            if (!transition.reversed()) transition.reverse();
          } else if (transition.reversed() || transition.progress() < 1) {
            transition.play();
          }
          settled = index;
          publishIndex(index);
          return;
        }

        transition.progress(transition.reversed() ? 0 : 1);
        transition.kill();
        transition = null;
      }

      if (index === settled) return;

      transition = orchestrate(settled, index);
      settled = index;
      publishIndex(index);
    };

    const easeScrollTo = (trigger: ScrollTrigger, index: number) => {
      const target =
        trigger.start + (trigger.end - trigger.start) * (index / steps);
      const current = readScroll();

      if (Math.abs(target - current) < 2) {
        settling = false;
        releaseStep();
        return;
      }

      if (scrollTween?.isActive()) {
        const origin = Number(scrollTween.data);
        if (Math.abs(target - origin) < 2) {
          scrollTween.reverse();
          return;
        }
      }

      scrollTween?.kill();
      const proxy = { y: current };
      scrollTween = gsap.to(proxy, {
        ...chapterMotion(0.6),
        y: target,
        data: current,
        overwrite: true,
        onStart: () => {
          settling = true;
        },
        onUpdate: () => {
          lastWritten = proxy.y;
          writing = true;
          writeScroll(proxy.y);
          writing = false;
          ignoreEcho = true;
        },
        onComplete: () => {
          settling = false;
          scrollTween = null;
          releaseStep();
        },
        onReverseComplete: () => {
          settling = false;
          scrollTween = null;
          releaseStep();
        },
      });
    };

    let settling = false;
    let stepping = false;
    let wheelIdleTimer = 0;
    let trigger: ScrollTrigger;

    const releaseStep = () => {
      if (settling || wheelIdleTimer) return;
      stepping = false;
    };

    const noteWheel = () => {
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(() => {
        wheelIdleTimer = 0;
        releaseStep();
      }, 180);
    };

    const scheduleSnap = (index: number) => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        if (!trigger?.isActive) return;
        easeScrollTo(trigger, index);
      }, 80);
    };

    const beginStep = (index: number) => {
      if (stepping || index === settled) return;
      stepping = true;
      settling = true;
      goTo(index);
      easeScrollTo(trigger, index);
    };

    const onWheel = (event: WheelEvent) => {
      if (!trigger?.isActive || event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const direction = Math.sign(event.deltaY);
      if (!direction) return;

      noteWheel();

      const leaving =
        (direction < 0 && settled <= 0) ||
        (direction > 0 && settled >= count - 1);
      if (leaving && !stepping) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (stepping) return;

      beginStep(settled + direction);
    };

    const stopSettle = () => {
      if (stepping) return;
      if (!scrollTween && !settling) return;
      scrollTween?.kill();
      scrollTween = null;
      settling = false;
      scheduleSnap(settled);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchmove", stopSettle, { passive: true });

    trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: () =>
        `+=${Math.max(count - 1, 0) * window.innerHeight * CHAPTER_STEP_VH}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (writing || !self.isActive) return;

        if (ignoreEcho) {
          ignoreEcho = false;
          if (Math.abs(readScroll() - lastWritten) <= 24) return;
        }

        if (stepping || (settling && Math.abs(readScroll() - lastWritten) <= 24)) {
          return;
        }

        if (settling) {
          scrollTween?.kill();
          scrollTween = null;
          settling = false;
        }

        const nearest = getChapterIndex(self.progress, count);
        const index = clampChapterStep(settled, nearest, count);
        if (index !== settled) beginStep(index);
        else scheduleSnap(settled);
      },
    });

    publishIndex(0);

    release = () => {
      window.clearTimeout(snapTimer);
      window.clearTimeout(wheelIdleTimer);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchmove", stopSettle);
      scrollTween?.kill();
      transition?.kill();
      trigger.kill();
    };
  }, section);

  ScrollTrigger.refresh();

  return () => {
    release();
    ctx.revert();
  };
}

export function initFeaturedWorkScroll(
  section: HTMLElement,
  options: WorkScrollOptions = {},
): FeaturedWorkScrollCleanup {
  const { onModeChange, onIndexChange } = options;
  const desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);
  const motionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
  let cleanup = () => {};

  const applyMode = () => {
    cleanup();

    if (prefersReducedMotion() || !isDesktopViewport()) {
      section.removeAttribute("data-scroll-sequence");
      onModeChange?.("stack");
      onIndexChange?.(0);
      cleanup = prefersReducedMotion() ? () => {} : setupStackedFade(section);
      return;
    }

    section.setAttribute("data-scroll-sequence", "true");
    onModeChange?.("sequence");
    cleanup = setupPinnedSequence(section, onIndexChange);
  };

  applyMode();

  const handleChange = () => {
    applyMode();
    ScrollTrigger.refresh();
  };

  desktopMedia.addEventListener("change", handleChange);
  motionMedia.addEventListener("change", handleChange);

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("resize", refresh);

  return () => {
    desktopMedia.removeEventListener("change", handleChange);
    motionMedia.removeEventListener("change", handleChange);
    window.removeEventListener("resize", refresh);
    cleanup();
    section.removeAttribute("data-scroll-sequence");
  };
}
