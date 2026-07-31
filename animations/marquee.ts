import { gsap } from "gsap";

import { subscribeLenisScroll } from "@/hooks/useLenis";

const MARQUEE_DURATION = 24;
const PARALLAX_STRENGTH = 0.08;
const BASE_TIME_SCALE = 1;
const MAX_TIME_SCALE = 3;
const VELOCITY_INFLUENCE = 0.02;
const TIME_SCALE_LERP = 0.12;
const IDLE_THRESHOLD = 0.25;

function getTracks(rows: HTMLElement[]) {
  return rows
    .map((row) => row.querySelector<HTMLElement>("[data-marquee-track]"))
    .filter((track): track is HTMLElement => track !== null);
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type MarqueeTween = {
  tween: gsap.core.Tween;
  pause: () => void;
  resume: () => void;
};

function createTrackTween(track: HTMLElement, index: number) {
  const isReverse = index % 2 === 1;

  const tween = gsap.fromTo(
    track,
    { xPercent: isReverse ? -50 : 0 },
    {
      xPercent: isReverse ? 0 : -50,
      duration: MARQUEE_DURATION,
      ease: "none",
      repeat: -1,
    },
  );

  return {
    tween,
    pause: () => {
      tween.pause();
    },
    resume: () => {
      tween.resume();
    },
  };
}

export function bindMarqueeParallax(rows: HTMLElement[]) {
  if (!rows.length || prefersReducedMotion()) {
    return () => undefined;
  }

  const hero = document.getElementById("hero");
  const tracks = getTracks(rows);
  const marqueeTweens: MarqueeTween[] = [];
  const hoverHandlers: Array<{
    row: HTMLElement;
    pause: () => void;
    resume: () => void;
  }> = [];

  let lastScrollY = -1;
  let targetTimeScale = BASE_TIME_SCALE;
  let smoothedTimeScale = BASE_TIME_SCALE;
  let isActive = true;

  const applyTimeScale = (scale: number) => {
    marqueeTweens.forEach(({ tween }) => {
      tween.timeScale(scale);
    });
  };

  const onTick = () => {
    if (!isActive) return;

    smoothedTimeScale += (targetTimeScale - smoothedTimeScale) * TIME_SCALE_LERP;

    if (
      Math.abs(smoothedTimeScale - targetTimeScale) < 0.008 &&
      Math.abs(targetTimeScale - BASE_TIME_SCALE) < 0.008
    ) {
      smoothedTimeScale = BASE_TIME_SCALE;
      targetTimeScale = BASE_TIME_SCALE;
    }

    applyTimeScale(smoothedTimeScale);
  };

  const clearHoverHandlers = () => {
    hoverHandlers.forEach(({ row, pause, resume }) => {
      row.removeEventListener("mouseenter", pause);
      row.removeEventListener("mouseleave", resume);
    });
    hoverHandlers.length = 0;
  };

  const setupTweens = () => {
    marqueeTweens.forEach(({ tween }) => tween.kill());
    marqueeTweens.length = 0;
    clearHoverHandlers();

    tracks.forEach((track, index) => {
      const marqueeTween = createTrackTween(track, index);
      marqueeTweens.push(marqueeTween);

      const row = rows[index];
      if (!row) return;

      const { pause, resume } = marqueeTween;
      row.addEventListener("mouseenter", pause);
      row.addEventListener("mouseleave", resume);
      hoverHandlers.push({ row, pause, resume });
    });

    applyTimeScale(smoothedTimeScale);
  };

  const apply = (scrollY: number) => {
    if (lastScrollY < 0) {
      lastScrollY = scrollY;
    }

    const delta = scrollY - lastScrollY;
    lastScrollY = scrollY;

    if (Math.abs(delta) < IDLE_THRESHOLD) {
      targetTimeScale = BASE_TIME_SCALE;
    } else {
      const boost = Math.min(
        Math.abs(delta) * VELOCITY_INFLUENCE,
        MAX_TIME_SCALE - BASE_TIME_SCALE,
      );
      const magnitude = BASE_TIME_SCALE + boost;
      targetTimeScale = delta > 0 ? magnitude : -magnitude;
    }

    const parallaxScroll = hero
      ? Math.min(Math.max(scrollY, 0), hero.offsetHeight)
      : scrollY;

    rows.forEach((row, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      row.style.translate = `0 ${direction * parallaxScroll * PARALLAX_STRENGTH}px`;
    });
  };

  setupTweens();
  gsap.ticker.add(onTick);
  window.addEventListener("resize", setupTweens);
  const unsubscribe = subscribeLenisScroll(apply);

  return () => {
    isActive = false;
    gsap.ticker.remove(onTick);
    window.removeEventListener("resize", setupTweens);
    unsubscribe();
    clearHoverHandlers();
    marqueeTweens.forEach(({ tween }) => tween.kill());
    gsap.set(tracks, { clearProps: "transform" });
    rows.forEach((row) => {
      row.style.translate = "";
    });
  };
}
