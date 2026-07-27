"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getLenis, getScrollY, scrollByDelta } from "@/lib/lenis";

import styles from "./BrokenUxSimulator.module.css";

type BrokenUxSimulatorProps = {
  onExit: () => void;
};

type Toast = {
  id: number;
  message: string;
};

type ModalState = {
  message: string;
  onConfirm: () => void;
};

type AdPopup = {
  id: number;
  title: string;
  body: string;
  cta: string;
  slot: number;
  accent: string;
};

type ScrollMode = "normal" | "inverted" | "chaotic" | "sideways" | "sticky";

const SCROLL_MESSAGES = [
  "Are you sure you want to scroll? This action cannot be undone.",
  "Scrolling requires a premium subscription. Continue anyway?",
  "Warning: content below may contain more portfolio.",
  "Your scroll has been queued. Estimated wait: 4–6 business days.",
  "Did you mean to scroll? Most users prefer the hero section.",
  "Scroll inverted for your safety. You're welcome.",
  "Our AI detected suspicious scrolling behavior.",
];

const CLICK_MESSAGES = [
  "Installing update 3 of 47… Please do not click anything.",
  "This button is feeling shy today. Try again?",
  "Error 0xBADUX: Intent unclear. Please re-click with confidence.",
  "Hold on — we're generating a loading spinner for this click.",
  "Are you REALLY sure? Think about your choices.",
];

const TOAST_MESSAGES = [
  "Tip: buttons work better when you don't click them.",
  "Memory leak detected in your patience.",
  "Clippy would like to help you scroll.",
  "Your click has been forwarded to /dev/null.",
  "UX team has left the chat.",
  "Scroll direction randomized for security.",
  "New ad loading… please wait.",
  "Your scroll wheel has been patched.",
];

const AD_TEMPLATES: Omit<AdPopup, "id" | "slot">[] = [
  {
    title: "CONGRATULATIONS!",
    body: "You are our 1,000,000th visitor! Claim your FREE iPod Nano NOW!!!",
    cta: "CLAIM PRIZE",
    accent: "#c000c0",
  },
  {
    title: "VIRUS DETECTED",
    body: "47 threats found on your portfolio. Mandar Antivirus™ can fix this in 3 easy payments.",
    cta: "SCAN NOW",
    accent: "#cc0000",
  },
  {
    title: "DOWNLOAD RAM",
    body: "Your browser is running low on RAM. Download 16GB instantly. 100% legit.",
    cta: "DOWNLOAD",
    accent: "#008000",
  },
  {
    title: "HOT SINGLES",
    body: "Frontend developers in Mumbai want to pair program with YOU tonight.",
    cta: "MEET THEM",
    accent: "#cc6600",
  },
  {
    title: "YOU WON!",
    body: "Mandar has selected you for an exclusive NFT of his resume. Gas fees apply.",
    cta: "MINT NOW",
    accent: "#6600cc",
  },
  {
    title: "SPONSORED",
    body: "Tired of good UX? Try Broken UX Simulator PRO™ — now with 200% more modals.",
    cta: "SUBSCRIBE",
    accent: "#0000cc",
  },
  {
    title: "COOKIES!!!",
    body: "We use cookies, trackers, pixels, vibes, and your hopes and dreams.",
    cta: "ACCEPT ALL",
    accent: "#996600",
  },
  {
    title: "MAKE $5000/DAY",
    body: "Work from home scrolling inverted! Recruiters HATE this one trick.",
    cta: "LEARN MORE",
    accent: "#008888",
  },
];

const SCROLL_MODE_META: Record<
  ScrollMode,
  { label: string; short: string; tone: string }
> = {
  normal: { label: "Normal (temporary)", short: "NORMAL", tone: "modeNormal" },
  inverted: { label: "Inverted scroll", short: "INVERTED", tone: "modeInverted" },
  chaotic: { label: "Chaotic scroll", short: "CHAOTIC", tone: "modeChaotic" },
  sideways: { label: "Sideways scroll", short: "SIDEWAYS", tone: "modeSideways" },
  sticky: { label: "Sticky / fighting back", short: "STICKY", tone: "modeSticky" },
};

const AD_SLOTS = [
  { x: 4, y: 14 },
  { x: 58, y: 16 },
  { x: 30, y: 38 },
  { x: 62, y: 48 },
  { x: 6, y: 52 },
  { x: 42, y: 24 },
];

const RUNAWAY_SELECTOR = "a, button, [role='button']";
const MAX_ADS = 5;

