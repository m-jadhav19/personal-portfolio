"use client";

import { useTypoMode } from "@/hooks/useTypoMode";

import { CharTyper } from "./CharTyper";
import styles from "./FeaturedWork.module.css";

type ProjectHoverLabelsProps = {
  visible: boolean;
  y: number;
};

function LabelWord({
  text,
  typoMode,
}: {
  text: string;
  typoMode: boolean;
}) {
  if (typoMode) {
    return <CharTyper text={text} className={styles.hoverTyper} />;
  }

  return <>{text}</>;
}

export function ProjectHoverLabels({ visible, y }: ProjectHoverLabelsProps) {
  const typoMode = useTypoMode();

  return (
    <div
      className={`${styles.hoverLabelRow} ${
        visible ? styles.hoverLabelRowVisible : ""
      }`}
      style={{ top: `${y}px` }}
      aria-hidden="true"
    >
      <span className={styles.hoverWord}>
        <LabelWord text="View" typoMode={typoMode} />
      </span>
      <span className={`${styles.hoverWord} ${styles.hoverWordCenter}`}>
        <LabelWord text="project" typoMode={typoMode} />
      </span>
      <span className={styles.hoverWord}>
        <LabelWord text="details" typoMode={typoMode} />
      </span>
    </div>
  );
}
