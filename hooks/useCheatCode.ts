"use client";

import { useEffect, useRef } from "react";

type UseCheatCodeOptions = {
  code: string;
  onMatch: () => void;
  enabled?: boolean;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useCheatCode({
  code,
  onMatch,
  enabled = true,
}: UseCheatCodeOptions) {
  const bufferRef = useRef("");
  const onMatchRef = useRef(onMatch);

  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);

  useEffect(() => {
    if (!enabled || !code) return;

    const normalizedCode = code.toUpperCase();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length !== 1) return;

      const letter = event.key.toUpperCase();
      const next = (bufferRef.current + letter).slice(-normalizedCode.length);
      bufferRef.current = next;

      if (next === normalizedCode) {
        bufferRef.current = "";
        onMatchRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, enabled]);
}
