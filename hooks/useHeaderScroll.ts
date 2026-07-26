"use client";

import { useEffect, useRef, useState } from "react";

import { subscribeLenisScroll } from "@/hooks/useLenis";

const SCROLL_THRESHOLD = 100;

export function useHeaderScroll() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = (scrollY: number) => {
      setIsScrolled(scrollY > SCROLL_THRESHOLD);

      if (scrollY <= SCROLL_THRESHOLD) {
        setIsHidden(false);
      } else if (scrollY > lastScrollY.current) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      lastScrollY.current = scrollY;
    };

    lastScrollY.current = window.scrollY;
    onScroll(window.scrollY);

    const unsubscribeLenis = subscribeLenisScroll(onScroll);

    const onNativeScroll = () => {
      const win = window as Window & { __lenis__?: unknown };
      if (!win.__lenis__) {
        onScroll(window.scrollY);
      }
    };

    window.addEventListener("scroll", onNativeScroll, { passive: true });

    return () => {
      unsubscribeLenis();
      window.removeEventListener("scroll", onNativeScroll);
    };
  }, []);

  return { isScrolled, isHidden };
}
