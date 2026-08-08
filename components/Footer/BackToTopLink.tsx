"use client";

import { useSmoothScroll } from "@/hooks/useSmoothScroll";

type BackToTopLinkProps = {
  children: React.ReactNode;
};

export function BackToTopLink({ children }: BackToTopLinkProps) {
  const scrollToSection = useSmoothScroll();

  return (
    <a
      href="#top"
      data-cursor="button"
      onClick={(event) => {
        event.preventDefault();
        void scrollToSection("top");
      }}
    >
      {children}
    </a>
  );
}
