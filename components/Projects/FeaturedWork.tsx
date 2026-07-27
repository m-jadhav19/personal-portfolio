"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  isBarOverlayAnimating,
  playBarCover,
  playBarReveal,
  prefersReducedBarMotion,
} from "@/animations/barOverlay";
import { ScrambleText } from "@/components/About/ScrambleText";
import { portfolio } from "@/content/portfolio";
import {
  lockPageScroll,
  resetPageScrollLock,
  unlockPageScroll,
} from "@/lib/scrollLock";

import { AllProjectsCatalog } from "./AllProjectsCatalog";
import { ProjectSlide } from "./ProjectSlide";
import { selectFeaturedProjects } from "./projectMotion";
import styles from "./FeaturedWork.module.css";

gsap.registerPlugin(ScrollTrigger);

export function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const allProjects = portfolio.projects;
  const projects = selectFeaturedProjects(allProjects);
  const hasMoreProjects = allProjects.length > projects.length;

  const [isCatalogMounted, setIsCatalogMounted] = useState(false);
  const [isCatalogReady, setIsCatalogReady] = useState(false);
  const isTransitioningRef = useRef(false);

  const openCatalog = useCallback(async () => {
    if (isTransitioningRef.current || isBarOverlayAnimating()) return;

    isTransitioningRef.current = true;
    setIsCatalogMounted(true);
    setIsCatalogReady(false);
    lockPageScroll();

    try {
      if (prefersReducedBarMotion()) {
        setIsCatalogReady(true);
        return;
      }

      await playBarCover();
      setIsCatalogReady(true);
      await playBarReveal();
    } catch {
      setIsCatalogMounted(false);
      setIsCatalogReady(false);
      unlockPageScroll();
    } finally {
      isTransitioningRef.current = false;
    }
  }, []);

  const closeCatalog = useCallback(async () => {
    if (isTransitioningRef.current || isBarOverlayAnimating()) return;

    isTransitioningRef.current = true;
    setIsCatalogReady(false);

    try {
      if (prefersReducedBarMotion()) {
        setIsCatalogMounted(false);
        unlockPageScroll();
        return;
      }

      await playBarCover();
      setIsCatalogMounted(false);
      unlockPageScroll();
      await playBarReveal();
    } catch {
      setIsCatalogMounted(false);
      unlockPageScroll();
    } finally {
      isTransitioningRef.current = false;
    }
  }, []);

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

  useEffect(() => {
    return () => {
      resetPageScrollLock();
    };
  }, []);

  return (
    <>
      <section id="projects" ref={sectionRef} className={styles.featuredWork}>
        <div className={styles.heading}>
          <ScrambleText
            as="h2"
            text="Featured Work"
            className={styles.headingTitle}
          />
          <span className={styles.headingCue}>Scroll to explore more</span>
        </div>

        <div className={styles.projects}>
          {projects.map((project, index) => (
            <ProjectSlide key={project.id} project={project} index={index} />
          ))}
        </div>

        {hasMoreProjects ? (
          <div className={styles.showMoreWrap}>
            <button
              type="button"
              className={styles.showMoreBtn}
              onClick={() => void openCatalog()}
              data-cursor="interactive"
            >
              <span>Show all projects</span>
              <span className={styles.showMoreCount}>
                {String(allProjects.length).padStart(2, "0")}
              </span>
            </button>
          </div>
        ) : null}
      </section>

      <AllProjectsCatalog
        projects={allProjects}
        isOpen={isCatalogMounted}
        isReady={isCatalogReady}
        onClose={() => void closeCatalog()}
      />
    </>
  );
}
