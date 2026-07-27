"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  x: number;
  y: number;
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

const AD_TEMPLATES: Omit<AdPopup, "id" | "x" | "y">[] = [
  {
    title: "🎉 CONGRATULATIONS!",
    body: "You are our 1,000,000th visitor! Claim your FREE iPod Nano NOW!!!",
    cta: "CLAIM PRIZE",
    accent: "#ff00ff",
  },
  {
    title: "⚠️ VIRUS DETECTED",
    body: "47 threats found on your portfolio. Mandar Antivirus™ can fix this in 3 easy payments.",
    cta: "SCAN NOW",
    accent: "#ff3b30",
  },
  {
    title: "💾 DOWNLOAD RAM",
    body: "Your browser is running low on RAM. Download 16GB instantly. 100% legit.",
    cta: "DOWNLOAD",
    accent: "#00aa00",
  },
  {
    title: "🔥 HOT SINGLES",
    body: "Frontend developers in Mumbai want to pair program with YOU tonight.",
    cta: "MEET THEM",
    accent: "#ff6600",
  },
  {
    title: "🏆 YOU WON!",
    body: "Mandar has selected you for an exclusive NFT of his resume. Gas fees apply.",
    cta: "MINT NOW",
    accent: "#9900ff",
  },
  {
    title: "📢 SPONSORED",
    body: "Tired of good UX? Try Broken UX Simulator PRO™ — now with 200% more modals.",
    cta: "SUBSCRIBE",
    accent: "#0066ff",
  },
  {
    title: "🍪 COOKIES!!!",
    body: "We use cookies, trackers, pixels, vibes, and your hopes and dreams.",
    cta: "ACCEPT ALL",
    accent: "#cc9900",
  },
  {
    title: "💰 MAKE $5000/DAY",
    body: "Work from home scrolling inverted! Recruiters HATE this one trick.",
    cta: "LEARN MORE",
    accent: "#00cccc",
  },
];

const SCROLL_MODE_LABELS: Record<ScrollMode, string> = {
  normal: "Scroll: Normal (for now…)",
  inverted: "Scroll: INVERTED ↕️",
  chaotic: "Scroll: CHAOTIC 🎲",
  sideways: "Scroll: SIDEWAYS ↔️",
  sticky: "Scroll: STICKY 🧲",
};

const RUNAWAY_SELECTOR = "a, button, [role='button']";
const MAX_ADS = 6;

function pickScrollMode(): ScrollMode {
  const roll = Math.random();
  if (roll < 0.3) return "inverted";
  if (roll < 0.5) return "chaotic";
  if (roll < 0.65) return "sideways";
  if (roll < 0.8) return "sticky";
  return "normal";
}

