"use client";

import { useEffect, useRef, useState } from "react";

import { signalIntroComplete } from "@/animations/loader";
import { playLoaderReveal, prefersReducedShapeMotion } from "@/animations/shapeOverlay";
import { resetIntroDocumentState } from "@/lib/introDocument";
import { resetScrollToTop } from "@/lib/lenis";

import {
  getLoaderTiming,
  MIN_LOADER_ASSETS_READY_MS,
  MIN_LOADER_REPEAT_ASSETS_READY_MS,
  MIN_LOADER_REPEAT_VISIBLE_MS,
  MIN_LOADER_VISIBLE_MS,
  nextLoaderCount,
  readLoaderSeen,
  writeLoaderSeen,
} from "./loaderState";
import { loaderCountColor } from "./loaderCountColor";
import {
  formatLoaderMessageLines,
  loaderMessages,
  pickLoaderMessage,
} from "./loaderMessages";
import styles from "./Loader.module.css";

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

export function Loader() {
  return <ProductionLoader />;
}

function lockLoaderScroll() {
  window.scrollTo(0, 0);
  (window as LoaderWindow).__lenis__?.scrollTo(0, {
    immediate: true,
    force: true,
  });
  document.documentElement.classList.add("loader-active");
  document.documentElement.style.setProperty("--loader-scroll-lock-y", "0px");
  (window as LoaderWindow).__lenis__?.stop();
}

function unlockLoaderScroll() {
  document.documentElement.classList.remove("loader-active");
  document.documentElement.style.removeProperty("--loader-scroll-lock-y");
  (window as LoaderWindow).__lenis__?.start();
  resetScrollToTop();
}

function ProductionLoader() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(loaderMessages[0].text);
  const [isExiting, setIsExiting] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const hasCompleted = useRef(false);
  const assetsReadyRef = useRef(false);
  const mountedAtRef = useRef(0);
  const hasSeenLoaderRef = useRef(false);
  const timingRef = useRef(getLoaderTiming(false, false));

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hasSeenLoader = readLoaderSeen();
    const timing = getLoaderTiming(hasSeenLoader, prefersReducedMotion);

    hasSeenLoaderRef.current = hasSeenLoader;
    timingRef.current = timing;
    mountedAtRef.current = Date.now();

    resetIntroDocumentState();
    document.documentElement.classList.add("intro-loading");
    lockLoaderScroll();
    setMessage(pickLoaderMessage(loaderMessages));

    if (prefersReducedMotion) {
      assetsReadyRef.current = true;
      setCount(100);
      return;
    }

    if (hasSeenLoader) {
      setCount(65);
    }

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) {
        assetsReadyRef.current = true;
      }
    };

    const pageReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
          });
    const fontsReady = document.fonts?.ready ?? Promise.resolve();

    void Promise.all([pageReady, fontsReady]).then(markReady);

    const interval = window.setInterval(() => {
      setCount((current) => {
        const increment = hasSeenLoader
          ? 8
          : Math.max(1, Math.ceil(Math.random() * 7));
        return nextLoaderCount(
          current,
          assetsReadyRef.current,
          increment,
        );
      });
    }, timing.intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!hasCompleted.current) {
        document.documentElement.classList.remove("intro-loading");
        unlockLoaderScroll();
      }
    };
  }, []);

  const finish = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    writeLoaderSeen();
    document.documentElement.classList.remove("intro-loading");
    unlockLoaderScroll();
    signalIntroComplete();
    setIsHidden(true);
  };

  useEffect(() => {
    if (count < 100 || isExiting) return;

    const minVisibleMs = hasSeenLoaderRef.current
      ? MIN_LOADER_REPEAT_VISIBLE_MS
      : MIN_LOADER_VISIBLE_MS;
    const assetsReadyCap = hasSeenLoaderRef.current
      ? MIN_LOADER_REPEAT_ASSETS_READY_MS
      : MIN_LOADER_ASSETS_READY_MS;
    const effectiveMinVisibleMs = assetsReadyRef.current
      ? Math.min(minVisibleMs, assetsReadyCap)
      : minVisibleMs;
    const elapsed = Date.now() - mountedAtRef.current;
    const delay = Math.max(
      timingRef.current.exitDelayMs,
      effectiveMinVisibleMs - elapsed,
    );

    const timeout = window.setTimeout(() => {
      setIsExiting(true);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [count, isExiting]);

  useEffect(() => {
    if (!isExiting) return;

    if (timingRef.current.exitDuration === 0 || prefersReducedShapeMotion()) {
      finish();
      return;
    }

    let cancelled = false;
    setIsFading(true);

    void playLoaderReveal().then(() => {
      if (!cancelled) {
        finish();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isExiting]);

  if (isHidden) {
    return null;
  }

  const countColor = loaderCountColor(count);
  const [messageLineOne, messageLineTwo] = formatLoaderMessageLines(message);

  return (
    <div
      ref={loaderRef}
      className={`${styles.loader} ${isFading ? styles.loaderExiting : ""}`}
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
