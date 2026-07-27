"use client";

import { useCallback, useRef } from "react";

const MAGNETIC_STRENGTH = 0.25;

export function useMagneticHover<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback((event: React.MouseEvent) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const relX = event.clientX - rect.left - rect.width / 2;
    const relY = event.clientY - rect.top - rect.height / 2;

    element.style.transform = `translate(${relX * MAGNETIC_STRENGTH}px, ${relY * MAGNETIC_STRENGTH}px)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    element.style.transform = "translate(0, 0)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
