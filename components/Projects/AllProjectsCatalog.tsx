"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { gsap } from "gsap";

import { useCatalogScroll } from "@/hooks/useCatalogScroll";
import type { Project } from "@/lib/types";

import styles from "./AllProjectsCatalog.module.css";

type AllProjectsCatalogProps = {
  projects: Project[];
  isOpen: boolean;
  isReady: boolean;
  onClose: () => void;
  onOpenDetail?: (project: Project) => void;
};

export function AllProjectsCatalog({
  projects,
  isOpen,
  isReady,
  onClose,
  onOpenDetail,
}: AllProjectsCatalogProps) {
  const catalogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useCatalogScroll({
    wrapperRef: scrollRef,
    contentRef: listRef,
    enabled: isOpen && isReady,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const list = listRef.current;
    if (!isReady || !list) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const items = list.querySelectorAll<HTMLElement>("[data-catalog-item]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 28, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.55,
          stagger: 0.055,
          ease: "power3.out",
          delay: 0.06,
        },
      );
    }, list);

    return () => ctx.revert();
  }, [isReady]);

  if (!isOpen) return null;

  return (
    <div
      ref={catalogRef}
      className={`${styles.catalog} ${isReady ? styles.catalogOpen : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-projects-title"
    >
      <header className={styles.header}>
        <div className={styles.headerMeta}>
          <p className={styles.eyebrow}>Project index</p>
          <h2 id="all-projects-title" className={styles.title}>
            All Work
          </h2>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          data-cursor="interactive"
        >
          Close <span aria-hidden="true">✕</span>
        </button>
      </header>

      <div ref={scrollRef} className={styles.scrollArea}>
        <div ref={listRef} className={styles.list}>
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={styles.item}
              data-catalog-item
            >
              <p className={styles.index}>
                {String(index + 1).padStart(2, "0")}
              </p>

              <div className={styles.body}>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.thumb}
                  data-catalog-thumb
                  data-cursor="project"
                >
                  <Image
                    src={project.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 180px"
                    className={styles.thumbImage}
                  />
                </a>

                <div className={styles.copy} data-catalog-copy>
                  <p className={styles.meta}>
                    {project.year ?? "—"}
                    {project.status ? ` · ${project.status}` : ""}
                  </p>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.description}>
                    {project.impact ?? project.description}
                  </p>
                  <p className={styles.tags}>
                    {(project.technologies ?? project.tags).join(" · ")}
                  </p>
                  <div className={styles.itemActions}>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="project"
                    >
                      View project ↗
                    </a>
                    {onOpenDetail ? (
                      <button
                        type="button"
                        onClick={() => onOpenDetail(project)}
                        data-cursor="button"
                      >
                        Details →
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={styles.side}>
                {project.year ? (
                  <p className={styles.year}>{project.year}</p>
                ) : null}
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
