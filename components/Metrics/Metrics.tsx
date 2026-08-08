"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { portfolio } from "@/content/portfolio";

import styles from "./Metrics.module.css";

gsap.registerPlugin(ScrollTrigger);

export function Metrics() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll("[data-metric]"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.metrics}
      aria-label="At a glance"
    >
      <div className={styles.grid}>
        {portfolio.metrics.map((metric) => (
          <div
            key={`${metric.value}-${metric.label}`}
            className={styles.item}
            data-metric
          >
            <p className={styles.value}>{metric.value}</p>
            <p className={styles.label}>{metric.label}</p>
            {metric.sublabel ? (
              <p className={styles.sublabel}>{metric.sublabel}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
