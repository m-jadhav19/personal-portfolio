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
  DESTROY_CHEAT_CODE,
  KONAMI_CODE,
  MYSPACE_CHEAT_CODE,
  type EasterEggId,
} from "@/lib/easterEggs/codes";
import { isDestroyDesktop } from "@/lib/easterEggs/destroy/desktop";
import { resetScrollToTop } from "@/lib/lenis";
import { eggToMode, type SystemMode } from "@/lib/systemMode";

import { BrokenUxSimulator } from "./BrokenUxSimulator";
import {
  DestroyDesktopToast,
  DestroySiteSimulator,
} from "./DestroySiteSimulator";
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
  const [destroyToast, setDestroyToast] = useState<string | null>(null);
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
    setActiveEgg((current) => {
      if (current === "broken-ux") return null;
      if (current === "myspace") {
        applyMyspaceDom(false);
        clearOverlayTheme();
      }
      return "broken-ux";
    });
  }, [applyMyspaceDom]);

  const activateDestroy = useCallback(() => {
    if (!isDestroyDesktop()) {
      setDestroyToast(
        "Destroy mode is desktop-only — grab a mouse and try again.",
      );
      return;
    }

    // Don't start mid Myspace loader — midpoint would clobber destroy.
    if (isTransitioningRef.current || isShapeOverlayAnimating()) {
      setDestroyToast("Hold on — theme transition in progress. Try again.");
      return;
    }

    setActiveEgg((current) => {
      if (current === "destroy") return current;
      if (current === "myspace") {
        applyMyspaceDom(false);
        clearOverlayTheme();
      }
      return "destroy";
    });
  }, [applyMyspaceDom]);

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
      setActiveEgg((current) =>
        // Preserve destroy if it won a race against the loader.
        current === "destroy" ? current : "myspace",
      );
      return;
    }

    if (transitionDirection === "exit-myspace") {
      applyMyspaceDom(false);
      clearOverlayTheme();
      setActiveEgg((current) => (current === "destroy" ? current : null));
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

  useCheatCode({
    code: DESTROY_CHEAT_CODE,
    onMatch: activateDestroy,
  });

  // Keep data-mode / data-easter-egg in sync for non-Myspace eggs and idle default.
  useEffect(() => {
    applyModeDom(eggToMode(activeEgg));

    if (activeEgg === "broken-ux" || activeEgg === "destroy") {
      applyEasterEggDom(activeEgg);
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
    // Destroy owns Escape for its pause menu.
    if (activeEgg === "destroy") return;

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
      {activeEgg === "destroy" ? (
        <DestroySiteSimulator onExit={() => setActiveEgg(null)} />
      ) : null}
      {destroyToast ? (
        <DestroyDesktopToast
          message={destroyToast}
          onDismiss={() => setDestroyToast(null)}
        />
      ) : null}
    </SystemModeContext.Provider>
  );
}

/** @deprecated Use `SystemModeProvider` */
export const MyspaceThemeProvider = SystemModeProvider;
