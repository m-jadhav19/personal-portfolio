"use client";

import { useEffect, useRef, useState } from "react";

import type { Project } from "@/lib/types";

import { clampCtaPosition } from "./projectMotion";
import {
  ProjectMediaShader,
  type MediaPointer,
} from "./ProjectMediaShader";
import styles from "./FeaturedWork.module.css";

type ProjectMediaProps = {
  project: Project;
};

export function ProjectMedia({ project }: ProjectMediaProps) {
  const mediaRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLSpanElement>(null);
  const pointerRef = useRef<MediaPointer>({ x: 0.5, y: 0.5, hovered: false });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const media = mediaRef.current;
    const button = buttonRef.current;
    if (!media || !button) return;

    const onMove = (event: MouseEvent) => {
      const rect = media.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      pointerRef.current.x = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      pointerRef.current.y = Math.min(
        1,
        Math.max(0, (event.clientY - rect.top) / rect.height),
      );

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
      onMouseEnter={() => {
        pointerRef.current.hovered = true;
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        pointerRef.current.hovered = false;
        pointerRef.current.x = 0.5;
        pointerRef.current.y = 0.5;
        setIsHovering(false);
      }}
      aria-label={`View ${project.title}`}
    >
      <ProjectMediaShader
        src={project.imageSrc}
        alt={project.title}
        pointerRef={pointerRef}
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
