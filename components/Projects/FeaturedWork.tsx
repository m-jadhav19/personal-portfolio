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
import { portfolio } from "@/content/portfolio";
import {
  lockPageScroll,
  resetPageScrollLock,
  unlockPageScroll,
} from "@/lib/scrollLock";

import { AllProjectsCatalog } from "./AllProjectsCatalog";
import { initFeaturedWorkScroll } from "./featuredWorkScroll";
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

    const cleanup = initFeaturedWorkScroll(section);

    const refresh = () => ScrollTrigger.refresh();
    const refreshTimeout = window.setTimeout(refresh, 100);

    window.addEventListener("resize", refresh);

    return () => {
      window.clearTimeout(refreshTimeout);
      window.removeEventListener("resize", refresh);
      cleanup();
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
        <div className={styles.stickyHeading} data-featured-heading-wrap>
          <h2 className={styles.headingTitle} data-featured-heading>
            Featured Work
          </h2>
          <span className={styles.headingCue}>[Scroll to explore more]</span>
        </div>

        <div className={styles.projects} data-featured-projects>
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
