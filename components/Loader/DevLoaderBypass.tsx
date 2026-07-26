"use client";

import { useEffect } from "react";

import { signalIntroComplete } from "@/animations/loader";
import { resetIntroDocumentState } from "@/lib/introDocument";

type LoaderWindow = Window & {
  __lenis__?: {
    start: () => void;
    stop: () => void;
  };
};

export function DevLoaderBypass() {
  useEffect(() => {
    resetIntroDocumentState();
    document.documentElement.classList.add("intro-nav-only");
    (window as LoaderWindow).__lenis__?.start();
    signalIntroComplete();
  }, []);

  return null;
}