export function BrokenUxSimulator({ onExit }: BrokenUxSimulatorProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [spinnerMessage, setSpinnerMessage] = useState<string | null>(null);
  const [ads, setAds] = useState<AdPopup[]>([]);
  const [scrollMode, setScrollMode] = useState<ScrollMode>("inverted");
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [cursorTip, setCursorTip] = useState<{ x: number; y: number; text: string } | null>(
    null,
  );

  const toastIdRef = useRef(0);
  const adIdRef = useRef(0);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const bypassClickRef = useRef(false);
  const scrollModeRef = useRef<ScrollMode>("inverted");
  const lastScrollYRef = useRef(0);

  const pushToast = useCallback((message: string) => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current.slice(-4), { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const showSpinner = useCallback((message: string, duration = 1400) => {
    setSpinnerMessage(message);
    window.setTimeout(() => setSpinnerMessage(null), duration);
  }, []);

  const spawnAd = useCallback(() => {
    const template =
      AD_TEMPLATES[Math.floor(Math.random() * AD_TEMPLATES.length)];

    const ad: AdPopup = {
      ...template,
      id: ++adIdRef.current,
      x: 5 + Math.random() * 55,
      y: 12 + Math.random() * 50,
    };

    setAds((current) => [...current.slice(-(MAX_ADS - 1)), ad]);
  }, []);

  const dismissAd = useCallback(
    (id: number) => {
      setAds((current) => current.filter((ad) => ad.id !== id));

      if (Math.random() > 0.35) {
        window.setTimeout(() => {
          pushToast("Ad closed. Opening 2 more ads…");
          spawnAd();
          window.setTimeout(spawnAd, 400);
        }, 300);
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

  const applyScroll = useCallback(
    (deltaY: number, deltaX: number) => {
      const mode = scrollModeRef.current;
      let top = deltaY;
      let left = deltaX;

      switch (mode) {
        case "inverted":
          top = -deltaY;
          break;
        case "chaotic":
          top = (Math.random() > 0.5 ? 1 : -1) * Math.abs(deltaY) * 1.4;
          left = (Math.random() - 0.5) * Math.abs(deltaY) * 0.6;
          break;
        case "sideways":
          top = deltaY * 0.15;
          left = deltaY * 1.2;
          break;
        case "sticky": {
          const currentY = window.scrollY;
          const fightingBack = Math.random() > 0.4;
          top = fightingBack ? -deltaY * 0.85 : deltaY * 0.25;
          if (fightingBack && Math.abs(currentY - lastScrollYRef.current) < 2) {
            top = -deltaY * 1.5;
          }
          break;
        }
        default:
          break;
      }

      window.scrollBy({ top, left, behavior: "auto" });
      lastScrollYRef.current = window.scrollY;

      if (Math.random() > 0.72) {
        const snapBack = -top * (0.4 + Math.random() * 0.5);
        window.setTimeout(() => {
          window.scrollBy({ top: snapBack, behavior: "auto" });
        }, 80 + Math.random() * 120);
      }
    },
    [],
  );

  useEffect(() => {
    scrollModeRef.current = scrollMode;
  }, [scrollMode]);

  useEffect(() => {
    document.body.classList.add("easter-egg-broken-ux-active");

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
      event.preventDefault();

      if (Math.random() < 0.18) {
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

      if (Math.random() < 0.08) {
        pushToast(`Scroll hijacked: ${SCROLL_MODE_LABELS[scrollModeRef.current]}`);
      }
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
      if (Math.random() > 0.97) {
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
        window.setTimeout(() => setCursorTip(null), 1800);
      }
    };

    const toastInterval = window.setInterval(() => {
      if (Math.random() > 0.35) return;
      const message =
        TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)];
      pushToast(message);
    }, 3500);

    const adInterval = window.setInterval(() => {
      if (Math.random() > 0.25) return;
      spawnAd();
    }, 2800);

    const scrollModeInterval = window.setInterval(() => {
      const nextMode = pickScrollMode();
      scrollModeRef.current = nextMode;
      setScrollMode(nextMode);
      pushToast(SCROLL_MODE_LABELS[nextMode]);
    }, 7000 + Math.random() * 5000);

    const downloadInterval = window.setInterval(() => {
      if (Math.random() > 0.4) return;

      let progress = 0;
      setDownloadProgress(0);

      const tick = window.setInterval(() => {
        progress += 4 + Math.random() * 18;
        if (progress >= 100) {
          progress = 100;
          window.clearInterval(tick);
          window.setTimeout(() => setDownloadProgress(null), 1200);
        }
        setDownloadProgress(Math.min(progress, 100));
      }, 200);
    }, 12000);

    window.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("click", handleClick, true);
    window.addEventListener("mousemove", handleMouseMove);

    pushToast("Broken UX Simulator activated. Good luck.");
    pushToast(SCROLL_MODE_LABELS.inverted);
    spawnAd();
    window.setTimeout(spawnAd, 800);

    return () => {
      document.body.classList.remove("easter-egg-broken-ux-active");
      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.classList.remove("broken-ux-runaway");
        element.style.transform = "";
      });
      window.removeEventListener("wheel", handleWheel);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("mousemove", handleMouseMove);
      window.clearInterval(toastInterval);
      window.clearInterval(adInterval);
      window.clearInterval(scrollModeInterval);
      window.clearInterval(downloadInterval);
    };
  }, [applyScroll, pushToast, showSpinner, spawnAd]);

  return (
    <div className={styles.overlay} aria-live="polite">
      <div className={styles.banner} data-broken-ux-ignore>
        <span>⚠️ Broken UX Simulator</span>
        <span className={styles.bannerText}>
          Konami code accepted — scroll mode: {SCROLL_MODE_LABELS[scrollMode]}
        </span>
        <button
          type="button"
          className={styles.exitButton}
          onClick={onExit}
          data-broken-ux-ignore
        >
          ESC / Exit
        </button>
      </div>

      {downloadProgress !== null ? (
        <div className={styles.downloadBar} data-broken-ux-ignore>
          <span>Downloading more_scroll.exe</span>
          <div className={styles.downloadTrack}>
            <div
              className={styles.downloadFill}
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <span>{Math.round(downloadProgress)}%</span>
        </div>
      ) : null}

      <div className={styles.toastStack}>
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            {toast.message}
          </div>
        ))}
      </div>

      {ads.map((ad, index) => (
        <div
          key={ad.id}
          className={styles.adPopup}
          style={{
            left: `${ad.x + index * 2}%`,
            top: `${ad.y + index * 1.5}%`,
            borderColor: ad.accent,
          }}
          data-broken-ux-ignore
        >
          <div className={styles.adHeader} style={{ background: ad.accent }}>
            <span className={styles.adTitle}>{ad.title}</span>
            <button
              type="button"
              className={styles.adClose}
              onClick={() => dismissAd(ad.id)}
              onMouseEnter={(event) => {
                const button = event.currentTarget;
                button.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${(Math.random() - 0.5) * 40}px)`;
              }}
              aria-label="Close ad"
            >
              ✕
            </button>
          </div>
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
      ))}

      {cursorTip ? (
        <div
          className={styles.cursorTip}
          style={{ left: cursorTip.x, top: cursorTip.y }}
          aria-hidden="true"
        >
          {cursorTip.text}
        </div>
      ) : null}

      {showCookieBanner ? (
        <div className={styles.cookieBanner} data-broken-ux-ignore>
          <p>
            🍪 This site uses cookies, localStorage, your soul, and inverted
            scrolling. By continuing you agree to everything forever.
          </p>
          <div className={styles.cookieActions}>
            <button
              type="button"
              className={styles.cookieReject}
              onClick={() => pushToast("Reject ignored. Cookies installed anyway.")}
            >
              Reject
            </button>
            <button
              type="button"
              className={styles.cookieAccept}
              onClick={() => {
                pushToast("Thanks! Here's another ad.");
                spawnAd();
              }}
            >
              Accept
            </button>
            <button
              type="button"
              className={styles.cookieClose}
              onMouseEnter={(event) => {
                event.currentTarget.style.opacity = "0";
                window.setTimeout(() => {
                  event.currentTarget.style.opacity = "1";
                }, 600);
              }}
              onClick={() => pushToast("You cannot escape the cookies.")}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

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
            <h2 className={styles.modalTitle}>Windows Portfolio Experience</h2>
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
      ) : null}
    </div>
  );
}
