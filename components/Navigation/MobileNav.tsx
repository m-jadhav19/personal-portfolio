"use client";

import styles from "./Navigation.module.css";

type MobileNavProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function MobileNav({ isOpen, onOpen, onClose }: MobileNavProps) {
  return (
    <div className={styles.mobileControls}>
      <button
        type="button"
        className={styles.menuButton}
        data-cursor="nav"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={isOpen ? onClose : onOpen}
      >
        {isOpen ? "Close" : "Menu"}
      </button>
    </div>
  );
}
