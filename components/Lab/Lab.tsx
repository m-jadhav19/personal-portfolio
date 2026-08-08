"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { portfolio } from "@/content/portfolio";

import styles from "./Lab.module.css";

gsap.registerPlugin(ScrollTrigger);

export function Lab() {
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
        section.querySelectorAll("[data-lab-reveal]"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="lab" ref={sectionRef} className={styles.lab}>
      <div className={styles.header}>
        <p className={styles.label}>(Lab)</p>
        <h2 className={styles.heading}>Experiments</h2>
        <p className={styles.lede}>
          Polished work lives above. This is where the unfinished, glitchy, and
          generative ideas stay alive.
        </p>
      </div>

      <div className={styles.exploring}>
        <p className={styles.exploringLabel} data-lab-reveal>
          Currently exploring
        </p>
        <ul className={styles.exploringList}>
          {portfolio.exploring.map((item, index) => (
            <li
              key={item}
              className={styles.exploringItem}
              data-lab-reveal
              data-cursor="lab"
            >
              <span className={styles.exploringIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.experiments}>
        {portfolio.experiments.map((experiment, index) => {
          const content = (
            <>
              <p className={styles.experimentIndex}>
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className={styles.experimentBody}>
                <h3 className={styles.experimentTitle}>{experiment.title}</h3>
                <p className={styles.experimentStack}>
                  {experiment.stack.join(" / ")}
                </p>
                <p className={styles.experimentBlurb}>{experiment.blurb}</p>
              </div>
              {experiment.status ? (
                <p className={styles.experimentStatus}>{experiment.status}</p>
              ) : null}
            </>
          );

          if (experiment.url) {
            return (
              <a
                key={experiment.id}
                href={experiment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.experiment}
                data-lab-reveal
                data-cursor="lab"
              >
                {content}
              </a>
            );
          }

          return (
            <article
              key={experiment.id}
              className={styles.experiment}
              data-lab-reveal
              data-cursor="lab"
            >
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
