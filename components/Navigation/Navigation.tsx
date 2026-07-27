"use client";

import { useEffect, useRef, useState } from "react";

import {
  INTRO_COMPLETE_EVENT,
  playNavigationIntro,
} from "@/animations/navigation";
import { navigation } from "@/content/navigation";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { MobileNav } from "./MobileNav";
import { NavItem } from "./NavItem";
import styles from "./Navigation.module.css";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isHidden } = useHeaderScroll();
  const scrollToSection = useSmoothScroll();
  const activeSection = useActiveSection(navigation.map((item) => item.id));

  const logoRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<HTMLAnchorElement[]>([]);
  const hasPlayedIntro = useRef(false);

  const magneticOne = useMagneticHover<HTMLDivElement>();
  const magneticTwo = useMagneticHover<HTMLDivElement>();
  const magneticThree = useMagneticHover<HTMLDivElement>();
  const magneticFour = useMagneticHover<HTMLDivElement>();
  const magneticHandlers = [
    magneticOne,
    magneticTwo,
    magneticThree,
    magneticFour,
  ];

  useEffect(() => {
    const runIntro = () => {
      if (hasPlayedIntro.current && process.env.NODE_ENV !== "development") {
        return;
      }
      hasPlayedIntro.current = true;

      playNavigationIntro({
        logo: logoRef.current,
        links: linkRefs.current.filter(Boolean),
      });
    };

    if (document.documentElement.dataset.intro === "complete") {
      runIntro();
      return;
    }

    window.addEventListener(INTRO_COMPLETE_EVENT, runIntro);

    return () => {
      window.removeEventListener(INTRO_COMPLETE_EVENT, runIntro);
    };
  }, []);

  const setLinkRef = (index: number) => (element: HTMLAnchorElement | null) => {
    if (element) linkRefs.current[index] = element;
  };

  const headerClassName = [styles.header, isHidden ? styles.headerHidden : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClassName}>
        <div className={styles.inner}>
          <Logo
            innerRef={logoRef}
            onClick={() => scrollToSection("top")}
          />

          <nav className={styles.desktopNav} aria-label="Primary">
            {navigation.map((item, index) => {
              const magnetic = magneticHandlers[index];

              return (
                <NavItem
                  key={item.id}
                  number={item.number}
                  label={item.label}
                  href={`#${item.id}`}
                  isActive={activeSection === item.id}
                  wrapRef={magnetic.ref}
                  itemRef={setLinkRef(index)}
                  onNavigate={scrollToSection}
                  onMouseMove={magnetic.onMouseMove}
                  onMouseLeave={magnetic.onMouseLeave}
                />
              );
            })}
          </nav>

          <MobileNav
            isOpen={isMobileMenuOpen}
            onOpen={() => setIsMobileMenuOpen(true)}
          />
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={scrollToSection}
      />
    </>
  );
}
