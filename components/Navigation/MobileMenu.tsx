"use client";

import { useEffect, useRef } from "react";

import { closeMobileMenu, openMobileMenu } from "@/animations/navigation";
import {
  mobileExtraLinks,
  navigation,
  type MobileExtraLink,
} from "@/content/navigation";

import styles from "./Navigation.module.css";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
};

export function MobileMenu({ isOpen, onClose, onNavigate }: MobileMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<HTMLAnchorElement[]>([]);
  const isAnimatingRef = useRef(false);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const links = linkRefs.current.filter(Boolean);

    if (!overlay || !panel) return;

    if (isOpen) {
      isAnimatingRef.current = true;
      document.body.style.overflow = "hidden";
      openMobileMenu({ overlay, panel, links }).eventCallback("onComplete", () => {
        isAnimatingRef.current = false;
      });
      return;
    }

    if (overlay.style.visibility === "visible") {
      isAnimatingRef.current = true;
      closeMobileMenu({ overlay, panel, links }).eventCallback("onComplete", () => {
        isAnimatingRef.current = false;
        document.body.style.overflow = "";
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpenRef.current) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const setLinkRef = (index: number) => (element: HTMLAnchorElement | null) => {
    if (element) linkRefs.current[index] = element;
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      aria-hidden={!isOpen}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        id="mobile-navigation"
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        onClick={(event) => event.stopPropagation()}
      >
        <nav className={styles.mobileLinks} aria-label="Mobile">
          {navigation.map((item, index) => (
            <a
              key={item.id}
              ref={setLinkRef(index)}
              href={`#${item.id}`}
              className={styles.mobileLink}
              data-cursor="nav"
              onClick={(event) => {
                event.preventDefault();
                onClose();
                onNavigate(item.id);
              }}
            >
              <span className={styles.mobileLinkNumber}>{item.number}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.mobileExtras}>
          {mobileExtraLinks.map((link: MobileExtraLink) => (
            <a
              key={link.label}
              href={link.href}
              className={styles.mobileExtraLink}
              data-cursor="nav"
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={() => onClose()}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
