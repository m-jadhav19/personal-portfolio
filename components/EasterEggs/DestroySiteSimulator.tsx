"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createDestroyEngine, type DestroyEngine } from "@/lib/easterEggs/destroy/engine";
import {
  WEAPON_LABELS,
  WEAPONS,
  type WeaponId,
} from "@/lib/easterEggs/destroy/weapons";
import { getLenis } from "@/lib/lenis";

import styles from "./DestroySiteSimulator.module.css";

const MUTE_KEY = "destroy-egg-muted";

type DestroySiteSimulatorProps = {
  onExit: () => void;
};

function readSessionMuted(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(MUTE_KEY) === "1";
}

export function DestroySiteSimulator({ onExit }: DestroySiteSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<DestroyEngine | null>(null);
  const [paused, setPaused] = useState(false);
  const [weaponIndex, setWeaponIndex] = useState(0);
  const [muted, setMuted] = useState(readSessionMuted);
  const [shaking, setShaking] = useState(false);

  const leaveMode = useCallback(() => {
    // Soft-restore + teardown happen in the mount effect cleanup.
    onExit();
  }, [onExit]);

  const hardExit = useCallback(() => {
    window.location.reload();
  }, []);

  const togglePause = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      engineRef.current?.setPaused(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const lenis = getLenis();
    lenis?.stop();

    const reducedMotion =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    let shakeTimer = 0;

    const engine = createDestroyEngine({
      canvas,
      reducedMotion,
      initialMuted: readSessionMuted(),
      onWeaponChange: (index) => setWeaponIndex(index),
      onShake: () => {
        if (reducedMotion) return;
        setShaking(true);
        window.clearTimeout(shakeTimer);
        shakeTimer = window.setTimeout(() => setShaking(false), 180);
      },
    });

    engineRef.current = engine;
    engine.start();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setPaused((prev) => {
        const next = !prev;
        engine.setPaused(next);
        return next;
      });
    };

    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.clearTimeout(shakeTimer);
      engine.destroy();
      engineRef.current = null;
      getLenis()?.start();
    };
  }, []);

  const selectWeapon = (index: number) => {
    engineRef.current?.setWeapon(index);
    setWeaponIndex(index);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    engineRef.current?.setMuted(next);
    try {
      sessionStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      // ignore quota / private mode
    }
  };

  const repair = () => {
    engineRef.current?.repair();
  };

  return (
    <div className={`${styles.root} ${shaking ? styles.shake : ""}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-hidden="true"
      />

      <header
        className={styles.hud}
        data-destroy-ignore
        data-cursor-surface
        data-cursor="interactive"
      >
        <div className={styles.brand}>
          <p className={styles.title}>Destroy mode</p>
          <p className={styles.hint}>1–4 switch · click fire · Esc pause</p>
        </div>

        <div className={styles.weapons} role="group" aria-label="Weapons">
          {WEAPONS.map((id: WeaponId, index) => (
            <button
              key={id}
              type="button"
              className={`${styles.weapon} ${
                index === weaponIndex ? styles.weaponActive : ""
              }`}
              onClick={() => selectWeapon(index)}
              aria-pressed={index === weaponIndex}
              data-cursor="button"
            >
              {index + 1}:{WEAPON_LABELS[id]}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btn}
            onClick={toggleMute}
            data-cursor="button"
          >
            Sound {muted ? "Off" : "On"}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={togglePause}
            data-cursor="button"
          >
            Pause
          </button>
        </div>
      </header>

      {paused ? (
        <div
          className={styles.pauseBackdrop}
          data-destroy-ignore
          data-cursor-surface
        >
          <div
            className={styles.pausePanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="destroy-pause-title"
          >
            <h2 id="destroy-pause-title" className={styles.pauseTitle}>
              Paused — destroy mode
            </h2>
            <p className={styles.pauseSub}>
              Repair restores the page in place. Leave mode exits without a
              reload. Exit hard-resets the site.
            </p>
            <div className={styles.pauseActions}>
              <button
                type="button"
                className={styles.pauseBtn}
                onClick={togglePause}
                data-cursor="button"
                autoFocus
              >
                Resume
              </button>
              <button
                type="button"
                className={styles.pauseBtn}
                onClick={repair}
                data-cursor="button"
              >
                Repair site
              </button>
              <button
                type="button"
                className={styles.pauseBtn}
                onClick={leaveMode}
                data-cursor="button"
              >
                Leave mode
              </button>
              <button
                type="button"
                className={`${styles.pauseBtn} ${styles.pauseBtnDanger}`}
                onClick={hardExit}
                data-cursor="button"
              >
                Exit (reload)
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type DesktopToastProps = {
  message: string;
  onDismiss: () => void;
};

export function DestroyDesktopToast({ message, onDismiss }: DesktopToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      className={styles.toast}
      role="status"
      data-destroy-ignore
      data-cursor-surface
    >
      {message}{" "}
      <button type="button" className={styles.btn} onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
