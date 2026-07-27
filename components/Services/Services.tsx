"use client";

import { useEffect, useRef, useState } from "react";

import { portfolio } from "@/content/portfolio";

import { ServiceRow } from "./ServiceRow";
import { getNextOpenService } from "./serviceAccordion";
import styles from "./Services.module.css";

export function Services() {
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
    <section id="services" ref={sectionRef} className={styles.services}>
      <p className={styles.label}>(Services)</p>

      <div className={styles.list}>
        {portfolio.services.map((service, index) => {
          const align = index % 2 === 0 ? "left" : "right";

          return (
            <ServiceRow
              key={service.id}
              service={service}
              index={index}
              align={align}
              indent={align === "left" && index > 0}
              isInView={isInView}
              isActive={openId === service.id}
              onToggle={() =>
                setOpenId((currentId) =>
                  getNextOpenService(currentId, service.id),
                )
              }
            />
          );
        })}
      </div>

      <p className={styles.intro}>{portfolio.servicesIntro}</p>
    </section>
  );
}
