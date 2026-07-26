"use client";

import { useEffect, useRef, useState } from "react";

import { signalIntroComplete } from "@/animations/loader";
import { playReveal, prefersReducedShapeMotion } from "@/animations/shapeOverlay";
import { resetIntroDocumentState } from "@/lib/introDocument";

import { DevLoaderBypass } from "./DevLoaderBypass";
import {
  getLoaderTiming,
  nextLoaderCount,
  readLoaderSeen,
  writeLoaderSeen,
} from "./loaderState";
import { loaderMessages, pickLoaderMessage } from "./loaderMessages";
import styles from "./Loader.module.css";

type LoaderWindow = Window & {
  __lenis__?: {
    start: () => void;
    stop: () => void;
  };
};

export function Loader() {
  if (process.env.NODE_ENV === "development") {
    return <DevLoaderBypass />;
  }

  return <ProductionLoader />;
}

function ProductionLoader() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(loaderMessages[0].text);
  const [isExiting, setIsExiting] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const hasCompleted = useRef(false);
  const assetsReadyRef = useRef(false);
  const timingRef = useRef(getLoaderTiming(false, false));

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hasSeenLoader = readLoaderSeen();
    const timing = getLoaderTiming(hasSeenLoader, prefersReducedMotion);
    timingRef.current = timing;

    resetIntroDocumentState();
    document.documentElement.classList.add("intro-loading");
    document.documentElement.classList.add("loader-active");
    (window as LoaderWindow).__lenis__?.stop();
    setMessage(pickLoaderMessage(loaderMessages));

    if (prefersReducedMotion) {
      assetsReadyRef.current = true;
      setCount(100);
      return () => {
        if (!hasCompleted.current) {
          document.documentElement.classList.remove("loader-active", "intro-loading");
          (window as LoaderWindow).__lenis__?.start();
        }
      };
    }

    if (hasSeenLoader) {
      setCount(88);
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
          ? 12
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

      if (!hasCompleted.current) {
        document.documentElement.classList.remove("loader-active", "intro-loading");
        (window as LoaderWindow).__lenis__?.start();
      }
    };
  }, []);

  const finish = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    writeLoaderSeen();
    document.documentElement.classList.remove("loader-active");
    (window as LoaderWindow).__lenis__?.start();
    signalIntroComplete();
  };

  useEffect(() => {
    if (count < 100 || isExiting) return;

    const timeout = window.setTimeout(() => {
      setIsExiting(true);
    }, timingRef.current.exitDelayMs);

    return () => window.clearTimeout(timeout);
  }, [count, isExiting]);

  useEffect(() => {
    if (!isExiting) return;

    if (timingRef.current.exitDuration === 0 || prefersReducedShapeMotion()) {
      finish();
      return;
    }

    let cancelled = false;

    void playReveal().then(() => {
      if (!cancelled) {
        finish();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isExiting]);

  return (
    <div
      ref={loaderRef}
      className={`${styles.loader} ${isExiting ? styles.loaderExiting : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${count}%`}
    >
      <div className={styles.copy}>
        <p className={styles.message}>{message}</p>
        <p className={styles.count}>{count}%</p>
      </div>
    </div>
  );
}
