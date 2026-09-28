"use client";

import { useEffect, useRef, useState } from "react";

import { createSticker, type StickerInstance } from "sticker-forge-react/core";

import { portfolio } from "@/content/portfolio";

import {
  PortraitAvatar,
  type PortraitPart,
} from "./PortraitAvatar";
import styles from "./Hero.module.css";

type HeroPortraitProps = {
  portraitRef?: React.Ref<HTMLDivElement>;
};

type PointerState = { x: number; y: number };

export function HeroPortrait({ portraitRef }: HeroPortraitProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const stickerHostRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<StickerInstance | null>(null);
  const [pointer, setPointer] = useState<PointerState>({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [activePart, setActivePart] = useState<PortraitPart | null>(null);
  const [wink, setWink] = useState(false);
  const [stickerReady, setStickerReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const winkTimer = useRef(0);
  const peelResetTimer = useRef(0);

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
    return () => {
      window.clearTimeout(winkTimer.current);
      window.clearTimeout(peelResetTimer.current);
    };
  }, []);

  // Mount Sticker Forge (peelable die-cut sticker). Falls back to the static
  // interactive SVG if WebGL / reduced-motion isn't available.
  useEffect(() => {
    const host = stickerHostRef.current;
    if (!host) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      setUseFallback(true);
      return;
    }

    let cancelled = false;
    let instance: StickerInstance | null = null;

    const portraitUrl = new URL(
      "/images/mandar-portrait.png",
      window.location.origin,
    ).href;

    void (async () => {
      try {
        instance = await createSticker(host, {
          source: {
            type: "image",
            src: portraitUrl,
            name: "mandar-portrait",
          },
          outline: { width: 0, color: "#f5f0e0" },
          shadow: {
            opacity: 0.34,
            blur: 28,
            distance: 18,
            angle: 48,
            color: "#000000",
          },
          peel: {
            radius: 0.14,
            stiffness: 0.7,
            maxAngle: 3.2,
            grabWidth: 48,
            release: "reset",
          },
          back: { color: "#f5f0e0", gloss: 0.55, roughness: 0.4 },
          sound: { enabled: false },
          interaction: {
            grabFrom: "any",
            peelToward: "free",
            threshold: 0.78,
          },
          layout: { fit: "contain" },
          motion: "system",
          tilt: -2,
          quality: "high",
        });

        if (cancelled) {
          instance.destroy();
          return;
        }

        stickerRef.current = instance;
        setStickerReady(true);
      } catch {
        if (!cancelled) setUseFallback(true);
      }
    })();

    const onResize = () => stickerRef.current?.resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      stickerRef.current?.destroy();
      stickerRef.current = null;
    };
  }, []);

  const handlePartClick = (part: PortraitPart) => {
    if (part === "eye-left" || part === "eye-right" || part === "glasses") {
      setWink(true);
      window.clearTimeout(winkTimer.current);
      winkTimer.current = window.setTimeout(() => setWink(false), 180);
    }
    if (part === "bracket-left" || part === "bracket-right") {
      // Nudge a tiny peel as feedback when poking brackets.
      stickerRef.current?.setPeelProgress(0.12, {
        origin: { x: part === "bracket-left" ? 0.08 : 0.92, y: 0.45 },
        target: { x: 0.5, y: 0.5 },
      });
      window.clearTimeout(peelResetTimer.current);
      peelResetTimer.current = window.setTimeout(
        () => stickerRef.current?.reset(),
        420,
      );
    }
    if (part === "sparks") {
      stickerRef.current?.reappear();
    }
  };

  const effectivePointer = wink
    ? { x: pointer.x, y: Math.min(1, pointer.y + 0.35) }
    : pointer;

  const showOverlay = stickerReady && !useFallback;

  return (
    <div
      ref={setRef}
      className={styles.portraitStage}
      data-intro="portrait"
      data-cursor="image"
      data-sticker={showOverlay ? "ready" : useFallback ? "fallback" : "loading"}
      tabIndex={0}
      role="img"
      aria-label={`Interactive sticker portrait of ${portfolio.headerTaglineTwo}. Drag an edge to peel.`}
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
      <div className={styles.stickerStack}>
        <div
          ref={stickerHostRef}
          className={styles.stickerHost}
          aria-hidden={useFallback || !stickerReady}
          data-ready={stickerReady || undefined}
          data-hidden={useFallback || undefined}
        />

        <div className={styles.portrait}>
          <PortraitAvatar
            className={styles.portraitCutout}
            src={portfolio.hero.portrait.src}
            variant={showOverlay ? "overlay" : "full"}
            pointer={effectivePointer}
            hovered={hovered}
            activePart={activePart}
            onPartEnter={setActivePart}
            onPartLeave={() => setActivePart(null)}
            onPartClick={handlePartClick}
          />
        </div>
      </div>

      <p className={styles.portraitHint} aria-hidden={!hovered}>
        {activePart
          ? partLabel(activePart)
          : hovered
            ? "Peel an edge · poke brackets, glasses, sparks"
            : ""}
      </p>
    </div>
  );
}

function partLabel(part: PortraitPart) {
  switch (part) {
    case "bracket-left":
    case "bracket-right":
      return "< peel me >";
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
