"use client";

import { useEffect, useRef, useState } from "react";

import { subscribeLenisScroll } from "@/hooks/useLenis";

const SCROLL_THRESHOLD = 100;

export function useHeaderScroll() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const stateRef = useRef({ isScrolled: false, isHidden: false });

  useEffect(() => {
    const onScroll = (scrollY: number) => {
      const nextScrolled = scrollY > SCROLL_THRESHOLD;
      let nextHidden = stateRef.current.isHidden;

      if (scrollY <= SCROLL_THRESHOLD) {
        nextHidden = false;
      } else if (scrollY > lastScrollY.current) {
        nextHidden = true;
      } else {
        nextHidden = false;
      }

      if (nextScrolled !== stateRef.current.isScrolled) {
        stateRef.current.isScrolled = nextScrolled;
        setIsScrolled(nextScrolled);
      }

      if (nextHidden !== stateRef.current.isHidden) {
        stateRef.current.isHidden = nextHidden;
        setIsHidden(nextHidden);
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
