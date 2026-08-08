"use client";

import { useEffect, useRef, useState } from "react";

import {
  playLoaderReveal,
  prefersReducedShapeMotion,
  setOverlayTheme,
} from "@/animations/shapeOverlay";
import { resetScrollToTop } from "@/lib/lenis";

import {
  formatLoaderMessageLines,
} from "./loaderMessages";
import {
  loaderCountColor,
  viceCityLoaderCountColor,
} from "./loaderCountColor";
import { nextLoaderCount } from "./loaderState";
import {
  pickThemeLoaderMessage,
  type ThemeTransitionDirection,
} from "./themeLoaderMessages";
import styles from "./Loader.module.css";

const MIN_VISIBLE_MS = 700;
const INTERVAL_MS = 40;

type ThemeTransitionLoaderProps = {
  direction: ThemeTransitionDirection;
  onMidpoint: () => void | Promise<void>;
  onComplete: () => void;
};

type LoaderWindow = Window & {
  __lenis__?: {
    start: () => void;
    stop: () => void;
    scrollTo: (
      target: number,
      options?: { immediate?: boolean; force?: boolean },
    ) => void;
  };
};

function lockScroll() {
  window.scrollTo(0, 0);
  (window as LoaderWindow).__lenis__?.scrollTo(0, {
    immediate: true,
    force: true,
  });
  document.documentElement.classList.add("loader-active");
  document.documentElement.style.setProperty("--loader-scroll-lock-y", "0px");
  (window as LoaderWindow).__lenis__?.stop();
}

function unlockScroll() {
  document.documentElement.classList.remove("loader-active");
  document.documentElement.style.removeProperty("--loader-scroll-lock-y");
  (window as LoaderWindow).__lenis__?.start();
  resetScrollToTop();
}

export function ThemeTransitionLoader({
  direction,
  onMidpoint,
  onComplete,
}: ThemeTransitionLoaderProps) {
  const isVice = direction === "enter-myspace";
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(() => pickThemeLoaderMessage(direction));
  const [isExiting, setIsExiting] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const mountedAtRef = useRef(Date.now());
  const midpointHandledRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    lockScroll();
    setOverlayTheme(isVice ? "myspace" : "loader");

    const prefersReducedMotion = prefersReducedShapeMotion();

    if (prefersReducedMotion) {
      void Promise.resolve(onMidpoint()).then(() => {
        completedRef.current = true;
        onComplete();
        unlockScroll();
      });
      return () => {
        if (!completedRef.current) {
          unlockScroll();
        }
      };
    }

    const interval = window.setInterval(() => {
      setCount((current) => nextLoaderCount(current, true, 9));
    }, INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      if (!completedRef.current) {
        unlockScroll();
      }
    };
  }, [isVice, onComplete, onMidpoint]);

  useEffect(() => {
    if (count < 100 || isExiting) return;

    const elapsed = Date.now() - mountedAtRef.current;
    const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);

    const timeout = window.setTimeout(() => {
      setIsExiting(true);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [count, isExiting]);

  useEffect(() => {
    if (!isExiting || midpointHandledRef.current) return;
    midpointHandledRef.current = true;

    if (prefersReducedShapeMotion()) {
      void Promise.resolve(onMidpoint()).then(() => {
        completedRef.current = true;
        unlockScroll();
        onComplete();
      });
      return;
    }

    let cancelled = false;
    setIsFading(true);

    void (async () => {
      await onMidpoint();
      if (cancelled) return;
      setOverlayTheme(direction === "enter-myspace" ? "myspace" : "loader");
      await playLoaderReveal();
      if (cancelled) return;
      completedRef.current = true;
      unlockScroll();
      onComplete();
    })();

    return () => {
      cancelled = true;
    };
  }, [direction, isExiting, onComplete, onMidpoint]);

  const countColor = isVice ? viceCityLoaderCountColor(count) : loaderCountColor(count);
  const [messageLineOne, messageLineTwo] = formatLoaderMessageLines(message);

  return (
    <div
      className={`${styles.loader} ${styles.loaderThemeTransition} ${isVice ? styles.loaderVice : ""} ${isFading ? styles.loaderExiting : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${count}%`}
    >
      <div className={styles.copy}>
        <p className={styles.message}>
          <span className={styles.messageLine}>{messageLineOne}</span>
          <span className={styles.messageLine}>{messageLineTwo}</span>
        </p>
        <div className={styles.countClip}>
          <p
            className={styles.count}
            style={{
              color: countColor,
              WebkitTextFillColor: countColor,
            }}
          >
            {count}%
          </p>
        </div>
      </div>
    </div>
  );
}
