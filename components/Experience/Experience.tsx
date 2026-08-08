"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ScrambleText } from "@/components/About/ScrambleText";
import { portfolio } from "@/content/portfolio";

import styles from "./Experience.module.css";

gsap.registerPlugin(ScrollTrigger);

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const [current, ...previous] = portfolio.experiences;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll("[data-experience-row]"),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            once: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className={styles.experience}>
      <p className={styles.label}>
        <ScrambleText as="span" text="(Experience)" />
      </p>

      {current ? (
        <article className={styles.current} data-experience-row>
          <p className={styles.dates}>{current.dates}</p>
          <h3 className={styles.company}>
            {current.company ?? "Current role"}
          </h3>
          <p className={styles.position}>{current.position}</p>
          {current.summary ? (
            <p className={styles.summary}>{current.summary}</p>
          ) : null}
          {current.bullets.length > 0 ? (
            <ul className={styles.bullets}>
              {current.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {current.stack && current.stack.length > 0 ? (
            <p className={styles.stack}>{current.stack.join(" · ")}</p>
          ) : null}
        </article>
      ) : null}

      {previous.length > 0 ? (
        <div className={styles.previously}>
          <p className={styles.previouslyLabel}>Previously</p>
          {previous.map((job) => (
            <article
              key={job.id}
              className={styles.previousRow}
              data-experience-row
            >
              <p className={styles.dates}>{job.dates}</p>
              <div>
                {job.company ? (
                  <p className={styles.previousCompany}>{job.company}</p>
                ) : null}
                <h3 className={styles.previousTitle}>{job.position}</h3>
                {job.summary ? (
                  <p className={styles.summary}>{job.summary}</p>
                ) : null}
                {job.bullets.length > 0 ? (
                  <ul className={styles.bullets}>
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {job.stack && job.stack.length > 0 ? (
                  <p className={styles.stack}>{job.stack.join(" · ")}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
