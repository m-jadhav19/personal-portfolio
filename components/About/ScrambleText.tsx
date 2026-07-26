"use client";

import { useEffect, useRef } from "react";

import { bindScrambleOnView } from "@/animations/scramble";

type ScrambleTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
};

export function ScrambleText({
  text,
  as: Tag = "span",
  className,
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return bindScrambleOnView(element, text);
  }, [text]);

  return (
    <Tag ref={ref as never} className={className}>
      {text}
    </Tag>
  );
}
