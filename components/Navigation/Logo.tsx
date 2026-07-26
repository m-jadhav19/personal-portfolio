import type { Ref } from "react";

import styles from "./Navigation.module.css";

type LogoProps = {
  innerRef?: Ref<HTMLSpanElement>;
  onClick?: () => void;
};

export function Logo({ innerRef, onClick }: LogoProps) {
  return (
    <a
      href="#top"
      className={styles.logo}
      data-cursor="nav"
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label="Mandar Jadhav — back to top"
    >
      <span ref={innerRef} className={styles.logoInner} data-intro="logo">
        <span className={styles.logoLine1}>Mandar</span>
        <span className={styles.logoLine2}>Jadhav</span>
      </span>
    </a>
  );
}
