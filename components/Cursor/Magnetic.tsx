"use client";

import { useRef, type ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  strength?: number;
  className?: string;
  "data-cursor"?: string;
};

export function Magnetic({
  children,
  strength = 0.22,
  className,
  "data-cursor": dataCursor,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      data-cursor={dataCursor}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        display: "inline-flex",
        transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
