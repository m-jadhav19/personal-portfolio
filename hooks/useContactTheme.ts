"use client";

import { useEffect } from "react";

import { themeDarkSections } from "@/content/sections";

/**
 * Toggles `theme-dark` on <html> when contact (or other themeTrigger sections)
 * is centered in the viewport — matches prototype behavior.
 */
export function useContactTheme() {
  useEffect(() => {
    const targets = themeDarkSections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isDark = entries.some((entry) => entry.isIntersecting);
        document.documentElement.classList.toggle("theme-dark", isDark);
        document.documentElement.dataset.theme = isDark ? "dark" : "light";
      },
      { threshold: 0, rootMargin: "-45% 0px -45% 0px" },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);
}
