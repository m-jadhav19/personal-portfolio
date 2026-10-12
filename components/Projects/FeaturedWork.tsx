"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  isBarOverlayAnimating,
  playBarCover,
  playBarReveal,
  prefersReducedBarMotion,
} from "@/animations/barOverlay";
import { Magnetic } from "@/components/Cursor/Magnetic";
import { portfolio } from "@/content/portfolio";
import type { Project } from "@/lib/types";
import {
  lockPageScroll,
  resetPageScrollLock,
  unlockPageScroll,
} from "@/lib/scrollLock";

import { AllProjectsCatalog } from "./AllProjectsCatalog";
import { initFeaturedWorkScroll } from "./featuredWorkScroll";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectMedia } from "./ProjectMedia";
import { dialTurnDegrees, selectFeaturedProjects } from "./projectMotion";
import styles from "./FeaturedWork.module.css";

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

const DIAL_CENTER = 36;
const DIAL_RADIUS = 27;
const DIAL_CIRCUMFERENCE = 2 * Math.PI * DIAL_RADIUS;

function dialOffset(turn: number) {
  return DIAL_CIRCUMFERENCE * (1 - turn / 360);
}

function dialNotch(index: number, count: number, active: boolean) {
  const degrees = -90 + dialTurnDegrees(index, count);
  const radians = (degrees * Math.PI) / 180;
  const outer = DIAL_RADIUS;
  const inner = outer - (active ? 8 : 5);
  return {
    x1: DIAL_CENTER + Math.cos(radians) * inner,
    y1: DIAL_CENTER + Math.sin(radians) * inner,
    x2: DIAL_CENTER + Math.cos(radians) * outer,
    y2: DIAL_CENTER + Math.sin(radians) * outer,
  };
}

function chapterMeta(project: Project) {
  const stack = project.technologies ?? project.tags;
  return [project.year, stack.join(" / ")].filter(Boolean).join("  ·  ");
}

