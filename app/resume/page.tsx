import type { Metadata } from "next";

import { ResumeActions } from "@/components/Resume/ResumeActions";
import { ResumeDocument } from "@/components/Resume/ResumeDocument";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Resume — Mandar Jadhav",
  description:
    "Frontend developer resume — ShipDelight, Futurism Technologies, React, Vue, Next.js.",
};

export default function ResumePage() {
  return (
    <main className={styles.resume} data-cursor="hide">
      <ResumeActions />
      <div className={styles.sheet}>
        <ResumeDocument />
      </div>
    </main>
  );
}