function pickScrollMode(current: ScrollMode): ScrollMode {
  const roll = Math.random();
  if (current === "inverted" && roll < 0.45) return "inverted";
  if (roll < 0.4) return "inverted";
  if (roll < 0.55) return "chaotic";
  if (roll < 0.7) return "sticky";
  if (roll < 0.85) return "sideways";
  return "normal";
}

export function BrokenUxSimulator({ onExit }: BrokenUxSimulatorProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [spinnerMessage, setSpinnerMessage] = useState<string | null>(null);
  const [ads, setAds] = useState<AdPopup[]>([]);
  const [scrollMode, setScrollMode] = useState<ScrollMode>("inverted");
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [cursorTip, setCursorTip] = useState<{ x: number; y: number; text: string } | null>(
    null,
  );
  const [modeFlash, setModeFlash] = useState(false);

  const toastIdRef = useRef(0);
  const adIdRef = useRef(0);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const bypassClickRef = useRef(false);
  const scrollModeRef = useRef<ScrollMode>("inverted");
  const lastScrollYRef = useRef(0);
  const usedSlotsRef = useRef<Set<number>>(new Set());

  const pushToast = useCallback((message: string) => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current.slice(-3), { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const flashMode = useCallback(() => {
    setModeFlash(true);
    window.setTimeout(() => setModeFlash(false), 500);
  }, []);

  const showSpinner = useCallback((message: string, duration = 1400) => {
    setSpinnerMessage(message);
    window.setTimeout(() => setSpinnerMessage(null), duration);
  }, []);

  const spawnAd = useCallback(() => {
    const template =
      AD_TEMPLATES[Math.floor(Math.random() * AD_TEMPLATES.length)];

    const availableSlots = AD_SLOTS.map((_, index) => index).filter(
      (index) => !usedSlotsRef.current.has(index),
    );
    const slot =
      availableSlots.length > 0
        ? availableSlots[Math.floor(Math.random() * availableSlots.length)]
        : Math.floor(Math.random() * AD_SLOTS.length);

    usedSlotsRef.current.add(slot);

    const ad: AdPopup = {
      ...template,
      id: ++adIdRef.current,
      slot,
    };

    setAds((current) => {
      const next = [...current, ad];
      if (next.length > MAX_ADS) {
        const removed = next.shift();
        if (removed) usedSlotsRef.current.delete(removed.slot);
      }
      return next;
    });
  }, []);

  const dismissAd = useCallback(
    (id: number, slot: number) => {
      usedSlotsRef.current.delete(slot);
      setAds((current) => current.filter((ad) => ad.id !== id));

      if (Math.random() > 0.4) {
        window.setTimeout(() => {
          pushToast("Ad closed. Opening 2 more ads…");
          spawnAd();
          window.setTimeout(spawnAd, 350);
        }, 250);
      }
    },
    [pushToast, spawnAd],
  );

  const dodgeNoButton = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = noButtonRef.current;
    if (!button) return;

    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 140;
    button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    event.preventDefault();
  }, []);

  const applyScroll = useCallback((deltaY: number, deltaX: number) => {
    const mode = scrollModeRef.current;
    let top = deltaY;
    let left = deltaX;

    switch (mode) {
      case "inverted":
        top = -deltaY;
        break;
      case "chaotic":
        top = (Math.random() > 0.5 ? 1 : -1) * Math.abs(deltaY) * 1.5;
        left = (Math.random() - 0.5) * Math.abs(deltaY) * 0.8;
        break;
      case "sideways":
        top = deltaY * 0.1;
        left = deltaY * 1.4;
        break;
      case "sticky": {
        const fightingBack = Math.random() > 0.35;
        top = fightingBack ? -deltaY * 0.9 : deltaY * 0.2;
        if (fightingBack && Math.abs(getScrollY() - lastScrollYRef.current) < 2) {
          top = -deltaY * 1.6;
        }
        break;
      }
      default:
        break;
    }

    scrollByDelta(top, left);
    lastScrollYRef.current = getScrollY();

    if ((mode === "chaotic" || mode === "sticky") && Math.random() > 0.65) {
      const snapBack = -top * (0.35 + Math.random() * 0.4);
      window.setTimeout(() => scrollByDelta(snapBack), 90 + Math.random() * 100);
    }
  }, []);

  useEffect(() => {
    scrollModeRef.current = scrollMode;
  }, [scrollMode]);

  useEffect(() => {
    document.body.classList.add("easter-egg-broken-ux-active");

    const lenis = getLenis();
    lenis?.stop();

    const interactiveElements = Array.from(
      document.querySelectorAll<HTMLElement>(RUNAWAY_SELECTOR),
    );

    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      if (target.closest("[data-broken-ux-ignore]")) return;
      if (Math.random() > 0.35) return;

      const dx = (Math.random() - 0.5) * 110;
      const dy = (Math.random() - 0.5) * 85;
      target.classList.add("broken-ux-runaway");
      target.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", handleMouseEnter);
    });

    const handleWheel = (event: WheelEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("[data-broken-ux-ignore]")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (Math.random() < 0.1) {
        const message =
          SCROLL_MESSAGES[Math.floor(Math.random() * SCROLL_MESSAGES.length)];

        setModal({
          message,
          onConfirm: () => {
            setModal(null);
            applyScroll(event.deltaY, event.deltaX);
          },
        });
        return;
      }

      applyScroll(event.deltaY, event.deltaX);
    };

    const handleClick = (event: MouseEvent) => {
      if (bypassClickRef.current) {
        bypassClickRef.current = false;
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target?.closest(RUNAWAY_SELECTOR)) return;
      if (target.closest("[data-broken-ux-ignore]")) return;
      if (Math.random() > 0.42) return;

      event.preventDefault();
      event.stopPropagation();

      const message =
        CLICK_MESSAGES[Math.floor(Math.random() * CLICK_MESSAGES.length)];

      if (Math.random() > 0.45) {
        showSpinner(message);
        if (Math.random() > 0.5) spawnAd();
        return;
      }

      setModal({
        message,
        onConfirm: () => {
          setModal(null);
          bypassClickRef.current = true;
          target.click();
        },
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (Math.random() > 0.975) {
        const tips = [
          "Did you know? Scrolling is optional.",
          "This tooltip is sponsored by Bad UX Inc.",
          "Your mouse is being monitored for quality assurance.",
          "Try clicking harder.",
          "Have you tried turning it off and on again?",
        ];
        setCursorTip({
          x: event.clientX + 14,
          y: event.clientY + 14,
          text: tips[Math.floor(Math.random() * tips.length)],
        });
        window.setTimeout(() => setCursorTip(null), 1600);
      }
    };

    const toastInterval = window.setInterval(() => {
      if (Math.random() > 0.38) return;
      const message =
        TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)];
      pushToast(message);
    }, 4000);

    const adInterval = window.setInterval(() => {
      if (Math.random() > 0.3) return;
      spawnAd();
    }, 3200);

    const scrollModeInterval = window.setInterval(() => {
      const nextMode = pickScrollMode(scrollModeRef.current);
      scrollModeRef.current = nextMode;
      setScrollMode(nextMode);
      flashMode();
      pushToast(`Scroll mode → ${SCROLL_MODE_META[nextMode].label}`);
    }, 9000);

    const downloadInterval = window.setInterval(() => {
      if (Math.random() > 0.45) return;

      let progress = 0;
      setDownloadProgress(0);

      const tick = window.setInterval(() => {
        progress += 4 + Math.random() * 16;
        if (progress >= 100) {
          progress = 100;
          window.clearInterval(tick);
          window.setTimeout(() => setDownloadProgress(null), 1000);
        }
        setDownloadProgress(Math.min(progress, 100));
      }, 220);
    }, 14000);

    document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    document.addEventListener("click", handleClick, true);
    window.addEventListener("mousemove", handleMouseMove);

    pushToast("Broken UX Simulator activated. Scroll is inverted.");
    spawnAd();

    return () => {
      document.body.classList.remove("easter-egg-broken-ux-active");
      lenis?.start();
      usedSlotsRef.current = new Set();

      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.classList.remove("broken-ux-runaway");
        element.style.transform = "";
      });
      document.removeEventListener("wheel", handleWheel, true);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("mousemove", handleMouseMove);
      window.clearInterval(toastInterval);
      window.clearInterval(adInterval);
      window.clearInterval(scrollModeInterval);
      window.clearInterval(downloadInterval);
    };
  }, [applyScroll, flashMode, pushToast, showSpinner, spawnAd]);

  const modeMeta = SCROLL_MODE_META[scrollMode];

  return (
    <div className={styles.overlay} aria-live="polite">
      {modeFlash ? <div className={styles.modeFlash} aria-hidden="true" /> : null}

      <header className={styles.hud} data-broken-ux-ignore>
        <div className={styles.hudBrand}>
          <span className={styles.hudIcon}>⚠</span>
          <div>
            <p className={styles.hudTitle}>Broken UX Simulator</p>
            <p className={styles.hudSubtitle}>Konami code accepted</p>
          </div>
        </div>

        <div
          className={`${styles.modePill} ${styles[modeMeta.tone]}`}
          title={modeMeta.label}
        >
          <span className={styles.modeDot} />
          {modeMeta.short}
        </div>

        <div className={styles.hudStats}>
          <span>{ads.length} ads</span>
          <span>{toasts.length} alerts</span>
        </div>

        <button type="button" className={styles.exitButton} onClick={onExit}>
          Exit <kbd>ESC</kbd>
        </button>
      </header>

      {downloadProgress !== null ? (
        <div className={styles.downloadBar} data-broken-ux-ignore>
          <span className={styles.downloadLabel}>more_scroll.exe</span>
          <div className={styles.downloadTrack}>
            <div
              className={styles.downloadFill}
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <span className={styles.downloadPercent}>{Math.round(downloadProgress)}%</span>
        </div>
      ) : null}

      <div className={styles.toastStack}>
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            <span className={styles.toastIcon}>!</span>
            {toast.message}
          </div>
        ))}
      </div>

      {ads.map((ad, index) => {
        const slot = AD_SLOTS[ad.slot] ?? AD_SLOTS[0];
        return (
          <div
            key={ad.id}
            className={styles.adPopup}
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              zIndex: 10068 + index,
            }}
            data-broken-ux-ignore
          >
            <div className={styles.adTitleBar} style={{ background: ad.accent }}>
              <span className={styles.adTitle}>{ad.title}</span>
              <div className={styles.adWindowControls}>
                <button type="button" className={styles.adWinBtn} aria-hidden="true">
                  _
                </button>
                <button
                  type="button"
                  className={styles.adWinBtn}
                  onClick={() => dismissAd(ad.id, ad.slot)}
                  onMouseEnter={(event) => {
                    const button = event.currentTarget;
                    button.style.transform = `translate(${(Math.random() - 0.5) * 50}px, ${(Math.random() - 0.5) * 30}px)`;
                  }}
                  aria-label="Close ad"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className={styles.adContent}>
              <p className={styles.adBody}>{ad.body}</p>
              <button
                type="button"
                className={styles.adCta}
                style={{ background: ad.accent }}
                onClick={() => {
                  pushToast("Ad clicked. Installing toolbar…");
                  spawnAd();
                }}
              >
                {ad.cta}
              </button>
            </div>
          </div>
        );
      })}

      {cursorTip ? (
        <div
          className={styles.cursorTip}
          style={{ left: cursorTip.x, top: cursorTip.y }}
          aria-hidden="true"
        >
          {cursorTip.text}
        </div>
      ) : null}

      <div className={styles.cookieBanner} data-broken-ux-ignore>
        <div className={styles.cookieIcon}>🍪</div>
        <p className={styles.cookieText}>
          We use cookies, localStorage, your soul, and <strong>inverted scrolling</strong>.
          By continuing you agree to everything forever.
        </p>
        <div className={styles.cookieActions}>
          <button
            type="button"
            className={styles.cookieReject}
            onClick={() => pushToast("Reject ignored. Cookies installed anyway.")}
          >
            Reject all
          </button>
          <button
            type="button"
            className={styles.cookieAccept}
            onClick={() => {
              pushToast("Thanks! Here's another ad.");
              spawnAd();
            }}
          >
            Accept all
          </button>
          <button
            type="button"
            className={styles.cookieClose}
            onMouseEnter={(event) => {
              event.currentTarget.style.opacity = "0.15";
              window.setTimeout(() => {
                event.currentTarget.style.opacity = "1";
              }, 500);
            }}
            onClick={() => pushToast("You cannot escape the cookies.")}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {spinnerMessage ? (
        <div className={styles.spinnerOverlay} data-broken-ux-ignore>
          <div className={styles.spinnerCard}>
            <div className={styles.spinner} />
            {spinnerMessage}
          </div>
        </div>
      ) : null}

      {modal ? (
        <div className={styles.modalBackdrop} data-broken-ux-ignore>
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.modalTitleBar}>
              <span>Windows Portfolio Experience</span>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.modalBody}>{modal.message}</p>
              <div className={styles.modalActions}>
                <button
                  ref={noButtonRef}
                  type="button"
                  className={`${styles.modalButton} ${styles.runawayNo}`}
                  onMouseEnter={dodgeNoButton}
                  onClick={dodgeNoButton}
                >
                  No
                </button>
                <button
                  type="button"
                  className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                  onClick={modal.onConfirm}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
