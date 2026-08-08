"use client";

import Link from "next/link";

import { resumeDocument } from "@/content/resume";

import styles from "./ResumeActions.module.css";

export function ResumeActions() {
  return (
    <div className={styles.actions} data-resume-chrome>
      <Link href="/" className={styles.link}>
        ← Portfolio
      </Link>
      <div className={styles.group}>
        <a
          href={resumeDocument.pdfPath}
          download="Mandar_Jadhav_Resume.pdf"
          className={styles.button}
        >
          Download PDF
        </a>
        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={() => window.print()}
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
