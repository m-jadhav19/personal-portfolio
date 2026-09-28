"use client";

import { useEffect, useState } from "react";

type LocalTimeProps = {
  timezone: string;
  label: string;
  className?: string;
};

export function LocalTime({ timezone, label, className }: LocalTimeProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let formatter: Intl.DateTimeFormat;
    try {
      formatter = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
        timeZone: timezone,
      });
    } catch {
      formatter = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      });
    }

    const update = () => setTime(formatter.format(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [timezone]);

  return (
    <p className={className}>
      <time suppressHydrationWarning>{time ?? "--:--:--"}</time>{" "}
      <span>{label}</span>
    </p>
  );
}
