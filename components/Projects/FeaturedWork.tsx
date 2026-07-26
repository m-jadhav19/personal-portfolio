"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ScrambleText } from "@/components/About/ScrambleText";
import { portfolio } from "@/content/portfolio";

import { ProjectSlide } from "./ProjectSlide";
import { selectFeaturedProjects } from "./projectMotion";
import styles from "./FeaturedWork.module.css";

gsap.registerPlugin(ScrollTrigger);

export function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const projects = selectFeaturedProjects(portfolio.projects);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 901px)").matches;

    if (prefersReducedMotion || !isDesktop) return;

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-project-row]");

      rows.forEach((row) => {
        const media = row.querySelector<HTMLElement>("[data-project-media]");
        const info = row.querySelector<HTMLElement>("[data-project-info]");
        if (!media || !info) return;

        gsap.fromTo(
          media,
          { y: 36 },
          {
            y: -36,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        gsap.fromTo(
          info,
          { y: -20 },
          {
            y: 20,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, section);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section id="projects" ref={sectionRef} className={styles.featuredWork}>
      <div className={styles.heading}>
        <ScrambleText
          as="h2"
          text="Featured Work"
          className={styles.headingTitle}
        />
        <span className={styles.headingCue}>
          Scroll to explore more
        </span>
      </div>

      <div className={styles.projects}>
        {projects.map((project, index) => (
          <ProjectSlide key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
