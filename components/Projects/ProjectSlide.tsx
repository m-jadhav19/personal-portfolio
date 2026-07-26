import type { Project } from "@/lib/types";

import { ProjectMedia } from "./ProjectMedia";
import { getProjectSide } from "./projectMotion";
import styles from "./FeaturedWork.module.css";

type ProjectSlideProps = {
  project: Project;
  index: number;
};

export function ProjectSlide({ project, index }: ProjectSlideProps) {
  const side = getProjectSide(index);

  return (
    <article
      className={`${styles.projectRow} ${
        side === "right" ? styles.projectRowRight : styles.projectRowLeft
      }`}
      data-project-row
      data-project-side={side}
    >
      <div className={styles.mediaColumn} data-project-media>
        <ProjectMedia project={project} />
      </div>

      <div className={styles.info} data-project-info>
        <p className={styles.index}>({String(index + 1).padStart(2, "0")})</p>
        <p className={styles.meta}>
          {project.role ?? "Design & Development"}
          {project.year ? ` — ${project.year}` : ""}
        </p>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
        <p className={styles.tags}>{project.tags.join(" · ")}</p>
      </div>
    </article>
  );
}
