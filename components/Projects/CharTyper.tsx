"use client";

import { useEffect, useRef } from "react";

type CharTyperProps = {
  text: string;
  className?: string;
  active?: boolean;
};

const VARIATIONS = ["charFill", "charInverse", "charBorder"] as const;

export function CharTyper({ text, className = "", active = true }: CharTyperProps) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active || !rootRef.current) return;

    const chars = rootRef.current.querySelectorAll<HTMLElement>("[data-char]");
    const timeouts: number[] = [];

    chars.forEach((char, index) => {
      const timeout = window.setTimeout(() => {
        const variation =
          VARIATIONS[Math.floor(Math.random() * VARIATIONS.length)] ??
          "charFill";
        char.dataset.variation = variation;
      }, index * 45);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [active, text]);

  const words = text.split(" ");

  return (
    <span ref={rootRef} className={className}>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="word">
          {word.split("").map((char, charIndex) => (
            <span
              key={`${wordIndex}-${charIndex}`}
              className="char"
              data-char
              data-variation="charInit"
            >
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
