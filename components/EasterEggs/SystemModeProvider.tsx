"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import type { ThemeTransitionDirection } from "@/components/Loader/themeLoaderMessages";
import { useCheatCode } from "@/hooks/useCheatCode";
import { useKeySequence } from "@/hooks/useKeySequence";
import {
  KONAMI_CODE,
  MYSPACE_CHEAT_CODE,
  type EasterEggId,
} from "@/lib/easterEggs/codes";
import { resetScrollToTop } from "@/lib/lenis";
import { eggToMode, type SystemMode } from "@/lib/systemMode";

import { BrokenUxSimulator } from "./BrokenUxSimulator";
import { EasterEggPrompts } from "./EasterEggPrompts";
import { Y2kMySpace } from "./Y2kMySpace";

type SystemModeContextValue = {
  mode: SystemMode;
  isEasterEggActive: boolean;
  isTransitioning: boolean;
  /** @deprecated Prefer `mode === "vice"` — kept for migration */
  isMyspace: boolean;
  toggleMyspace: () => void;
};

const SystemModeContext = createContext<SystemModeContextValue | null>(null);

export function useSystemMode() {
  const context = useContext(SystemModeContext);
  if (!context) {
    throw new Error("useSystemMode must be used within SystemModeProvider");
  }
  return context;
}

/** @deprecated Use `useSystemMode` */
export function useMyspaceTheme() {
  return useSystemMode();
}

type SystemModeProviderProps = {
  children: ReactNode;
};

function applyModeDom(mode: SystemMode) {
  document.documentElement.dataset.mode = mode;
}

function applyEasterEggDom(egg: EasterEggId | null) {
  const root = document.documentElement;
  if (egg) {
    root.dataset.easterEgg = egg;
    return;
  }
  delete root.dataset.easterEgg;
}

export function SystemModeProvider({ children }: SystemModeProviderProps) {
  const [activeEgg, setActiveEgg] = useState<EasterEggId | null>(null);
  const [transitionDirection, setTransitionDirection] =
    useState<ThemeTransitionDirection | null>(null);
  const isTransitioningRef = useRef(false);

  const mode = eggToMode(activeEgg);
  const isMyspace = mode === "vice";
  const isEasterEggActive = activeEgg !== null;
  const isTransitioning = transitionDirection !== null;

  const applyMyspaceDom = useCallback((enabled: boolean) => {
    if (enabled) {
      applyEasterEggDom("myspace");
      applyModeDom("vice");
      return;
    }
    applyEasterEggDom(null);
    applyModeDom("default");
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

  // Keep data-mode / data-easter-egg in sync for non-Myspace eggs and idle default.
  useEffect(() => {
    applyModeDom(eggToMode(activeEgg));

    if (activeEgg === "broken-ux") {
      applyEasterEggDom("broken-ux");
      return () => {
        applyEasterEggDom(null);
      };
    }

    if (activeEgg !== "myspace") {
      applyEasterEggDom(null);
    }
  }, [activeEgg]);

  useEffect(() => {
    applyModeDom("default");
  }, []);

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

  const value = useMemo(
    () => ({
      mode,
      isEasterEggActive,
      isTransitioning,
      isMyspace,
      toggleMyspace,
    }),
    [mode, isEasterEggActive, isTransitioning, isMyspace, toggleMyspace],
  );

  return (
    <SystemModeContext.Provider value={value}>
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
    </SystemModeContext.Provider>
  );
}

/** @deprecated Use `SystemModeProvider` */
export const MyspaceThemeProvider = SystemModeProvider;
