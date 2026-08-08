"use client";

import { useEffect, useRef, useState } from "react";

import { ScrambleText } from "@/components/About/ScrambleText";
import { portfolio } from "@/content/portfolio";

import { CapabilityRow } from "./CapabilityRow";
import { getNextOpenCapability } from "./capabilityAccordion";
import styles from "./Capabilities.module.css";

export function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      className={styles.capabilities}
    >
      <p className={styles.label}>
        <ScrambleText as="span" text="(Capabilities)" />
      </p>

      <div className={styles.list}>
        {portfolio.capabilities.map((capability, index) => {
          const align = index % 2 === 0 ? "left" : "right";

          return (
            <CapabilityRow
              key={capability.id}
              capability={capability}
              index={index}
              align={align}
              indent={align === "left" && index > 0}
              isInView={isInView}
              isActive={openId === capability.id}
              onToggle={() =>
                setOpenId((currentId) =>
                  getNextOpenCapability(currentId, capability.id),
                )
              }
            />
          );
        })}
      </div>

      <p className={styles.intro}>{portfolio.capabilitiesIntro}</p>
    </section>
  );
}
