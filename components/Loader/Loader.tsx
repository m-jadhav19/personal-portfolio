"use client";

import { useEffect, useRef, useState } from "react";

import { gsap } from "gsap";

import { signalIntroComplete } from "@/animations/loader";
import { EASE_CSS } from "@/lib/motion";

import styles from "./Loader.module.css";

export function Loader() {
  const [count, setCount] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const hasCompleted = useRef(false);

  useEffect(() => {
    document.documentElement.classList.add("intro-loading");

    const interval = window.setInterval(() => {
      setCount((current) => {
        const next = Math.min(100, current + Math.ceil(Math.random() * 12));
        return next;
      });
    }, 90);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count < 100 || hasCompleted.current) return;

    hasCompleted.current = true;
    const loader = loaderRef.current;

    const finish = () => {
      signalIntroComplete();
    };

    if (!loader) {
      finish();
      return;
    }

    const timeout = window.setTimeout(() => {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.8,
        ease: EASE_CSS,
        onComplete: finish,
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [count]);

  return (
    <div ref={loaderRef} className={styles.loader} aria-hidden={count >= 100}>
      <span className={styles.count}>{count}</span>
    </div>
  );
}
