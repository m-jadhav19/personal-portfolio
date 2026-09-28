"use client";

import { useDogTownState } from "./dogTown/store";

type DogTownHudProps = {
  dogName: string;
  className?: string;
};

export function DogTownHud({ dogName, className }: DogTownHudProps) {
  const { mode, meters, bones, best, live } = useDogTownState();
  if (!live) return null;

  if (mode === "roam") {
    return (
      <p className={className} aria-live="off">
        <span>{dogName}</span>
        <span aria-hidden="true">·</span>
        <span>Tap to play</span>
        {best > 0 ? (
          <>
            <span aria-hidden="true">·</span>
            <span>Best {best.toLocaleString("en-US")} m</span>
          </>
        ) : null}
      </p>
    );
  }

  return (
    <p className={className} aria-live="off">
      <span>{dogName}</span>
      <span aria-hidden="true">·</span>
      <span>{meters.toLocaleString("en-US")} m</span>
      <span aria-hidden="true">·</span>
      <span>
        {bones} {bones === 1 ? "bone" : "bones"}
      </span>
      {best > 0 ? (
        <>
          <span aria-hidden="true">·</span>
          <span>Best {best.toLocaleString("en-US")} m</span>
        </>
      ) : null}
    </p>
  );
}
