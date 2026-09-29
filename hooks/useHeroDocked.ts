"use client";

import { useEffect, useState } from "react";

const TARGET_SELECTOR = "#hero [data-intro='portrait']";

/**
 * True once the hero portrait has scrolled up behind the fixed header
 * (or when the page has no hero at all).
 */
export function useHeroDocked(pathname: string | null) {
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const target =
      document.querySelector(TARGET_SELECTOR) ?? document.getElementById("hero");
    if (!target) {
      setDocked(true);
      return;
    }

    const headerHeight = document.querySelector("header")?.offsetHeight ?? 72;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Only dock when it left through the top, not when it's below the fold.
        setDocked(!entry.isIntersecting && entry.boundingClientRect.top < headerHeight);
      },
      { rootMargin: `-${headerHeight}px 0px 0px 0px` },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  return docked;
}
