"use client";

import { portfolio } from "@/content/portfolio";

import styles from "./TechTicker.module.css";

const REPEAT = 4;

function TickerRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const sequence = Array.from({ length: REPEAT }, () => items).flat();

  return (
    <div
      className={`${styles.row} ${reverse ? styles.rowReverse : ""}`}
      aria-hidden="true"
    >
      <div className={styles.track}>
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`} className={styles.item}>
            {item}
            <span className={styles.sep}>/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechTicker() {
  const items = portfolio.techTicker;
  const mid = Math.ceil(items.length / 2);
  const rowOne = items.slice(0, mid);
  const rowTwo = items.slice(mid);

  return (
    <section className={styles.ticker} aria-label="Technologies">
      <TickerRow items={rowOne} />
      <TickerRow items={rowTwo.length > 0 ? rowTwo : items} reverse />
    </section>
  );
}
