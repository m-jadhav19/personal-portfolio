"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useMySpaceMusic } from "@/hooks/useMySpaceMusic";
import { MYSPACE_CHEAT_CODE } from "@/lib/easterEggs/codes";

import { portfolio } from "@/content/portfolio";

import styles from "./Y2kMySpace.module.css";

type Y2kMySpaceProps = {
  onExit: () => void;
};

const MARQUEE_TEXT =
  "★★★ WELCOME 2 VICE CITY ★★★ FLASH FM · WAVE 103 · V-ROCK ★★★ MANDAR IS ONLINE ★★★ ";

export function Y2kMySpace({ onExit }: Y2kMySpaceProps) {
  const [visitorCount, setVisitorCount] = useState(42069);
  const [showCheatToast, setShowCheatToast] = useState(true);

  const topFriends = portfolio.projects.slice(0, 4);
  const music = useMySpaceMusic({ enabled: true });

  useEffect(() => {
    document.body.classList.add("easter-egg-myspace-active");

    const visitorInterval = window.setInterval(() => {
      setVisitorCount((count) => count + Math.floor(Math.random() * 3) + 1);
    }, 2400);

    const cheatTimeout = window.setTimeout(() => setShowCheatToast(false), 2800);

    const handleClick = () => {
      if (music.needsInteraction) {
        void music.playCurrent();
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      document.body.classList.remove("easter-egg-myspace-active");
      window.clearInterval(visitorInterval);
      window.clearTimeout(cheatTimeout);
      window.removeEventListener("click", handleClick);
    };
  }, [music]);

  const moodText = music.track
    ? `♫ ${music.track.title} — ${music.track.artist} ♫`
    : "♫ tuning Vice City radio ♫";

  return (
    <div className={styles.decor}>
      {showCheatToast ? (
        <div className={styles.cheatToast}>CHEAT ACTIVATED: {MYSPACE_CHEAT_CODE}</div>
      ) : null}

      <div className={styles.marqueeBar}>
        <span className={styles.marqueeTrack}>
          {MARQUEE_TEXT}
          {MARQUEE_TEXT}
        </span>
      </div>

      <button type="button" className={styles.exitButton} onClick={onExit}>
        ✖ Exit (ESC)
      </button>

      <aside className={`${styles.widget} ${styles.musicWidget}`}>
        <p className={styles.widgetLabel}>Vice City Radio</p>
        <p className={styles.nowPlaying}>{moodText}</p>

        {music.isLoading ? (
          <p className={styles.trackMeta}>Loading Flash FM…</p>
        ) : music.track ? (
          <>
            <div className={styles.playerRow}>
              {music.track.artworkUrl ? (
                <Image
                  src={music.track.artworkUrl}
                  alt=""
                  width={40}
                  height={40}
                  className={styles.albumArt}
                  unoptimized
                />
              ) : (
                <div className={styles.albumArtPlaceholder}>📻</div>
              )}
              <div className={styles.trackMeta}>
                <p className={styles.trackTitle}>{music.track.title}</p>
                <p className={styles.trackArtist}>{music.track.artist}</p>
              </div>
            </div>

            <div className={styles.playerControls}>
              <button type="button" onClick={() => void music.togglePlay()}>
                {music.isPlaying ? "⏸" : "▶"}
              </button>
              <button type="button" onClick={() => void music.skip()}>
                ⏭
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={music.volume}
                onChange={(event) => music.setVolume(Number(event.target.value))}
                className={styles.volumeSlider}
                aria-label="Volume"
              />
            </div>

            {music.needsInteraction ? (
              <button
                type="button"
                className={styles.unmuteButton}
                onClick={() => void music.playCurrent()}
              >
                🔊 Click to play
              </button>
            ) : null}

            {music.error ? <p className={styles.musicError}>{music.error}</p> : null}
          </>
        ) : (
          <p className={styles.trackMeta}>No tracks loaded</p>
        )}
      </aside>

      <aside className={`${styles.widget} ${styles.projectsWidget}`}>
        <p className={styles.widgetLabel}>Top Projects</p>
        <div className={styles.topGrid}>
          {topFriends.map((project) => (
            <a
              key={project.id}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.friend}
              title={project.title}
            >
              <Image
                src={project.imageSrc}
                alt={project.title}
                width={28}
                height={28}
                className={styles.friendThumbImage}
                unoptimized
              />
            </a>
          ))}
        </div>
      </aside>

      <aside className={`${styles.widget} ${styles.statsWidget}`}>
        <p className={styles.visitorCount}>{visitorCount.toLocaleString()}</p>
        <p className={styles.visitorLabel}>profile views</p>
      </aside>
    </div>
  );
}
