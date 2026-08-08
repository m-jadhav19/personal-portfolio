"use client";

import { useRef, useState } from "react";

import { portfolio } from "@/content/portfolio";

import { PortraitAsciiFrame } from "./PortraitAsciiFrame";
import { PortraitRgbCanvas, type PortraitPointer } from "./PortraitRgbCanvas";
import styles from "./Hero.module.css";

type HeroPortraitProps = {
  portraitRef?: React.Ref<HTMLDivElement>;
};

export function HeroPortrait({ portraitRef }: HeroPortraitProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PortraitPointer>({ x: 0.5, y: 0.5, hovered: false });
  const [isHovered, setIsHovered] = useState(false);

  const setRef = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (typeof portraitRef === "function") {
      portraitRef(node);
    } else if (portraitRef) {
      portraitRef.current = node;
    }
  };

  const syncPointer = (clientX: number, clientY: number) => {
    const node = localRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    pointerRef.current.x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    pointerRef.current.y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
  };

  const portraitSrc = portfolio.hero.portrait.src;

  return (
    <div
      ref={setRef}
      className={styles.portraitStage}
      data-intro="portrait"
      data-cursor="interactive"
      tabIndex={0}
      role="img"
      aria-label={`Portrait of ${portfolio.headerTaglineTwo}`}
      onMouseEnter={() => {
        pointerRef.current.hovered = true;
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        pointerRef.current.hovered = false;
        pointerRef.current.x = 0.5;
        pointerRef.current.y = 0.5;
        setIsHovered(false);
      }}
      onFocus={() => {
        pointerRef.current.hovered = true;
        setIsHovered(true);
      }}
      onBlur={() => {
        pointerRef.current.hovered = false;
        setIsHovered(false);
      }}
      onPointerMove={(event) => syncPointer(event.clientX, event.clientY)}
    >
      <PortraitAsciiFrame
        isHovered={isHovered}
        pointerRef={pointerRef}
      />
      <PortraitRgbCanvas src={portraitSrc} pointerRef={pointerRef} />
    </div>
  );
}
