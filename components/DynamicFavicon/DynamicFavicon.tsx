"use client";

import { useEffect } from "react";

import { drawFavicon, FAVICON_SIZE } from "@/lib/favicon/drawFavicon";
import { readFaviconMode, setFaviconFromCanvas } from "@/lib/favicon/setFavicon";
import type { FaviconMode } from "@/lib/favicon/types";

const INTERVAL_MS: Record<FaviconMode, number> = {
  default: 700,
  "broken-ux": 110,
  myspace: 160,
};

export function DynamicFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = FAVICON_SIZE;
    canvas.height = FAVICON_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let mode: FaviconMode = readFaviconMode();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const getInterval = (currentMode: FaviconMode) => {
      if (prefersReducedMotion) return 0;
      return INTERVAL_MS[currentMode];
    };

    let intervalMs = getInterval(mode);
    let intervalId = 0;

    const render = () => {
      frame += 1;
      drawFavicon(ctx, mode, frame);
      setFaviconFromCanvas(canvas);
    };

    const schedule = () => {
      window.clearInterval(intervalId);
      if (intervalMs <= 0) return;
      intervalId = window.setInterval(render, intervalMs);
    };

    const syncMode = () => {
      const nextMode = readFaviconMode();
      if (nextMode === mode && intervalMs > 0) return;
      mode = nextMode;
      intervalMs = getInterval(mode);
      schedule();
      render();
    };

    const observer = new MutationObserver(syncMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-easter-egg"],
    });

    const handleVisibility = () => {
      if (document.hidden) {
        window.clearInterval(intervalId);
      } else {
        schedule();
        render();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    render();
    schedule();

    return () => {
      window.clearInterval(intervalId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
