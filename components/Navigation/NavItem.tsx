import type { Ref } from "react";

import styles from "./Navigation.module.css";

type NavItemProps = {
  number: string;
  label: string;
  href: string;
  isActive?: boolean;
  wrapRef?: Ref<HTMLDivElement>;
  itemRef?: Ref<HTMLAnchorElement>;
  onNavigate: (id: string) => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
};

export function NavItem({
  number,
  label,
  href,
  isActive = false,
  wrapRef,
  itemRef,
  onNavigate,
  onMouseMove,
  onMouseLeave,
}: NavItemProps) {
  const id = href.replace("#", "");

  return (
    <div
      ref={wrapRef}
      className={styles.navItemWrap}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <a
        ref={itemRef}
        href={href}
        className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
        data-intro="nav-item"
        data-cursor="nav"
        aria-current={isActive ? "true" : undefined}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(id);
        }}
      >
        <span className={styles.activeDot} aria-hidden="true" />
        <span className={styles.navNumber}>{number}</span>
        <span className={styles.navLabel}>{label}</span>
      </a>
    </div>
  );
}
