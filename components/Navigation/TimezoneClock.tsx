"use client";

import { useEffect, useState } from "react";

import styles from "./TimezoneClock.module.css";

type TimezoneClockProps = {
  label: string;
  timezone: string;
  blinkOffset?: number;
};

function formatTime(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function TimezoneClock({
  label,
  timezone,
  blinkOffset = 0,
}: TimezoneClockProps) {
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    const update = () => setTime(formatTime(new Date(), timezone));
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [timezone]);

  const [hours, minutes] = time.split(":");

  return (
    <span
      className={styles.clock}
      style={{ ["--blink-offset" as string]: `${blinkOffset}ms` }}
    >
      {label} {hours}
      <span className={styles.colon}>:</span>
      {minutes}
    </span>
  );
}
