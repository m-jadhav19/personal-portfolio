"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { portfolio } from "@/content/portfolio";

import { ScrambleText } from "./ScrambleText";
import styles from "./About.module.css";

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        stack.querySelectorAll("[data-stack-category]"),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stack,
            start: "top 80%",
            once: true,
          },
        },
      );
    }, stack);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className={styles.about}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowIndex}>(02)</span>
          About
        </p>

        <ScrambleText as="h2" text="About" className={styles.heading} />

        <p className={styles.copy}>{portfolio.aboutCopy}</p>

        <div ref={stackRef} className={styles.stack}>
          <p className={styles.stackLabel}>Currently working with</p>
          <div className={styles.stackGrid}>
            {portfolio.technicalStack.map((category) => (
              <div
                key={category.id}
                className={styles.stackCategory}
                data-stack-category
              >
                <p className={styles.stackCategoryLabel}>{category.label}</p>
                <p className={styles.stackItems}>
                  {category.items.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
