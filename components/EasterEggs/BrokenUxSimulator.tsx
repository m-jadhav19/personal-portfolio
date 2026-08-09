"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { getLenis } from "@/lib/lenis";
import {
  AD_TEMPLATES,
  createAdPosition,
  createPremiumQrAd,
  MAX_ADS,
  type AdPopup,
} from "@/lib/easterEggs/brokenAds";
import {
  createBrokenScrollController,
  pickScrollMode,
  SCROLL_MODE_META,
  type ScrollMode,
} from "@/lib/easterEggs/brokenScroll";

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

type DragState = {
  id: number;
  offsetX: number;
  offsetY: number;
} | null;

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

const RUNAWAY_SELECTOR = "a, button, [role='button']";

export function BrokenUxSimulator({ onExit }: BrokenUxSimulatorProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [spinnerMessage, setSpinnerMessage] = useState<string | null>(null);
  const [ads, setAds] = useState<AdPopup[]>([]);
  const [adOffsets, setAdOffsets] = useState<Record<number, { x: number; y: number }>>(
    {},
  );
  const [scrollMode, setScrollMode] = useState<ScrollMode>("inverted");
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [cursorTip, setCursorTip] = useState<{ x: number; y: number; text: string } | null>(
    null,
  );
  const [modeFlash, setModeFlash] = useState(false);
  const [topAdId, setTopAdId] = useState<number | null>(null);

  const toastIdRef = useRef(0);
  const adIdRef = useRef(0);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const bypassClickRef = useRef(false);
  const scrollControllerRef = useRef<ReturnType<typeof createBrokenScrollController> | null>(
    null,
  );
  const dragRef = useRef<DragState>(null);
  const scrollModeRef = useRef<ScrollMode>("inverted");

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

  const spawnPremiumQrAd = useCallback(() => {
    setAds((current) => {
      const ad = createPremiumQrAd(++adIdRef.current, current.length);
      setTopAdId(ad.id);
      const next = [...current, ad];
      return next.length > MAX_ADS ? next.slice(-MAX_ADS) : next;
    });
  }, []);

  const spawnAd = useCallback((withProgress = false) => {
    // Occasionally spawn the premium QR as a chaotic ad window.
    if (Math.random() < 0.18) {
      spawnPremiumQrAd();
      return;
    }

    const template =
      AD_TEMPLATES[Math.floor(Math.random() * AD_TEMPLATES.length)]!;
    const id = ++adIdRef.current;

    setAds((current) => {
      const ad: AdPopup = {
        ...template,
        id,
        ...createAdPosition(current.length),
        progress: withProgress ? 0 : undefined,
      };
      setTopAdId(ad.id);
      const next = [...current, ad];
      return next.length > MAX_ADS ? next.slice(-MAX_ADS) : next;
    });

    if (withProgress) {
      let progress = 0;
      const tick = window.setInterval(() => {
        progress += 6 + Math.random() * 14;
        setAds((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, progress: Math.min(progress, 100) }
              : item,
          ),
        );
        if (progress >= 100) window.clearInterval(tick);
      }, 180);
    }
  }, [spawnPremiumQrAd]);

  const dismissAd = useCallback(
    (id: number) => {
      setAds((current) => current.filter((ad) => ad.id !== id));
      setAdOffsets((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });

      if (Math.random() > 0.25) {
        window.setTimeout(() => {
          pushToast("Ad closed. Opening 2 more ads…");
          spawnAd(true);
          window.setTimeout(() => spawnAd(), 300);
        }, 200);
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

  const bringAdToFront = useCallback((id: number) => {
    setTopAdId(id);
  }, []);

  const handleAdPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, ad: AdPopup) => {
      if ((event.target as HTMLElement).closest("button")) return;

      const offset = adOffsets[ad.id] ?? { x: 0, y: 0 };
      dragRef.current = {
        id: ad.id,
        offsetX: event.clientX - offset.x,
        offsetY: event.clientY - offset.y,
      };
      bringAdToFront(ad.id);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [adOffsets, bringAdToFront],
  );

  const handleAdPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== Number(event.currentTarget.dataset.adId)) return;

    setAdOffsets((current) => ({
      ...current,
      [drag.id]: {
        x: event.clientX - drag.offsetX,
        y: event.clientY - drag.offsetY,
      },
    }));
  }, []);

  const handleAdPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    document.body.classList.add("easter-egg-broken-ux-active");

    const lenis = getLenis();
    lenis?.stop();

    scrollControllerRef.current = createBrokenScrollController();
    scrollControllerRef.current.setMode("inverted");

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

      if (Math.random() < 0.08) {
        const message =
          SCROLL_MESSAGES[Math.floor(Math.random() * SCROLL_MESSAGES.length)];

        setModal({
          message,
          onConfirm: () => {
            setModal(null);
            scrollControllerRef.current?.apply(event.deltaY, event.deltaX);
          },
        });
        return;
      }

      scrollControllerRef.current?.apply(event.deltaY, event.deltaX);
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
        if (Math.random() > 0.4) spawnAd(true);
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
      if (Math.random() > 0.22) return;
      spawnAd(Math.random() > 0.5);
    }, 2800);

    const scrollModeInterval = window.setInterval(() => {
      const nextMode = pickScrollMode(scrollModeRef.current);
      scrollModeRef.current = nextMode;
      scrollControllerRef.current?.setMode(nextMode);
      setScrollMode(nextMode);
      flashMode();
      pushToast(`Scroll mode → ${SCROLL_MODE_META[nextMode].label}`);
    }, 8500);

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
    spawnPremiumQrAd();
    window.setTimeout(() => spawnAd(true), 400);
    window.setTimeout(() => spawnAd(), 900);

    return () => {
      document.body.classList.remove("easter-egg-broken-ux-active");
      lenis?.start();
      scrollControllerRef.current?.destroy();
      scrollControllerRef.current = null;

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
  }, [flashMode, pushToast, showSpinner, spawnAd, spawnPremiumQrAd]);

  const modeMeta = SCROLL_MODE_META[scrollMode];

  return (
    <div className={styles.overlay} aria-live="polite">
      {modeFlash ? <div className={styles.modeFlash} aria-hidden="true" /> : null}

      <header
        className={styles.hud}
        data-broken-ux-ignore
        data-cursor-surface
        data-cursor="interactive"
      >
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

        <button
          type="button"
          className={styles.exitButton}
          onClick={onExit}
          data-cursor="button"
        >
          Exit <kbd>ESC</kbd>
        </button>
      </header>

      {downloadProgress !== null ? (
        <div
          className={styles.downloadBar}
          data-broken-ux-ignore
          data-cursor-surface
          data-cursor="interactive"
        >
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

      <div className={styles.toastStack} data-cursor-surface>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={styles.toast}
            data-cursor="interactive"
          >
            <span className={styles.toastIcon}>!</span>
            {toast.message}
          </div>
        ))}
      </div>

      {ads.map((ad, index) => {
        const offset = adOffsets[ad.id] ?? { x: 0, y: 0 };
        const variantClass =
          ad.variant === "banner"
            ? styles.adBanner
            : ad.variant === "alert"
              ? styles.adAlert
              : ad.variant === "qr"
                ? styles.adQr
                : styles.adPopup;

        return (
          <div
            key={ad.id}
            data-ad-id={ad.id}
            className={`${styles.adWindow} ${variantClass} ${styles.adShake}`}
            style={{
              left: `calc(${ad.x}% + ${offset.x}px)`,
              top: `calc(${ad.y}% + ${offset.y}px)`,
              zIndex: 10068 + (topAdId === ad.id ? 20 : index),
              transform: `rotate(${ad.rotation}deg)`,
            }}
            data-broken-ux-ignore
            data-cursor-surface
            data-cursor="interactive"
            onPointerDown={(event) => handleAdPointerDown(event, ad)}
            onPointerMove={handleAdPointerMove}
            onPointerUp={handleAdPointerUp}
            onPointerCancel={handleAdPointerUp}
          >
            <div className={styles.adTitleBar} style={{ background: ad.accent }}>
              {ad.urgent ? <span className={styles.adUrgent}>URGENT</span> : null}
              <span className={styles.adTitle}>
                <span className={styles.adMarquee}>{ad.title}</span>
              </span>
              <div className={styles.adWindowControls}>
                <button
                  type="button"
                  className={styles.adWinBtn}
                  onClick={() => pushToast("Minimize failed. Opening another ad.")}
                  aria-label="Minimize ad"
                  data-cursor="button"
                >
                  _
                </button>
                <button
                  type="button"
                  className={styles.adWinBtn}
                  onClick={() => dismissAd(ad.id)}
                  onMouseEnter={(event) => {
                    const button = event.currentTarget;
                    button.style.transform = `translate(${(Math.random() - 0.5) * 70}px, ${(Math.random() - 0.5) * 50}px)`;
                  }}
                  aria-label="Close ad"
                  data-cursor="button"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={styles.adContent}>
              <p className={styles.adBody}>{ad.body}</p>

              {ad.variant === "qr" && ad.qrImageSrc && ad.qrLinkUrl ? (
                <div className={styles.adQrBlock}>
                  <p className={styles.adQrScan}>{ad.qrScanLabel ?? "SCAN ME"}</p>
                  <a
                    href={ad.qrLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.adQrLink}
                    onClick={(event) => event.stopPropagation()}
                    data-cursor="link"
                  >
                    <Image
                      src={ad.qrImageSrc}
                      alt="QR code for premium scroll unlock"
                      width={148}
                      height={148}
                      className={styles.adQrImage}
                    />
                  </a>
                </div>
              ) : null}

              {ad.progress !== undefined ? (
                <div className={styles.adProgressTrack}>
                  <div
                    className={styles.adProgressFill}
                    style={{ width: `${ad.progress}%`, background: ad.accent }}
                  />
                </div>
              ) : null}

              {ad.variant === "qr" ? (
                <div className={styles.adQrActions}>
                  <button
                    type="button"
                    className={styles.adSecondaryCta}
                    onClick={() => {
                      pushToast("Premium declined. Enjoy more ads.");
                      dismissAd(ad.id);
                      spawnAd();
                    }}
                    data-cursor="button"
                  >
                    {ad.secondaryCta ?? "No thanks"}
                  </button>
                  <button
                    type="button"
                    className={styles.adCta}
                    style={{ background: ad.accent, color: "#000" }}
                    onClick={() => {
                      pushToast("Premium unlocked… kind of. Here's another ad.");
                      spawnAd(true);
                      spawnAd();
                    }}
                    data-cursor="button"
                  >
                    {ad.cta}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.adCta}
                  style={{ background: ad.accent }}
                  onClick={() => {
                    pushToast("Ad clicked. Installing toolbar…");
                    spawnAd(true);
                    spawnAd();
                  }}
                  data-cursor="button"
                >
                  {ad.cta}
                </button>
              )}
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

      <div
        className={styles.cookieBanner}
        data-broken-ux-ignore
        data-cursor-surface
        data-cursor="interactive"
      >
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
            data-cursor="button"
          >
            Reject all
          </button>
          <button
            type="button"
            className={styles.cookieAccept}
            onClick={() => {
              pushToast("Thanks! Here's another ad.");
              spawnAd(true);
            }}
            data-cursor="button"
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
            data-cursor="button"
          >
            ✕
          </button>
        </div>
      </div>

      {spinnerMessage ? (
        <div
          className={styles.spinnerOverlay}
          data-broken-ux-ignore
          data-cursor-surface
          data-cursor="interactive"
        >
          <div className={styles.spinnerCard}>
            <div className={styles.spinner} />
            {spinnerMessage}
          </div>
        </div>
      ) : null}

      {modal ? (
        <div
          className={styles.modalBackdrop}
          data-broken-ux-ignore
          data-cursor-surface
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            data-cursor="interactive"
          >
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
                  data-cursor="button"
                >
                  No
                </button>
                <button
                  type="button"
                  className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                  onClick={modal.onConfirm}
                  data-cursor="button"
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
