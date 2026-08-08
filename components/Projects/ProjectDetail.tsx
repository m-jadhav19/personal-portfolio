"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";

import type { Project } from "@/lib/types";

import styles from "./ProjectDetail.module.css";

type ProjectDetailProps = {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
};

export function ProjectDetail({ project, isOpen, onClose }: ProjectDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!isOpen || !panel || !project) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel.querySelectorAll("[data-detail-reveal]"),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: "power3.out",
        },
      );
    }, panel);

    return () => ctx.revert();
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const technologies = project.technologies ?? project.tags;
  const roles = project.roles ?? (project.role ? [project.role] : []);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-detail-title"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div data-detail-reveal>
            <p className={styles.eyebrow}>
              {project.year ? `${project.year} · Details` : "Details"}
            </p>
            <h2 id="project-detail-title" className={styles.title}>
              {project.title}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            data-cursor="interactive"
          >
            Close <span aria-hidden="true">✕</span>
          </button>
        </header>

        {project.impact ? (
          <p className={styles.impact} data-detail-reveal>
            {project.impact}
          </p>
        ) : null}

        <div className={styles.strip}>
          <div data-detail-reveal>
            <p className={styles.stripLabel}>Technology</p>
            <ul className={styles.stripList}>
              {technologies.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>

          {roles.length > 0 ? (
            <div data-detail-reveal>
              <p className={styles.stripLabel}>Role</p>
              <ul className={styles.stripList}>
                {roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {project.contribution ? (
          <div data-detail-reveal>
            <p className={styles.stripLabel}>Contribution</p>
            <p className={styles.contribution}>{project.contribution}</p>
          </div>
        ) : (
          <p className={styles.contribution} data-detail-reveal>
            {project.description}
          </p>
        )}

        <div className={styles.actions} data-detail-reveal>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryLink}
          data-cursor="link"
        >
          View project <span aria-hidden="true">↗</span>
        </a>
        </div>
      </div>
    </div>
  );
}
