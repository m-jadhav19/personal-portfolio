"use client";

import { useRef, useState } from "react";

import { navigation, typoClocks } from "@/content/navigation";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { MobileNav } from "./MobileNav";
import styles from "./TypoNavigation.module.css";
import { TimezoneClock } from "./TimezoneClock";

export function TypoNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isHidden } = useHeaderScroll();
  const scrollToSection = useSmoothScroll();
  const activeSection = useActiveSection(navigation.map((item) => item.id));
  const logoRef = useRef<HTMLSpanElement>(null);

  const headerClassName = [
    styles.header,
    isHidden && !isMobileMenuOpen ? styles.headerHidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClassName}>
        <nav className={styles.nav} aria-label="Primary">
          <Logo
            innerRef={logoRef}
            onClick={() => scrollToSection("top")}
            className={styles.logo}
            compact
          />

          <div className={styles.clocks}>
            {typoClocks.map((clock) => (
              <TimezoneClock
                key={clock.timezone}
                label={clock.label}
                timezone={clock.timezone}
                blinkOffset={clock.blinkOffset}
              />
            ))}
          </div>

          <ul className={styles.links}>
            {navigation.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`typo-button ${styles.link} ${
                    activeSection === item.id ? styles.linkActive : ""
                  }`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav
          isOpen={isMobileMenuOpen}
          onOpen={() => setIsMobileMenuOpen(true)}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={scrollToSection}
      />
    </>
  );
}
