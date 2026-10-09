"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Magnetic } from "@/components/Cursor/Magnetic";
import { portfolio } from "@/content/portfolio";
import type { Project } from "@/lib/types";
import {
  lockPageScroll,
  resetPageScrollLock,
  unlockPageScroll,
} from "@/lib/scrollLock";

import { initFeaturedWorkScroll } from "./featuredWorkScroll";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectMedia } from "./ProjectMedia";
import styles from "./FeaturedWork.module.css";

function chapterMeta(project: Project) {
  const stack = project.technologies ?? project.tags;
  return [project.year, stack.join(" / ")].filter(Boolean).join("  ·  ");
}

export function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const projects = portfolio.projects;
  const total = String(projects.length).padStart(2, "0");

  const [isSequence, setIsSequence] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const openDetail = useCallback((project: Project) => {
    setDetailProject(project);
    lockPageScroll();
  }, []);

  const closeDetail = useCallback(() => {
    setDetailProject(null);
    unlockPageScroll();
    ScrollTrigger.refresh();
  }, []);

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

  return (
    <>
      <section id="projects" ref={sectionRef} className={styles.featuredWork}>
        <div className={styles.track} data-work-track>
          <div className={styles.stage} data-work-stage>
            <div className={styles.stageTop}>
              <p className={styles.label}>Projects</p>
              <div className={styles.progress} aria-hidden="true">
                {projects.map((project, index) => (
                  <span
                    key={project.id}
                    className={styles.progressMark}
                    data-reached={index <= activeIndex ? "" : undefined}
                    data-current={index === activeIndex ? "" : undefined}
                  />
                ))}
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
      </section>

      <ProjectDetail
        project={detailProject}
        isOpen={Boolean(detailProject)}
        onClose={closeDetail}
      />
    </>
  );
}
