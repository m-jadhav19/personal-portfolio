"use client";

import { useCallback } from "react";

import { smoothScrollTo } from "@/lib/smoothScroll";

export function useSmoothScroll() {
  return useCallback((id: string) => {
    smoothScrollTo(id);
  }, []);
}
