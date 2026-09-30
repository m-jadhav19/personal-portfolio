"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BOSS_NAME } from "@/lib/easterEggs/destroy/boss";
import { BOSS_SCORE_THRESHOLD } from "@/lib/easterEggs/destroy/combat";
import { createDestroyEngine, type DestroyEngine } from "@/lib/easterEggs/destroy/engine";
import {
  WEAPON_ICON_SRC,
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
  const [dead, setDead] = useState(false);
  const [weaponIndex, setWeaponIndex] = useState(0);
  const [muted, setMuted] = useState(readSessionMuted);
  const [shaking, setShaking] = useState(false);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [scoreThreshold, setScoreThreshold] = useState(BOSS_SCORE_THRESHOLD);
  const [bossSummoned, setBossSummoned] = useState(false);
  const [buffs, setBuffs] = useState({ shield: 0, rapid: 0 });
  const [boss, setBoss] = useState<{
    hp: number;
    maxHp: number;
    alive: boolean;
  } | null>(null);

  const leaveMode = useCallback(() => {
    // Soft-restore + teardown happen in the mount effect cleanup.
    onExit();
  }, [onExit]);

  const hardExit = useCallback(() => {
    window.location.reload();
  }, []);

  const togglePause = useCallback(() => {
    if (dead) return;
    setPaused((prev) => {
      const next = !prev;
      engineRef.current?.setPaused(next);
      return next;
    });
  }, [dead]);

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
      onHealthChange: (hp, max) => {
        setHealth(hp);
        setMaxHealth(max);
      },
      onScoreChange: (nextScore, threshold, summoned) => {
        setScore(nextScore);
        setScoreThreshold(threshold);
        setBossSummoned(summoned);
      },
      onBuffChange: (next) => setBuffs(next),
      onBossChange: (next) => setBoss(next),
      onDeath: () => {
        setDead(true);
        setPaused(true);
      },
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
      setDead((isDead) => {
        if (isDead) return isDead;
        setPaused((prev) => {
          const next = !prev;
          engine.setPaused(next);
          return next;
        });
        return isDead;
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
    setDead(false);
    setPaused(false);
    setScore(0);
    setBossSummoned(false);
    setBoss(null);
    engineRef.current?.setPaused(false);
  };

  const healthPct = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const scorePct = Math.max(
    0,
    Math.min(100, (score / Math.max(1, scoreThreshold)) * 100),
  );
  const bossPct =
    boss && boss.maxHp > 0
      ? Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))
      : 0;

  return (
    <div className={`${styles.root} ${shaking ? styles.shake : ""}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-hidden="true"
      />

      {boss?.alive ? (
        <div
          className={styles.bossBar}
          data-destroy-ignore
          data-cursor="hide"
          aria-label={`${BOSS_NAME} health ${Math.round(boss.hp)} of ${boss.maxHp}`}
        >
          <div className={styles.bossBarLabel}>
            <span>{BOSS_NAME.toUpperCase()}</span>
            <span>
              {Math.ceil(boss.hp)}/{boss.maxHp}
            </span>
          </div>
          <div className={styles.bossBarTrack}>
            <div
              className={`${styles.bossBarFill} ${
                bossPct < 30 ? styles.bossBarFillLow : ""
              }`}
              style={{ width: `${bossPct}%` }}
            />
          </div>
        </div>
      ) : null}

      <header
        className={styles.hud}
        data-destroy-ignore
        data-cursor-surface
        data-cursor="hide"
      >
        <div className={styles.brand}>
          <p className={styles.title}>Destroy mode</p>
          <p className={styles.hint}>
            WASD move · mouse aim · click fire · RMB drag · 1–4 · Esc
          </p>
        </div>

        <div
          className={styles.healthBlock}
          aria-label={`Health ${Math.round(health)} of ${maxHealth}`}
        >
          <div className={styles.healthLabelRow}>
            <span>HP</span>
            <span>
              {Math.ceil(health)}/{maxHealth}
            </span>
          </div>
          <div className={styles.healthTrack}>
            <div
              className={`${styles.healthFill} ${
                healthPct < 30 ? styles.healthFillLow : ""
              }`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <div className={styles.buffRow}>
            {buffs.shield > 0 ? (
              <span className={styles.buff}>SHD {buffs.shield.toFixed(0)}s</span>
            ) : null}
            {buffs.rapid > 0 ? (
              <span className={styles.buff}>RAP {buffs.rapid.toFixed(0)}s</span>
            ) : null}
          </div>
        </div>

        <div
          className={styles.scoreBlock}
          aria-label={
            bossSummoned
              ? `Score ${score}`
              : `Score ${score} of ${scoreThreshold} until ${BOSS_NAME}`
          }
        >
          <div className={styles.healthLabelRow}>
            <span>SCORE</span>
            <span>
              {bossSummoned
                ? score
                : `${Math.min(score, scoreThreshold)}/${scoreThreshold}`}
            </span>
          </div>
          {!bossSummoned ? (
            <div className={styles.scoreTrack}>
              <div
                className={styles.scoreFill}
                style={{ width: `${scorePct}%` }}
              />
            </div>
          ) : (
            <p className={styles.scoreHint}>{BOSS_NAME.toUpperCase()}</p>
          )}
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
              aria-label={WEAPON_LABELS[id]}
              title={`${index + 1}: ${WEAPON_LABELS[id]}`}
              data-cursor="hide"
              data-cursor-surface
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={WEAPON_ICON_SRC[id]}
                alt=""
                width={22}
                height={22}
                className={styles.weaponIcon}
                draggable={false}
              />
              <span className={styles.weaponKey}>{index + 1}</span>
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btn}
            onClick={toggleMute}
            data-cursor="hide"
          >
            Sound {muted ? "Off" : "On"}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={togglePause}
            data-cursor="hide"
            disabled={dead}
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
              {dead ? "Overrun — you were destroyed" : "Paused — destroy mode"}
            </h2>
            <p className={styles.pauseSub}>
              {dead
                ? "Repair restores the page, resets score, and revives you. Reach the score threshold to wake Mogambo."
                : bossSummoned
                  ? "Mogambo tore out of the portrait. Repair restores the page and resets score. Leave mode exits without a reload."
                  : `Rack up ${scoreThreshold} points — the portrait watches you until Mogambo tears out as a DOOM-style boss from where the head sits. Repair restores the page in place.`}
            </p>
            <div className={styles.pauseActions}>
              {!dead ? (
                <button
                  type="button"
                  className={styles.pauseBtn}
                  onClick={togglePause}
                  autoFocus
                >
                  Resume
                </button>
              ) : null}
              <button
                type="button"
                className={styles.pauseBtn}
                onClick={repair}
                autoFocus={dead}
              >
                {dead ? "Revive + repair" : "Repair site"}
              </button>
              <button
                type="button"
                className={styles.pauseBtn}
                onClick={leaveMode}
              >
                Leave mode
              </button>
              <button
                type="button"
                className={`${styles.pauseBtn} ${styles.pauseBtnDanger}`}
                onClick={hardExit}
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
