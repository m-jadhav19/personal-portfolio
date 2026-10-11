"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import { HERO_COMPLETE_EVENT, playHeroIntro } from "@/animations/hero";
import { bindMarqueeParallax } from "@/animations/marquee";
import { INTRO_COMPLETE_EVENT } from "@/animations/navigation";
import { useMyspaceTheme } from "@/components/EasterEggs/MyspaceThemeProvider";
import { portfolio } from "@/content/portfolio";

import { HeroMarquee } from "./HeroMarquee";
import { HeroMeta } from "./HeroMeta";
import { HeroPortrait } from "./HeroPortrait";
import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Hero() {
  const { isMyspace } = useMyspaceTheme();
  const lineOneRef = useRef<HTMLDivElement>(null);
  const lineTwoRef = useRef<HTMLDivElement>(null);
  const lineThreeRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLSpanElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const hasPlayedIntro = useRef(false);

  const marqueeLines = portfolio.hero.roles;

  useEffect(() => {
    const rows = [lineOneRef, lineTwoRef, lineThreeRef]
      .map((ref) => ref.current)
      .filter((row): row is HTMLDivElement => Boolean(row));

    const unsubscribeParallax = bindMarqueeParallax(rows);

    const runIntro = () => {
      if (hasPlayedIntro.current && process.env.NODE_ENV !== "development") {
        return;
      }
      hasPlayedIntro.current = true;

      playHeroIntro({
        marqueeLines: rows,
        portrait: portraitRef.current,
      });
    };

    if (document.documentElement.dataset.intro === "complete") {
      runIntro();
    } else {
      window.addEventListener(INTRO_COMPLETE_EVENT, runIntro, { once: true });
    }

    return () => {
      unsubscribeParallax();
      window.removeEventListener(INTRO_COMPLETE_EVENT, runIntro);
    };
  }, []);

  useGSAP(() => {
    const drift = driftRef.current;
    const floatEl = floatRef.current;
    const hero = heroRef.current;
    const cue = cueRef.current;
    if (!drift || !floatEl || !hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let idle: gsap.core.Tween | null = null;
    const startIdle = () => {
      idle?.kill();
      idle = gsap.to(floatEl, {
        y: 10,
        rotation: 1.8,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    };

    if (document.documentElement.dataset.hero === "complete") startIdle();
    else window.addEventListener(HERO_COMPLETE_EVENT, startIdle);

    const compact = window.matchMedia("(max-width: 767px)").matches;
    gsap.to(drift, {
      y: compact ? 28 : 56,
      x: compact ? -14 : -36,
      rotation: compact ? -4 : -8,
      scale: compact ? 0.97 : 0.94,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "center top",
        scrub: 0.55,
        onUpdate: (self) => {
          if (!cue) return;
          cue.style.opacity = String(Math.max(0, 0.55 * (1 - self.progress)));
        },
      },
    });

    return () => {
      window.removeEventListener(HERO_COMPLETE_EVENT, startIdle);
      idle?.kill();
      if (cue) cue.style.opacity = "";
    };
  }, { scope: heroRef });

  return (
    <section
      id="hero"
      ref={heroRef}
      className={`${styles.hero} ${isMyspace ? styles.heroMyspace : ""}`}
    >
      <div className={styles.stage}>
        <HeroMarquee
          lines={marqueeLines}
          lineRefs={[lineOneRef, lineTwoRef, lineThreeRef]}
          portrait={
            <HeroPortrait
              portraitRef={portraitRef}
              driftRef={driftRef}
              floatRef={floatRef}
            />
          }
        />
      </div>

      <div className={styles.footer}>
        <HeroMeta />
      </div>
      <span ref={cueRef} className={styles.scrollCue}>
        Scroll to explore
        <span className={styles.scrollCueChevron} aria-hidden="true" />
      </span>
    </section>
  );
}
