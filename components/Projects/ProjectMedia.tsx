"use client";

import { useState, type ReactNode } from "react";

import type { Project } from "@/lib/types";

import styles from "./FeaturedWork.module.css";

type ProjectMediaProps = {
  project: Project;
  children?: ReactNode;
};

export function ProjectMedia({ project, children }: ProjectMediaProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`${styles.media} ${isHovering ? styles.mediaHovered : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.imageSrc}
        alt=""
        className={styles.mediaImage}
        draggable={false}
      />
      <span className={styles.mediaVeil} aria-hidden="true" />
      {children}
    </div>
  );
}
