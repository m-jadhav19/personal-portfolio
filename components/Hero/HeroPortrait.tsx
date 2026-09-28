"use client";

import { useEffect, useRef, useState } from "react";

import { portfolio } from "@/content/portfolio";

import {
  PortraitAvatar,
  type PortraitPart,
} from "./PortraitAvatar";
import { PortraitGlitchField } from "./PortraitGlitchField";
import styles from "./Hero.module.css";

type HeroPortraitProps = {
  portraitRef?: React.Ref<HTMLDivElement>;
};

type PointerState = { x: number; y: number };

export function HeroPortrait({ portraitRef }: HeroPortraitProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState<PointerState>({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [activePart, setActivePart] = useState<PortraitPart | null>(null);
  const [wink, setWink] = useState(false);
  const winkTimer = useRef(0);

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
    setPointer({
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    });
  };

  useEffect(() => {
    return () => window.clearTimeout(winkTimer.current);
  }, []);

  const handlePartClick = (part: PortraitPart) => {
    if (part === "eye-left" || part === "eye-right" || part === "glasses") {
      setWink(true);
      window.clearTimeout(winkTimer.current);
      winkTimer.current = window.setTimeout(() => setWink(false), 180);
    }
  };

  const effectivePointer = wink
    ? { x: pointer.x, y: Math.min(1, pointer.y + 0.35) }
    : pointer;

  return (
    <div
      ref={setRef}
      className={styles.portraitStage}
      data-intro="portrait"
      data-cursor="image"
      tabIndex={0}
      role="img"
      aria-label={`Interactive portrait of ${portfolio.headerTaglineTwo}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPointer({ x: 0.5, y: 0.5 });
        setActivePart(null);
      }}
      onFocus={() => setHovered(true)}
      onBlur={() => {
        setHovered(false);
        setActivePart(null);
      }}
      onPointerMove={(event) => syncPointer(event.clientX, event.clientY)}
    >
      <PortraitGlitchField hovered={hovered} pointer={pointer} />
      <div className={styles.portrait}>
        <PortraitAvatar
          className={styles.portraitCutout}
          src={portfolio.hero.portrait.src}
          pointer={effectivePointer}
          hovered={hovered}
          activePart={activePart}
          onPartEnter={setActivePart}
          onPartLeave={() => setActivePart(null)}
          onPartClick={handlePartClick}
        />
      </div>
      <p className={styles.portraitHint} aria-hidden={!hovered}>
        {activePart
          ? partLabel(activePart)
          : hovered
            ? "Poke the brackets, glasses, or sparks"
            : ""}
      </p>
    </div>
  );
}

function partLabel(part: PortraitPart) {
  switch (part) {
    case "bracket-left":
    case "bracket-right":
      return "< code brackets >";
    case "glasses":
      return "glasses";
    case "eye-left":
    case "eye-right":
      return "eyes follow you";
    case "hair":
      return "hair";
    case "beard":
      return "beard";
    case "sparks":
      return "idea sparks";
    case "head":
      return "hey.";
    default:
      return "";
  }
}
