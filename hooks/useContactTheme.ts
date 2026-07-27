"use client";

import { useEffect } from "react";

import { themeDarkSections } from "@/content/sections";

import { subscribeLenisScroll } from "./useLenis";

function getThemeBlend(contact: HTMLElement) {
  const rect = contact.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const center = rect.top + rect.height * 0.5;

  const blendStart = viewportHeight * 0.95;
  const blendEnd = viewportHeight * 0.45;

  if (center >= blendStart) return 0;
  if (center <= blendEnd) return 1;

  return 1 - (center - blendEnd) / (blendStart - blendEnd);
}

function applyThemeBlend(blend: number) {
  const clamped = Math.min(1, Math.max(0, blend));
  document.documentElement.style.setProperty(
    "--theme-blend",
    clamped.toFixed(4),
  );
  document.documentElement.classList.toggle("theme-dark", clamped > 0.5);
  document.documentElement.dataset.theme = clamped > 0.5 ? "dark" : "light";
}

/**
 * Smoothly blends the page from light to dark as the contact section
 * enters the viewport — replaces the previous hard IntersectionObserver toggle.
 */
export function useContactTheme() {
  useEffect(() => {
    const contact = themeDarkSections
      .map((id) => document.getElementById(id))
      .find((element): element is HTMLElement => Boolean(element));

    if (!contact) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let targetBlend = getThemeBlend(contact);
    let currentBlend = targetBlend;
    let frameId = 0;
    let isAnimating = false;

    const syncBlend = () => {
      targetBlend = getThemeBlend(contact);

      if (prefersReducedMotion) {
        currentBlend = targetBlend;
        applyThemeBlend(currentBlend);
        return;
      }

      if (!isAnimating) {
        isAnimating = true;
        frameId = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      currentBlend += (targetBlend - currentBlend) * 0.1;

      if (Math.abs(currentBlend - targetBlend) < 0.002) {
        currentBlend = targetBlend;
        applyThemeBlend(currentBlend);
        isAnimating = false;
        return;
      }

      applyThemeBlend(currentBlend);
      frameId = requestAnimationFrame(tick);
    };

    syncBlend();

    const unsubscribeLenis = subscribeLenisScroll(syncBlend);
    window.addEventListener("resize", syncBlend, { passive: true });

    return () => {
      unsubscribeLenis();
      window.removeEventListener("resize", syncBlend);
      cancelAnimationFrame(frameId);
      document.documentElement.style.removeProperty("--theme-blend");
      document.documentElement.classList.remove("theme-dark");
      document.documentElement.dataset.theme = "light";
    };
  }, []);
}
