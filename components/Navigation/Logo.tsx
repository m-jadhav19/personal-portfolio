import type { Ref } from "react";

import styles from "./Navigation.module.css";

type LogoProps = {
  innerRef?: Ref<HTMLSpanElement>;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
};

export function Logo({
  innerRef,
  onClick,
  className = "",
  compact = false,
}: LogoProps) {
  return (
    <a
      href="#top"
      className={`${styles.logo} ${className}`.trim()}
      data-cursor="nav"
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
      aria-label="Mandar Jadhav — back to top"
    >
      <span ref={innerRef} className={styles.logoInner} data-intro="logo">
        {compact ? (
          <span className={styles.logoLine1}>MANDAR STUDIO</span>
        ) : (
          <>
            <span className={styles.logoLine1}>Mandar</span>
            <span className={styles.logoLine2}>Jadhav</span>
          </>
        )}
      </span>
    </a>
  );
}
