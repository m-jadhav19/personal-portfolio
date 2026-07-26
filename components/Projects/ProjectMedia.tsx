"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Project } from "@/lib/types";

import { clampCtaPosition } from "./projectMotion";
import styles from "./FeaturedWork.module.css";

type ProjectMediaProps = {
  project: Project;
};

export function ProjectMedia({ project }: ProjectMediaProps) {
  const mediaRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLSpanElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const media = mediaRef.current;
    const button = buttonRef.current;
    if (!media || !button) return;

    const onMove = (event: MouseEvent) => {
      const rect = media.getBoundingClientRect();
      const { x, y } = clampCtaPosition({
        pointerX: event.clientX - rect.left,
        pointerY: event.clientY - rect.top,
        containerWidth: rect.width,
        containerHeight: rect.height,
        ctaWidth: button.offsetWidth,
        ctaHeight: button.offsetHeight,
      });
      button.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    media.addEventListener("mousemove", onMove);
    return () => media.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <a
      ref={mediaRef}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.media}
      data-cursor="hide"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={`View ${project.title}`}
    >
      <Image
        src={project.imageSrc}
        alt={project.title}
        fill
        sizes="(max-width: 900px) 100vw, 55vw"
        className={styles.mediaImage}
      />
      <span
        ref={buttonRef}
        className={`${styles.viewBtn} ${isHovering ? styles.viewBtnVisible : ""}`}
        aria-hidden="true"
      >
        View project
      </span>
    </a>
  );
}
