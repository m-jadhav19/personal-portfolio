"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./SectionTitle.module.css";

gsap.registerPlugin(ScrollTrigger);

type SectionTitleProps = {
  words: string[];
  variant?: "dark" | "light";
  className?: string;
  as?: "h1" | "h2" | "h3";
};

export function SectionTitle({
  words,
  variant = "dark",
  className = "",
  as: Tag = "h2",
}: SectionTitleProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const spans = root.querySelectorAll("[data-word]");
    const tween = gsap.fromTo(
      spans,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [words]);

  return (
    <Tag
      ref={rootRef as never}
      className={`${styles.title} ${styles[variant]} ${className}`.trim()}
    >
      {words.map((word) => (
        <span key={word} className={styles.wordWrap}>
          <span data-word className={styles.word}>
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}
