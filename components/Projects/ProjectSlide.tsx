"use client";

import type { Project } from "@/lib/types";

import { ProjectMedia } from "./ProjectMedia";
import { getProjectSide } from "./projectMotion";
import styles from "./FeaturedWork.module.css";

type ProjectSlideProps = {
  project: Project;
  index: number;
  onOpenDetail?: (project: Project) => void;
};

export function ProjectSlide({
  project,
  index,
  onOpenDetail,
}: ProjectSlideProps) {
  const side = getProjectSide(index);
  const stack = project.technologies ?? project.tags;
  const blurb = project.impact ?? project.description;

  return (
    <article
      className={`${styles.projectRow} ${
        side === "right" ? styles.projectRowRight : styles.projectRowLeft
      }`}
      data-project-row
      data-project-side={side}
    >
      <div className={styles.mediaColumn} data-project-media>
        <div className={styles.mediaParallax} data-project-media-inner>
          <ProjectMedia project={project} />
        </div>
      </div>

      <div className={styles.info} data-project-info>
        <p className={styles.index} data-reveal>
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className={styles.title} data-reveal>
          {project.title}
        </h3>
        <p className={styles.description} data-reveal>
          {blurb}
        </p>
        <p className={styles.tags} data-reveal>
          {stack.join(" / ")}
        </p>
        {project.year ? (
          <p className={styles.meta} data-reveal>
            {project.year}
          </p>
        ) : null}

        <div className={styles.hoverLinks} data-reveal>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.hoverLink}
            data-cursor="project"
          >
            View project →
          </a>
          {onOpenDetail ? (
            <button
              type="button"
              className={styles.hoverLink}
              onClick={() => onOpenDetail(project)}
              data-cursor="interactive"
            >
              Case study →
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
