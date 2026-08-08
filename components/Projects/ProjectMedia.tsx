"use client";

import { useState } from "react";

import type { Project } from "@/lib/types";

import styles from "./FeaturedWork.module.css";

type ProjectMediaProps = {
  project: Project;
};

export function ProjectMedia({ project }: ProjectMediaProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.media} ${isHovering ? styles.mediaHovered : ""}`}
      data-cursor="project"
      data-cursor-text="VIEW →"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={`View ${project.title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.imageSrc}
        alt={project.title}
        className={styles.mediaImage}
        draggable={false}
      />
      <span className={styles.mediaVeil} aria-hidden="true" />
      <span className={styles.viewBtnTouch} aria-hidden="true">
        View project →
      </span>
    </a>
  );
}
