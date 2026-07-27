"use client";

import { useEffect, useRef } from "react";

type UseKeySequenceOptions = {
  sequence: readonly string[];
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

export function useKeySequence({
  sequence,
  onMatch,
  enabled = true,
}: UseKeySequenceOptions) {
  const bufferRef = useRef<string[]>([]);
  const onMatchRef = useRef(onMatch);

  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);

  useEffect(() => {
    if (!enabled || sequence.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      bufferRef.current = [...bufferRef.current, event.code].slice(
        -sequence.length,
      );

      const isMatch =
        bufferRef.current.length === sequence.length &&
        bufferRef.current.every((key, index) => key === sequence[index]);

      if (isMatch) {
        bufferRef.current = [];
        onMatchRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, sequence]);
}
