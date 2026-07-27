"use client";

import { useEffect, useRef, useState } from "react";

import { gsap } from "gsap";

import { HERO_COMPLETE_EVENT } from "@/animations/hero";
import { portfolio } from "@/content/portfolio";
import { DURATION, EASE_CSS } from "@/lib/motion";

import styles from "./HeroMeta.module.css";

function formatLocalTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function HeroMeta() {
  const [time, setTime] = useState("");
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setTime(formatLocalTime(new Date()));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const meta = metaRef.current;
    if (!meta) return;

    const reveal = () => {
      gsap.fromTo(
        meta,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: DURATION.fast, ease: EASE_CSS },
      );
    };

    if (document.documentElement.dataset.hero === "complete") {
      reveal();
      return;
    }

    window.addEventListener(HERO_COMPLETE_EVENT, reveal, { once: true });
    return () => window.removeEventListener(HERO_COMPLETE_EVENT, reveal);
  }, []);

  return (
    <div ref={metaRef} className={styles.meta} data-intro="meta-item">
      <span className={styles.location}>
        Based in {portfolio.hero.location}
        {time ? (
          <>
            {" "}
            <span aria-hidden="true">•</span> {time}
          </>
        ) : null}
      </span>

      {portfolio.hero.availability ? (
        <span className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true" />
          Open to work
        </span>
      ) : null}
    </div>
  );
}
