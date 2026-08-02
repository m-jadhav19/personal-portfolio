"use client";

import { useEffect, useState } from "react";

import { subscribeLenisScroll } from "@/hooks/useLenis";
import { SCROLL_HEADER_OFFSET } from "@/lib/smoothScroll";

function getScrollY() {
  const lenis = (window as Window & { __lenis__?: { scroll: number } }).__lenis__;
  return lenis?.scroll ?? window.scrollY;
}

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const getSections = () =>
      sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => Boolean(section));

    let activeRef: string | null = null;

    const updateActive = () => {
      const sections = getSections();
      if (!sections.length) return;

      const scrollY = getScrollY();
      const marker =
        scrollY + Math.abs(SCROLL_HEADER_OFFSET) + window.innerHeight * 0.35;
      const firstSectionTop =
        sections[0].getBoundingClientRect().top + scrollY;

      if (marker < firstSectionTop) {
        if (activeRef !== null) {
          activeRef = null;
          setActiveId(null);
        }
        return;
      }

      let currentId = sections[0].id;
      for (const section of sections) {
        const sectionTop = section.getBoundingClientRect().top + scrollY;
        if (sectionTop <= marker) {
          currentId = section.id;
        }
      }

      if (currentId !== activeRef) {
        activeRef = currentId;
        setActiveId(currentId);
      }
    };

    const unsubscribe = subscribeLenisScroll(updateActive);
    updateActive();

    window.addEventListener("resize", updateActive);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", updateActive);
    };
  }, [sectionIds]);

  return activeId;
}
