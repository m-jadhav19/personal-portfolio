"use client";

import { useDogTownState } from "./dogTown/store";

type DogTownHudProps = {
  dogName: string;
  className?: string;
};

export function DogTownHud({ dogName, className }: DogTownHudProps) {
  const { meters, bones, live } = useDogTownState();
  if (!live) return null;

  return (
    <p className={className} aria-live="off">
      <span>{dogName}</span>
      <span aria-hidden="true">·</span>
      <span>{meters.toLocaleString("en-US")} m</span>
      <span aria-hidden="true">·</span>
      <span>
        {bones} {bones === 1 ? "bone" : "bones"}
      </span>
    </p>
  );
}
