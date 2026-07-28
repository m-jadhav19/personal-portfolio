"use client";

import { useEffect, useRef } from "react";

import { bindScrambleOnView } from "@/animations/scramble";

type ScrambleTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  "data-featured-heading"?: boolean;
};

export function ScrambleText({
  text,
  as: Tag = "span",
  className,
  "data-featured-heading": dataFeaturedHeading,
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return bindScrambleOnView(element, text);
  }, [text]);

  return (
    <Tag
      ref={ref as never}
      className={className}
      {...(dataFeaturedHeading ? { "data-featured-heading": true } : {})}
    >
      {text}
    </Tag>
  );
}
