"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { gsap } from "gsap";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export function KonamiMelt() {
  const [isMelting, setIsMelting] = useState(false);
  const keySequenceRef = useRef<string[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const triggerMelt = useCallback(() => {
    if (isMelting) return;
    setIsMelting(true);

    const tl = gsap.timeline();
    timelineRef.current = tl;

    // Get all major page elements
    const pageElements = document.querySelectorAll(
      "main, nav, header, section, footer, [data-melt]"
    );
    const allTextElements = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, span, a, button, li"
    );

    // Show message first
    if (messageRef.current) {
      gsap.set(messageRef.current, { display: "flex" });
      tl.fromTo(
        messageRef.current,
        { opacity: 0, scale: 0.5, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }

    // Create drip elements for the melt effect
    const dripCount = 20;
    const drips: HTMLDivElement[] = [];

    for (let i = 0; i < dripCount; i++) {
      const drip = document.createElement("div");
      drip.className = "konami-drip";
      drip.style.cssText = `
        position: fixed;
        top: 0;
        left: ${(i / dripCount) * 100}%;
        width: ${100 / dripCount + 1}%;
        height: 0;
        background: linear-gradient(
          180deg,
          transparent 0%,
          rgba(var(--accent-rgb, 51, 154, 240), 0.3) 20%,
          rgba(var(--accent-rgb, 51, 154, 240), 0.6) 50%,
          rgba(0, 0, 0, 0.8) 100%
        );
        z-index: 9998;
        pointer-events: none;
      `;
      document.body.appendChild(drip);
      drips.push(drip);
    }

    // Animate drips falling
    tl.to(
      drips,
      {
        height: "120vh",
        duration: 2,
        ease: "power2.in",
        stagger: {
          each: 0.05,
          from: "random",
        },
      },
      0.3
    );

    // Text elements melt and drip
    tl.to(
      allTextElements,
      {
        y: () => gsap.utils.random(50, 200),
        opacity: 0,
        filter: "blur(4px)",
        skewY: () => gsap.utils.random(-5, 5),
        duration: 1.5,
        ease: "power2.in",
        stagger: {
          each: 0.02,
          from: "random",
        },
      },
      0.2
    );

    // Main sections melt with clip-path
    pageElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      
      // Add transform origin at top
      gsap.set(htmlEl, { transformOrigin: "top center" });

      tl.to(
        htmlEl,
        {
          clipPath: `polygon(
            0% 0%, 
            ${5 + Math.random() * 10}% ${20 + Math.random() * 30}%,
            ${15 + Math.random() * 10}% ${10 + Math.random() * 20}%,
            ${25 + Math.random() * 10}% ${30 + Math.random() * 40}%,
            ${35 + Math.random() * 10}% ${15 + Math.random() * 25}%,
            ${45 + Math.random() * 10}% ${35 + Math.random() * 45}%,
            ${55 + Math.random() * 10}% ${20 + Math.random() * 30}%,
            ${65 + Math.random() * 10}% ${40 + Math.random() * 50}%,
            ${75 + Math.random() * 10}% ${25 + Math.random() * 35}%,
            ${85 + Math.random() * 10}% ${45 + Math.random() * 55}%,
            ${95 + Math.random() * 5}% ${30 + Math.random() * 40}%,
            100% 0%,
            100% 100%,
            0% 100%
          )`,
          y: 50 + index * 20,
          scaleY: 1.1,
          filter: "blur(2px) saturate(2)",
          duration: 1.5,
          ease: "power2.in",
        },
        0.1 + index * 0.1
      );

      // Second phase - complete melt
      tl.to(
        htmlEl,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          y: "100vh",
          scaleY: 1.5,
          filter: "blur(8px) saturate(4)",
          opacity: 0,
          duration: 2,
          ease: "power3.in",
        },
        1.5 + index * 0.05
      );
    });

    // Color shift on body
    tl.to(
      document.body,
      {
        backgroundColor: "#000",
        duration: 2,
      },
      0.5
    );

    // Show reset button
    if (buttonRef.current) {
      tl.fromTo(
        buttonRef.current,
        { opacity: 0, y: 30, display: "none" },
        { opacity: 1, y: 0, display: "block", duration: 0.5, ease: "back.out(1.7)" },
        3
      );
    }

    // Pulsing glow effect on message
    if (messageRef.current) {
      tl.to(
        messageRef.current,
        {
          textShadow:
            "0 0 40px rgba(255, 255, 255, 1), 0 0 80px var(--accent-color, #339AF0), 0 0 120px var(--accent-color, #339AF0)",
          repeat: -1,
          yoyo: true,
          duration: 1,
          ease: "sine.inOut",
        },
        2
      );
    }

    // Clean up drips after animation
    tl.call(
      () => {
        drips.forEach((drip) => {
          gsap.to(drip, {
            opacity: 0,
            duration: 1,
            onComplete: () => drip.remove(),
          });
        });
      },
      [],
      4
    );
  }, [isMelting]);

  const handleReset = () => {
    window.location.reload();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code;

      keySequenceRef.current = [...keySequenceRef.current, key].slice(
        -KONAMI_CODE.length
      );

      if (
        keySequenceRef.current.length === KONAMI_CODE.length &&
        keySequenceRef.current.every((k, i) => k === KONAMI_CODE[i])
      ) {
        triggerMelt();
        keySequenceRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerMelt]);

  // Cleanup timeline on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <>
      {/* Message overlay */}
      <div
        ref={messageRef}
        className="fixed inset-0 z-[9999] items-center justify-center pointer-events-none hidden"
        style={{ display: "none" }}
      >
        <div className="text-center px-6">
          <h2
            className="font-space-grotesk text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            style={{
              textShadow:
                "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px var(--accent-color, #339AF0)",
            }}
          >
            🎮 KONAMI CODE ACTIVATED! 🎮
          </h2>
          <p className="text-white/80 text-lg md:text-xl font-inter">
            The screen is melting away...
          </p>
        </div>
      </div>

      {/* Reset button */}
      <button
        ref={buttonRef}
        onClick={handleReset}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-8 py-4 font-space-grotesk font-semibold text-white rounded-full transition-all duration-300 hover:scale-105 hidden"
        style={{
          background: "var(--accent-color, #339AF0)",
          boxShadow:
            "0 4px 30px rgba(var(--accent-rgb, 51, 154, 240), 0.5)",
          display: "none",
        }}
      >
        🔄 Restore Reality
      </button>
    </>
  );
}
