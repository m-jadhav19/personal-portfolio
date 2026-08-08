"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  clearOverlayTheme,
  isShapeOverlayAnimating,
  prefersReducedShapeMotion,
} from "@/animations/shapeOverlay";
import { ThemeTransitionLoader } from "@/components/Loader/ThemeTransitionLoader";
import { resetScrollToTop } from "@/lib/lenis";
import {
  KONAMI_CODE,
  MYSPACE_CHEAT_CODE,
  type EasterEggId,
} from "@/lib/easterEggs/codes";
import { useCheatCode } from "@/hooks/useCheatCode";
import { useKeySequence } from "@/hooks/useKeySequence";

import { BrokenUxSimulator } from "./BrokenUxSimulator";
import { EasterEggPrompts } from "./EasterEggPrompts";
import { Y2kMySpace } from "./Y2kMySpace";
import type { ThemeTransitionDirection } from "@/components/Loader/themeLoaderMessages";

type MyspaceThemeContextValue = {
  isMyspace: boolean;
  isTransitioning: boolean;
  toggleMyspace: () => void;
};

const MyspaceThemeContext = createContext<MyspaceThemeContextValue | null>(null);

export function useMyspaceTheme() {
  const context = useContext(MyspaceThemeContext);
  if (!context) {
    throw new Error("useMyspaceTheme must be used within MyspaceThemeProvider");
  }
  return context;
}

type MyspaceThemeProviderProps = {
  children: ReactNode;
};

export function MyspaceThemeProvider({ children }: MyspaceThemeProviderProps) {
  const [activeEgg, setActiveEgg] = useState<EasterEggId | null>(null);
  const [transitionDirection, setTransitionDirection] =
    useState<ThemeTransitionDirection | null>(null);
  const isTransitioningRef = useRef(false);

  const isMyspace = activeEgg === "myspace";
  const isTransitioning = transitionDirection !== null;

  const applyMyspaceDom = useCallback((enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.dataset.easterEgg = "myspace";
      return;
    }
    delete root.dataset.easterEgg;
  }, []);

  const finishTransition = useCallback(() => {
    setTransitionDirection(null);
    isTransitioningRef.current = false;
  }, []);

  const toggleBrokenUx = useCallback(() => {
    setActiveEgg((current) => (current === "broken-ux" ? null : "broken-ux"));
  }, []);

  const toggleMyspace = useCallback(() => {
    if (isTransitioningRef.current || isShapeOverlayAnimating()) return;

    const isOpen = activeEgg === "myspace";

    if (prefersReducedShapeMotion()) {
      resetScrollToTop();
      if (isOpen) {
        applyMyspaceDom(false);
        setActiveEgg(null);
      } else {
        applyMyspaceDom(true);
        setActiveEgg("myspace");
      }
      return;
    }

    isTransitioningRef.current = true;
    setTransitionDirection(isOpen ? "exit-myspace" : "enter-myspace");
  }, [activeEgg, applyMyspaceDom]);

  const handleMidpoint = useCallback(async () => {
    resetScrollToTop();

    if (transitionDirection === "enter-myspace") {
      applyMyspaceDom(true);
      setActiveEgg("myspace");
      return;
    }

    if (transitionDirection === "exit-myspace") {
      applyMyspaceDom(false);
      setActiveEgg(null);
      clearOverlayTheme();
    }
  }, [applyMyspaceDom, transitionDirection]);

  useKeySequence({
    sequence: KONAMI_CODE,
    onMatch: toggleBrokenUx,
  });

  useCheatCode({
    code: MYSPACE_CHEAT_CODE,
    onMatch: () => {
      void toggleMyspace();
    },
  });

  useEffect(() => {
    const root = document.documentElement;

    if (activeEgg === "broken-ux") {
      root.dataset.easterEgg = "broken-ux";
      return () => {
        delete root.dataset.easterEgg;
      };
    }

    if (activeEgg !== "myspace") {
      delete root.dataset.easterEgg;
    }
  }, [activeEgg]);

  useEffect(() => {
    if (!activeEgg) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeEgg === "myspace") {
          toggleMyspace();
          return;
        }
        setActiveEgg(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeEgg, toggleMyspace]);

  return (
    <MyspaceThemeContext.Provider
      value={{ isMyspace, isTransitioning, toggleMyspace }}
    >
      {children}
      <EasterEggPrompts paused={activeEgg !== null} />
      {transitionDirection ? (
        <ThemeTransitionLoader
          direction={transitionDirection}
          onMidpoint={handleMidpoint}
          onComplete={finishTransition}
        />
      ) : null}
      {activeEgg === "broken-ux" ? (
        <BrokenUxSimulator onExit={() => setActiveEgg(null)} />
      ) : null}
      {activeEgg === "myspace" ? (
        <Y2kMySpace onExit={toggleMyspace} />
      ) : null}
    </MyspaceThemeContext.Provider>
  );
}
