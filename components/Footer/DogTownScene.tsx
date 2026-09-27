"use client";

import { useEffect, useRef, useState } from "react";

import { bindIdleAwareTicker } from "@/lib/animationPerf";

import { DogTownEngine } from "./dogTown/engine";
import { resetDogTownState, setDogTownState } from "./dogTown/store";
import styles from "./DogTownScene.module.css";

type DogTownSceneProps = {
  dogName: string;
  timezone: string;
};

const JUMP_KEYS = new Set(["Space", "ArrowUp"]);
const IGNORED_TARGETS =
  "a, button, input, textarea, select, summary, [contenteditable]";

function isNightIn(timezone: string) {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hourCycle: "h23",
        timeZone: timezone,
      }).format(new Date()),
    );
    return hour >= 19 || hour < 6;
  } catch {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 6;
  }
}

/**
 * Chrome-offline-dino style backdrop for the footer: a pixel dog trots through
 * a parallax town on its own, auto-jumping obstacles and grabbing bones.
 * Tap/click the footer or press Space to make it bark and jump early.
 *
 * Renders as a fragment: the canvas is absolutely positioned against the
 * footer stage (its parent), while the band reserves in-flow room for the town.
 */
export function DogTownScene({ dogName, timezone }: DogTownSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const [interacted, setInteracted] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const band = bandRef.current;
    const stage = canvas?.parentElement;
    if (!canvas || !band || !stage) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setIsLive(!reducedMotion);
    setDogTownState({ live: !reducedMotion });

    const engine = new DogTownEngine(canvas, {
      onHud: setDogTownState,
      reducedMotion,
      isNight: () => isNightIn(timezone),
    });

    const readPalette = () => {
      const computed = getComputedStyle(stage);
      const ink =
        computed.getPropertyValue("--footer-foreground").trim() || "#0e1111";
      const paper =
        computed.getPropertyValue("--footer-muted").trim() || "#f5f4f0";
      engine.setPalette({ ink, paper, collar: paper });
    };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      engine.resize(
        Math.round(rect.width),
        Math.round(rect.height),
        window.devicePixelRatio || 1,
      );
    };

    readPalette();
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const paletteObserver = new MutationObserver(readPalette);
    paletteObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode", "data-easter-egg"],
    });

    let lastFrame = performance.now();
    const stopTicker = reducedMotion
      ? () => {}
      : bindIdleAwareTicker(
          stage,
          () => {
            const now = performance.now();
            engine.tick((now - lastFrame) / 1000);
            lastFrame = now;
          },
          { rootMargin: "0px" },
        );

    const nightTimer = window.setInterval(() => engine.syncNight(), 60_000);

    let bandInView = false;
    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        bandInView = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.6 },
    );
    viewObserver.observe(band);

    const poke = () => {
      if (engine.poke()) setInteracted(true);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(IGNORED_TARGETS)) return;
      poke();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!bandInView || event.repeat || !JUMP_KEYS.has(event.code)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        target !== document.body &&
        target.closest(IGNORED_TARGETS)
      ) {
        return;
      }
      event.preventDefault();
      poke();
    };

    stage.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      stopTicker();
      window.clearInterval(nightTimer);
      resizeObserver.disconnect();
      paletteObserver.disconnect();
      viewObserver.disconnect();
      stage.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      engine.destroy();
      resetDogTownState();
    };
  }, [timezone]);

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div ref={bandRef} className={styles.band}>
        {isLive && (
          <p
            className={`${styles.hint} ${interacted ? styles.hintHidden : ""}`}
            aria-hidden={interacted}
          >
            Tap anywhere or press space — {dogName} jumps
          </p>
        )}
      </div>
    </>
  );
}
