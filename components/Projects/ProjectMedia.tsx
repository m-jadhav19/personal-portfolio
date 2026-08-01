"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { ArtFilterImage } from "@/components/ArtFilter";
import { useTypoMode } from "@/hooks/useTypoMode";
import type { Project } from "@/lib/types";

import { ProjectHoverLabels } from "./ProjectHoverLabels";
import styles from "./FeaturedWork.module.css";

type ProjectMediaProps = {
  project: Project;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ProjectMedia({ project }: ProjectMediaProps) {
  const mediaRef = useRef<HTMLAnchorElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [labelY, setLabelY] = useState(0);
  const typoMode = useTypoMode();

  const handleEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setIsHovering(true);
    handleMove(event);
  };

  const handleMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const rect = media.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const padding = 28;
    setLabelY(clamp(y, padding, rect.height - padding));
  };

  return (
    <div className={styles.mediaFrame}>
      <a
        ref={mediaRef}
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.media}
        data-cursor="hide"
        aria-label={`View ${project.title}`}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMove}
      >
        {typoMode ? (
          <ArtFilterImage
            src={project.imageSrc}
            alt={project.title}
            className={styles.mediaImage}
            sizes="(max-width: 900px) 100vw, 65vw"
            cellSize={6}
          />
        ) : (
          <Image
            src={project.imageSrc}
            alt={project.title}
            fill
            sizes="(max-width: 900px) 100vw, 65vw"
            className={styles.mediaImage}
            priority={false}
          />
        )}
        <ProjectHoverLabels visible={isHovering} y={labelY} />
      </a>
    </div>
  );
}
