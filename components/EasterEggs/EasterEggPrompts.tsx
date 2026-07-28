"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  type EasterEggPrompt,
  pickDismissFeedback,
  pickEasterEggPrompt,
} from "@/lib/easterEggs/prompts";
import {
  PREMIUM_QR,
  type PremiumScrollMessage,
  pickPremiumScrollMessage,
} from "@/lib/easterEggs/premiumQr";
import { subscribeLenisScroll } from "@/hooks/useLenis";

import styles from "./EasterEggPrompts.module.css";

const POSITIONS = [
  styles.topLeft,
  styles.topRight,
  styles.bottomLeft,
  styles.bottomRight,
] as const;

const MIN_INTERVAL_MS = 24_000;
const MAX_INTERVAL_MS = 52_000;
const VISIBLE_MS = 9_000;
const FEEDBACK_MS = 2_400;
const INITIAL_DELAY_MS = 20_000;
const PREMIUM_QR_COOLDOWN_MS = 75_000;
const SCROLL_TRIGGER_CHANCE = 0.035;
const MIN_SCROLL_DELTA = 48;

function isLoaderActive() {
  return document.documentElement.classList.contains("loader-active");
}

function randomInterval() {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

function kindLabel(kind: EasterEggPrompt["kind"]) {
  switch (kind) {
    case "fact":
      return "Did you know";
    case "quiz":
      return "Quick one";
    default:
      return null;
  }
}

type EasterEggPromptsProps = {
  paused?: boolean;
};

export function EasterEggPrompts({ paused = false }: EasterEggPromptsProps) {
  const [prompt, setPrompt] = useState<EasterEggPrompt | null>(null);
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [positionClass, setPositionClass] = useState<string>(styles.bottomRight);
  const [premiumQrOpen, setPremiumQrOpen] = useState(false);
  const [premiumMessage, setPremiumMessage] = useState<PremiumScrollMessage>(
    PREMIUM_QR.message,
  );

  const timeoutRef = useRef(0);
  const hideTimeoutRef = useRef(0);
  const feedbackTimeoutRef = useRef(0);
  const answeredRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const lastPremiumQrRef = useRef(0);
  const premiumQrOpenRef = useRef(false);
  const visibleRef = useRef(false);
  const pausedRef = useRef(paused);

  useEffect(() => {
    premiumQrOpenRef.current = premiumQrOpen;
  }, [premiumQrOpen]);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const clearTimers = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    window.clearTimeout(hideTimeoutRef.current);
    window.clearTimeout(feedbackTimeoutRef.current);
  }, []);

  const closePremiumQr = useCallback(() => {
    setPremiumQrOpen(false);
    setVisible(false);
    setPremiumMessage(PREMIUM_QR.message);
  }, []);

  const showPremiumQr = useCallback(() => {
    if (pausedRef.current || isLoaderActive()) return;
    if (premiumQrOpenRef.current || visibleRef.current) return;

    lastPremiumQrRef.current = Date.now();
    setPositionClass(
      POSITIONS[Math.floor(Math.random() * POSITIONS.length)] ?? styles.bottomRight,
    );
    setPremiumMessage(pickPremiumScrollMessage());
    setPremiumQrOpen(true);
    setVisible(true);
    setPrompt(null);
    setFeedback(null);
    setAnswered(false);

    window.clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = window.setTimeout(() => {
      closePremiumQr();
    }, 12_000);
  }, [closePremiumQr]);

  const queueNextPrompt = useCallback((delay = randomInterval()) => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (paused || isLoaderActive()) {
        queueNextPrompt(4000);
        return;
      }

      if (Math.random() < 0.12) {
        showPremiumQr();
        queueNextPrompt();
        return;
      }

      const nextPrompt = pickEasterEggPrompt();
      answeredRef.current = false;

      setPositionClass(
        POSITIONS[Math.floor(Math.random() * POSITIONS.length)] ?? styles.bottomRight,
      );
      setPrompt(nextPrompt);
      setPremiumQrOpen(false);
      setFeedback(null);
      setAnswered(false);
      setVisible(true);

      hideTimeoutRef.current = window.setTimeout(() => {
        if (answeredRef.current) return;

        if (nextPrompt.kind === "quiz") {
          answeredRef.current = true;
          setFeedback("Time's up — maybe next time.");
          setAnswered(true);
          feedbackTimeoutRef.current = window.setTimeout(() => {
            setVisible(false);
            setFeedback(null);
            setAnswered(false);
            setPrompt(null);
            queueNextPrompt();
          }, FEEDBACK_MS);
          return;
        }

        setVisible(false);
        setPrompt(null);
        queueNextPrompt();
      }, VISIBLE_MS);
    }, delay);
  }, [paused, showPremiumQr]);

  const closeWithFeedback = useCallback(
    (message: string) => {
      answeredRef.current = true;
      setFeedback(message);
      setAnswered(true);
      window.clearTimeout(hideTimeoutRef.current);

      feedbackTimeoutRef.current = window.setTimeout(() => {
        setVisible(false);
        setFeedback(null);
        setAnswered(false);
        setPrompt(null);
        setPremiumQrOpen(false);
        queueNextPrompt();
      }, FEEDBACK_MS);
    },
    [queueNextPrompt],
  );

  const dismiss = useCallback(() => {
    if (premiumQrOpen) {
      closePremiumQr();
      queueNextPrompt(18_000);
      return;
    }

    if (!prompt || answered) return;

    if (prompt.kind === "quiz") {
      closeWithFeedback("No answer — maybe next time.");
      return;
    }

    closeWithFeedback(pickDismissFeedback(prompt));
  }, [answered, closePremiumQr, closeWithFeedback, premiumQrOpen, prompt, queueNextPrompt]);

  const handleQuizAnswer = useCallback(
    (choice: 0 | 1) => {
      if (!prompt || prompt.kind !== "quiz" || answered) return;

      const isCorrect = prompt.answer === choice;
      const message = isCorrect
        ? prompt.feedback?.correct ?? "Correct."
        : prompt.feedback?.wrong ?? "Not quite.";

      closeWithFeedback(message);
    },
    [answered, closeWithFeedback, prompt],
  );

  const handlePremiumContinue = useCallback(() => {
    window.clearTimeout(hideTimeoutRef.current);
    closePremiumQr();
    queueNextPrompt(22_000);
  }, [closePremiumQr, queueNextPrompt]);

  const scheduleNext = useCallback(function scheduleNext(delay = randomInterval()) {
    queueNextPrompt(delay);
  }, [queueNextPrompt]);

  useEffect(() => {
    if (paused) {
      setVisible(false);
      setPrompt(null);
      setFeedback(null);
      setAnswered(false);
      setPremiumQrOpen(false);
      clearTimers();
      return;
    }

    scheduleNext(INITIAL_DELAY_MS);

    return clearTimers;
  }, [clearTimers, paused, scheduleNext]);

  useEffect(() => {
    if (paused) return;

    return subscribeLenisScroll((scrollY) => {
      const delta = Math.abs(scrollY - lastScrollYRef.current);
      lastScrollYRef.current = scrollY;

      if (delta < MIN_SCROLL_DELTA) return;
      if (Date.now() - lastPremiumQrRef.current < PREMIUM_QR_COOLDOWN_MS) return;
      if (Math.random() > SCROLL_TRIGGER_CHANCE) return;

      showPremiumQr();
    });
  }, [paused, showPremiumQr]);

  if (!prompt && !premiumQrOpen) return null;

  const label = prompt ? kindLabel(prompt.kind) : "Premium";
  const showQuiz = prompt?.kind === "quiz" && !answered && !feedback;

  return (
    <aside
      className={[
        styles.prompt,
        positionClass,
        premiumQrOpen ? styles.premiumQr : "",
        prompt?.kind === "whisper" ? styles.whisper : "",
        prompt?.kind === "fact" ? styles.fact : "",
        prompt?.kind === "quiz" ? styles.quiz : "",
        visible ? styles.promptVisible : styles.promptHidden,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
      aria-atomic="true"
    >
      <button
        type="button"
        className={styles.dismiss}
        onClick={dismiss}
        aria-label="Dismiss prompt"
      >
        ✕
      </button>

      {label ? <span className={styles.label}>{label}</span> : null}

      {premiumQrOpen ? (
        <>
          <p className={styles.text}>{premiumMessage}</p>

          <div className={styles.qrBlock}>
            <p className={styles.scanMe}>{PREMIUM_QR.scanLabel}</p>
            <a
              href={PREMIUM_QR.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.qrLink}
              data-cursor="interactive"
            >
              <Image
                src={PREMIUM_QR.imageSrc}
                alt="QR code for premium scroll unlock"
                width={140}
                height={140}
                className={styles.qrImage}
              />
            </a>
          </div>

          <div className={styles.premiumActions}>
            <button
              type="button"
              className={styles.quizButton}
              onClick={dismiss}
            >
              {PREMIUM_QR.dismissLabel}
            </button>
            <button
              type="button"
              className={`${styles.quizButton} ${styles.premiumContinue}`}
              onClick={handlePremiumContinue}
            >
              {PREMIUM_QR.continueLabel}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.text}>
            {feedback ?? prompt?.text.replace(/^(Random fact:|Quick one:)\s*/i, "")}
          </p>

          {showQuiz && prompt?.options ? (
            <div className={styles.quizActions}>
              <button
                type="button"
                className={styles.quizButton}
                onClick={() => handleQuizAnswer(0)}
              >
                {prompt.options[0]}
              </button>
              <button
                type="button"
                className={styles.quizButton}
                onClick={() => handleQuizAnswer(1)}
              >
                {prompt.options[1]}
              </button>
            </div>
          ) : null}

          {feedback ? <span className={styles.feedbackTag}>↳ response</span> : null}
        </>
      )}
    </aside>
  );
}
