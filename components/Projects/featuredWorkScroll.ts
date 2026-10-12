import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getLenis, getScrollY, scrollByDelta } from "@/lib/lenis";
import { isPageScrollLocked } from "@/lib/scrollLock";

import {
  canCatchSequenceTouch,
  consumeScrollTick,
  exitGlideDistance,
  isSequenceExit,
  shouldCommitWheel,
  wheelDeltaPixels,
} from "./projectMotion";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MEDIA_QUERY = "(min-width: 901px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TICK_TAIL_MS = 220;

/** Slow departure, matching the chapter ease, so the card stays with the page. */
function glideEase(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

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

function animateShowMore(section: HTMLElement) {
  const showMore = section.querySelector<HTMLElement>("[data-show-more]");
  if (!showMore || prefersReducedMotion()) return () => {};

  gsap.set(showMore, { autoAlpha: 0, y: 8 });

  const entrance = gsap.to(showMore, {
    autoAlpha: 1,
    y: 0,
    duration: 0.65,
    ease: "power3.out",
    easeReverse: "power3.in",
    paused: true,
    overwrite: "auto",
  });

  const reveal = ScrollTrigger.create({
    trigger: showMore,
    start: "top 88%",
    end: "bottom top",
    onToggle: (self) => {
      if (self.isActive) {
        entrance.play();
        return;
      }

      if (self.direction < 0) entrance.reverse();
      },
    });

  if (reveal.isActive) entrance.progress(1);

  return () => {
    reveal.kill();
    entrance.kill();
  };
}

function setupStackedFade(section: HTMLElement): FeaturedWorkScrollCleanup {
  const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", section);
  let releaseShowMore = () => {};
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
    releaseShowMore = animateShowMore(section);
  }, section);

  ScrollTrigger.refresh();

  return () => {
    releaseShowMore();
    ctx.revert();
  };
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
  let releaseShowMore = () => {};

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

    let settled = 0;
    // Direction of the tick in progress. The small reversal at the end of a
    // trackpad flick must not step back to the chapter just left.
    let gestureDir = 0;
    let transition: gsap.core.Timeline | null = null;
    let finishStep = () => {};

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
            else finishStep();
          } else if (transition.reversed() || transition.progress() < 1) {
            transition.play();
          } else {
            finishStep();
          }
          settled = index;
          publishIndex(index);
          return;
        }

        transition.progress(transition.reversed() ? 0 : 1);
        transition.kill();
        transition = null;
      }

      if (index === settled) {
        finishStep();
        return;
      }

      transition = orchestrate(settled, index);
      transition.eventCallback("onComplete", finishStep);
      transition.eventCallback("onReverseComplete", finishStep);
      settled = index;
      publishIndex(index);
    };

    let stepping = false;
    let wheelIdleTimer = 0;
    let pending = 0;
    let engaged = false;
    let suppressEngage = false;
    let stoppedLenis = false;
    let writing = false;
    let touchStartY = 0;
    let touchTicked = false;
    let touchTracking = false;
    let gliding = false;
    let glideTimer = 0;
    let pin: ScrollTrigger;
    let watch: ScrollTrigger;

    finishStep = () => {
      stepping = false;
      if (!wheelIdleTimer) gestureDir = 0;
    };

    const noteTick = (direction: number) => {
      gestureDir = direction;
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(() => {
        wheelIdleTimer = 0;
        if (!stepping) gestureDir = 0;
      }, TICK_TAIL_MS);
    };

    const holdLenis = () => {
      const lenis = getLenis();
      if (!lenis || lenis.isStopped) return;
      lenis.stop();
      stoppedLenis = true;
    };

    const freeLenis = () => {
      if (!stoppedLenis) return;
      stoppedLenis = false;
      if (!isPageScrollLocked()) getLenis()?.start();
    };

    const writeScroll = (value: number) => {
      const delta = value - getScrollY();
      if (Math.abs(delta) < 0.5) return;
      writing = true;
      scrollByDelta(delta);
      ScrollTrigger.update();
      writing = false;
    };

    const showInstant = (index: number) => {
      transition?.progress(1);
      transition?.kill();
      transition = null;
      chapters.forEach((chapter, chapterIndex) => {
        const visible = chapterIndex === index;
        const title = chapter.querySelector<HTMLElement>("[data-chapter-title]");
        const media = chapter.querySelector<HTMLElement>("[data-chapter-media]");
        const fades = gsap.utils.toArray<HTMLElement>("[data-chapter-fade]", chapter);
        if (title) gsap.set(title, { yPercent: visible ? 0 : 110, opacity: visible ? 1 : 0 });
        if (media) gsap.set(media, { opacity: visible ? 1 : 0, scale: visible ? 1 : 1.06 });
        if (fades.length > 0) gsap.set(fades, { opacity: visible ? 1 : 0, y: visible ? 0 : 16 });
      });
      settled = index;
      stepping = false;
      publishIndex(index);
    };

    const park = () => {
      if (!engaged) return;
      holdLenis();
      writeScroll(pin.start);
    };

    const holdTouch = (held: boolean) => {
      if (held) track.dataset.touchHold = "";
      else delete track.dataset.touchHold;
    };

    const engage = (fromBelow: boolean) => {
      engaged = true;
      suppressEngage = false;
      pending = 0;
      holdTouch(true);
      showInstant(fromBelow ? count - 1 : 0);
      park();
    };

    const armEngage = (top: number) => {
      if (!suppressEngage) return true;
      if (top > 160 || top < -200) suppressEngage = false;
      return !suppressEngage;
    };

    const finishGlide = () => {
      gliding = false;
      window.clearTimeout(glideTimer);
      glideTimer = 0;
    };

    const releaseSequence = (direction: number) => {
      if (gliding) return;
      engaged = false;
      suppressEngage = true;
      holdTouch(false);
      pending = 0;
      gestureDir = 0;
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = 0;
      freeLenis();

      const following =
        direction > 0
          ? (section.querySelector<HTMLElement>("[data-show-more]")?.offsetHeight ?? 0)
          : 0;
      const distance = exitGlideDistance(window.innerHeight, following) * direction;
      const lenis = getLenis();
      gliding = true;

      if (!lenis) {
        scrollByDelta(distance);
        ScrollTrigger.update();
        finishGlide();
        return;
      }

      lenis.scrollTo(getScrollY() + distance, {
        duration: 1.05,
        easing: glideEase,
        force: true,
        lock: true,
        onComplete: finishGlide,
      });
      glideTimer = window.setTimeout(finishGlide, 1400);
    };

    const beginStep = (direction: number) => {
      const index = settled + direction;
      if (stepping || index < 0 || index >= count || index === settled) return;
      stepping = true;
      pending = 0;
      goTo(index);
    };

    const takeTick = (direction: number) => {
      if (!direction) return;
      if (isSequenceExit(settled, direction, count) && !stepping) {
        releaseSequence(direction);
        return;
      }
      if (!shouldCommitWheel(gestureDir, direction) || stepping) return;
      noteTick(direction);
      beginStep(direction);
    };

    const onWheel = (event: WheelEvent) => {
      if (gliding) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const pixels = wheelDeltaPixels(event.deltaY, event.deltaMode, window.innerHeight);
      const direction = Math.sign(pixels);
      if (!direction) return;

      if (!engaged) {
        const top = track.getBoundingClientRect().top;
        if (!armEngage(top)) return;
        // A fraction of a pixel past the pin still belongs to the card.
        // Missing it lets the page fling the card off the viewport.
        const approaching =
          (direction > 0 && top <= 140 && top >= -2) ||
          (direction < 0 && top >= -140 && top <= 40);
        if (!approaching) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        engage(direction < 0);
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      if (!shouldCommitWheel(gestureDir, direction) || stepping) return;

      const tick = consumeScrollTick(pending, pixels);
      pending = tick.pending;
      if (!tick.direction) return;
      takeTick(tick.direction);
    };

    const onKey = (event: KeyboardEvent) => {
      if (!engaged) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
          return;
        }
      }
      const direction =
        event.key === "ArrowDown" || event.key === "PageDown"
          ? 1
          : event.key === "ArrowUp" || event.key === "PageUp"
            ? -1
            : 0;
      if (!direction) return;
      event.preventDefault();
      takeTick(direction);
    };

    const touchOnControl = (event: TouchEvent) => {
      const target = event.target;
      return (
        target instanceof Element &&
        Boolean(target.closest("a, button, input, textarea, select"))
      );
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || touchOnControl(event)) {
        touchTracking = false;
        return;
      }

      const top = track.getBoundingClientRect().top;
      if (!engaged && !canCatchSequenceTouch(top)) {
        touchTracking = false;
        return;
      }

      touchStartY = event.touches[0].clientY;
      touchTicked = false;
      touchTracking = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (gliding) {
        event.preventDefault();
        return;
      }
      if (!touchTracking || event.touches.length !== 1) return;

      const delta = touchStartY - event.touches[0].clientY;
      if (Math.abs(delta) < 36) {
        if (engaged) event.preventDefault();
        return;
      }

      if (touchTicked) {
        if (engaged) event.preventDefault();
        return;
      }

      const top = track.getBoundingClientRect().top;
      if (!engaged) {
        if (!armEngage(top) || !canCatchSequenceTouch(top)) return;
        event.preventDefault();
        engage(delta < 0);
        touchTicked = true;
        return;
      }

      event.preventDefault();
      touchTicked = true;
      takeTick(Math.sign(delta));
    };

    const onTouchEnd = () => {
      touchTracking = false;
      touchTicked = false;
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    pin = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "+=8",
      pin: true,
      pinType: "transform",
      anticipatePin: 0,
      invalidateOnRefresh: true,
    });

    watch = ScrollTrigger.create({
      trigger: track,
          start: "top bottom",
          end: "bottom top",
      onUpdate: (self) => {
        if (writing || gliding) return;
        if (engaged) {
          park();
          return;
        }
        const top = track.getBoundingClientRect().top;
        if (!armEngage(top)) return;
        if (self.direction > 0 && top < 72 && top >= -2) engage(false);
        if (self.direction < 0 && top <= 40 && top > -96) engage(true);
        },
      });

    releaseShowMore = animateShowMore(section);

    publishIndex(0);

    release = () => {
      finishGlide();
      window.clearTimeout(wheelIdleTimer);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      holdTouch(false);
      freeLenis();
      transition?.kill();
      pin.kill();
      watch.kill();
    };
  }, section);

  ScrollTrigger.refresh();

  return () => {
    releaseShowMore();
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