export function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const allProjects = portfolio.projects;
  const projects = selectFeaturedProjects(allProjects);
  const total = String(projects.length).padStart(2, "0");
  const hasMoreProjects = allProjects.length > projects.length;

  const [isSequence, setIsSequence] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const dialArcRef = useRef<SVGCircleElement>(null);
  const dialNeedleRef = useRef<SVGGElement>(null);
  const dialTurnRef = useRef({ turn: dialTurnDegrees(0, projects.length) });
  const [isCatalogMounted, setIsCatalogMounted] = useState(false);
  const [isCatalogReady, setIsCatalogReady] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
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
      flushSync(() => {
        setIsCatalogMounted(true);
        setIsCatalogReady(true);
      });
      await nextFrame();
      await playBarReveal();
    } catch {
      setIsCatalogMounted(false);
      setIsCatalogReady(false);
      unlockPageScroll();
      ScrollTrigger.refresh();
    } finally {
      isTransitioningRef.current = false;
    }
  }, []);

  const closeCatalog = useCallback(async () => {
    if (isTransitioningRef.current || isBarOverlayAnimating()) return;

    isTransitioningRef.current = true;

    try {
      if (prefersReducedBarMotion()) {
        setIsCatalogReady(false);
        setIsCatalogMounted(false);
        unlockPageScroll();
        ScrollTrigger.refresh();
        return;
      }

      await playBarCover();
      flushSync(() => {
        setIsCatalogReady(false);
        setIsCatalogMounted(false);
      });
      unlockPageScroll();
      ScrollTrigger.refresh();
      await nextFrame();
      await playBarReveal();
    } catch {
      setIsCatalogReady(false);
      setIsCatalogMounted(false);
      unlockPageScroll();
      ScrollTrigger.refresh();
    } finally {
      isTransitioningRef.current = false;
    }
  }, []);

  const openDetail = useCallback((project: Project) => {
    setDetailProject(project);
    lockPageScroll();
  }, []);

  const closeDetail = useCallback(() => {
    setDetailProject(null);
    if (!isCatalogMounted) {
      unlockPageScroll();
      ScrollTrigger.refresh();
    }
  }, [isCatalogMounted]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cleanup = initFeaturedWorkScroll(section, {
      onModeChange: (mode) => {
        setIsSequence(mode === "sequence");
      },
      onIndexChange: (index) => {
        setActiveIndex(index);
      },
    });

    const refreshTimeout = window.setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      window.clearTimeout(refreshTimeout);
      cleanup();
    };
  }, []);

  useEffect(() => {
    return () => {
      resetPageScrollLock();
    };
  }, []);

  useEffect(() => {
    const arc = dialArcRef.current;
    const needle = dialNeedleRef.current;
    if (!arc || !needle) return;

    const state = dialTurnRef.current;
    const apply = () => {
      arc.style.strokeDashoffset = String(dialOffset(state.turn));
      needle.style.transform = `rotate(${state.turn}deg)`;
    };

    const tween = gsap.to(state, {
      turn: dialTurnDegrees(activeIndex, projects.length),
      duration: 0.75,
      ease: "power3.out",
      easeReverse: "power3.in",
      overwrite: true,
      onUpdate: apply,
    } as gsap.TweenVars);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tween.progress(1);
    }

    return () => {
      tween.kill();
    };
  }, [activeIndex, projects.length]);

  return (
    <>
      <section id="projects" ref={sectionRef} className={styles.featuredWork}>
        <div className={styles.track} data-work-track>
          <div className={styles.stage} data-work-stage>
            <div className={styles.stageTop}>
              <p className={styles.label}>Projects</p>
              <div className={styles.dial} aria-hidden="true">
                <svg className={styles.dialFace} viewBox="0 0 72 72">
                  <circle className={styles.dialPlate} cx="36" cy="36" r="33" />
                  <circle className={styles.dialRing} cx="36" cy="36" r={DIAL_RADIUS} />
                  <circle
                    ref={dialArcRef}
                    className={styles.dialArc}
                    cx="36"
                    cy="36"
                    r={DIAL_RADIUS}
                    style={{
                      strokeDasharray: DIAL_CIRCUMFERENCE,
                      strokeDashoffset: dialOffset(dialTurnDegrees(0, projects.length)),
                    }}
                    transform="rotate(-90 36 36)"
                  />
                  {projects.map((project, index) => {
                    const notch = dialNotch(index, projects.length, index === activeIndex);
                    return (
                      <line
                        key={project.id}
                        className={styles.dialNotch}
                        data-current={index === activeIndex ? "" : undefined}
                        x1={notch.x1}
                        y1={notch.y1}
                        x2={notch.x2}
                        y2={notch.y2}
                      />
                    );
                  })}
                  <g
                    ref={dialNeedleRef}
                    className={styles.dialNeedle}
                    style={{ transform: `rotate(${dialTurnDegrees(0, projects.length)}deg)` }}
                  >
                    <line x1="36" y1="34" x2="36" y2="14" />
                    <circle cx="36" cy="36" r="2.4" />
                  </g>
                </svg>
              </div>
              <p className={styles.counter} data-work-counter>
                <span data-work-counter-current>
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className={styles.counterDivider} aria-hidden="true">
                  /
                </span>
                <span>{total}</span>
              </p>
            </div>

            <div className={styles.chapters}>
              {projects.map((project, index) => {
                const isActive = index === activeIndex;
                const hideFromAssistiveTech = isSequence && !isActive;
                const titleId = `work-chapter-${project.id}`;

                return (
                  <article
                    key={project.id}
                    className={styles.chapter}
                    data-chapter
                    data-active={isActive ? "" : undefined}
                    aria-hidden={hideFromAssistiveTech ? true : undefined}
                    aria-labelledby={titleId}
                  >
                    <div className={styles.copy}>
                      <p className={styles.chapterIndex}>
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <div className={styles.titleClip}>
                        <h2
                          id={titleId}
                          className={styles.title}
                          data-chapter-title
                        >
                          {project.title}
                        </h2>
                      </div>
                      <p className={styles.description} data-chapter-fade>
                        {project.impact ?? project.description}
                      </p>
                      <p className={styles.meta} data-chapter-fade>
                        {chapterMeta(project)}
                      </p>
                    </div>

                    <div className={styles.mediaFrame} data-chapter-media>
                      <ProjectMedia project={project}>
                        <Magnetic className={styles.liveSlot} strength={0.16}>
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.liveButton}
                            data-cursor="project"
                            tabIndex={hideFromAssistiveTech ? -1 : undefined}
                          >
                            Live <span aria-hidden="true">↗</span>
                          </a>
                        </Magnetic>
                        <Magnetic className={styles.infoSlot} strength={0.14}>
                          <button
                            type="button"
                            className={styles.infoButton}
                            data-cursor="button"
                            aria-label={`Read ${project.title}`}
                            tabIndex={hideFromAssistiveTech ? -1 : undefined}
                            onClick={() => openDetail(project)}
                          >
                            <svg
                              className={styles.infoIcon}
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="8.25"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                              />
                              <path
                                d="M12 11.25v5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                              />
                              <circle cx="12" cy="8" r="1" fill="currentColor" />
                            </svg>
                          </button>
                        </Magnetic>
                      </ProjectMedia>
                    </div>
                  </article>
                );
              })}
            </div>

          </div>
        </div>

        {hasMoreProjects ? (
          <div className={styles.showMoreWrap} data-show-more>
            <Magnetic strength={0.16}>
              <button
                type="button"
                className={styles.showMoreBtn}
                data-cursor="button"
                onClick={() => void openCatalog()}
              >
                <span>Show all projects</span>
                <span className={styles.showMoreCount}>
                  {String(allProjects.length).padStart(2, "0")}
                </span>
              </button>
            </Magnetic>
          </div>
        ) : null}
      </section>

      <AllProjectsCatalog
        projects={allProjects}
        isOpen={isCatalogMounted}
        isReady={isCatalogReady}
        onClose={() => void closeCatalog()}
        onOpenDetail={openDetail}
      />

      <ProjectDetail
        project={detailProject}
        isOpen={Boolean(detailProject)}
        onClose={closeDetail}
      />
    </>
  );
}
