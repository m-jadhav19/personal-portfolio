"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { portfolio } from "@/content/portfolio";
import { MYSPACE_CHEAT_CODE } from "@/lib/easterEggs/codes";

import styles from "./Y2kMySpace.module.css";

type Y2kMySpaceProps = {
  onExit: () => void;
};

type Sparkle = {
  id: number;
  x: number;
  y: number;
  glyph: string;
};

const SPARKLE_GLYPHS = ["✨", "⭐", "💖", "★", "♥", "✧"];
const MARQUEE_TEXT =
  "★★★ WELCOME 2 MY PORTFOLIO ★★★ MANDAR IS ONLINE ★★★ SIGN MY GUESTBOOK ★★★ TOP 8 PROJECTS INSIDE ★★★ ";

export function Y2kMySpace({ onExit }: Y2kMySpaceProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [visitorCount, setVisitorCount] = useState(42069);
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const [showCheatToast, setShowCheatToast] = useState(true);
  const sparkleIdRef = useRef(0);
  const topFriends = portfolio.projects.slice(0, 8);

  const addSparkle = useCallback((x: number, y: number) => {
    const id = ++sparkleIdRef.current;
    const glyph =
      SPARKLE_GLYPHS[Math.floor(Math.random() * SPARKLE_GLYPHS.length)];

    setSparkles((current) => [...current.slice(-24), { id, x, y, glyph }]);

    window.setTimeout(() => {
      setSparkles((current) => current.filter((sparkle) => sparkle.id !== id));
    }, 900);
  }, []);

  useEffect(() => {
    document.body.classList.add("easter-egg-myspace-active");

    const handleMouseMove = (event: MouseEvent) => {
      if (Math.random() > 0.55) return;
      addSparkle(event.clientX, event.clientY);
    };

    const visitorInterval = window.setInterval(() => {
      setVisitorCount((count) => count + Math.floor(Math.random() * 3) + 1);
    }, 1800);

    const cheatTimeout = window.setTimeout(() => setShowCheatToast(false), 2600);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.body.classList.remove("easter-egg-myspace-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.clearInterval(visitorInterval);
      window.clearTimeout(cheatTimeout);
    };
  }, [addSparkle]);

  return (
    <>
      <div className={styles.sparkleLayer} aria-hidden="true">
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className={styles.sparkle}
            style={{ left: sparkle.x, top: sparkle.y }}
          >
            {sparkle.glyph}
          </span>
        ))}
      </div>

      <div className={styles.shell}>
        {showCheatToast ? (
          <div className={styles.cheatToast}>
            CHEAT ACTIVATED: {MYSPACE_CHEAT_CODE}
          </div>
        ) : null}

        <div className={styles.marqueeBar}>
          <span className={styles.marqueeTrack}>
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
          </span>
        </div>

        <button
          type="button"
          className={styles.exitButton}
          onClick={onExit}
        >
          ✖ Exit MySpace (ESC)
        </button>

        <aside className={`${styles.panel} ${styles.profilePanel}`}>
          <h2 className={styles.panelTitle}>~* Mandar&apos;s Page *~</h2>
          <span className={styles.online}>● ONLINE NOW</span>
          <p className={styles.mood}>
            Mandar is: <strong>♫ coding 2 pop-punk ♫</strong>
          </p>
          <p className={styles.mood}>
            Location: <strong>Mumbai, India</strong>
          </p>
          <button
            type="button"
            className={styles.guestbookButton}
            onClick={() => setGuestbookOpen(true)}
          >
            ✎ Sign My Guestbook!!!
          </button>
        </aside>

        <aside className={`${styles.panel} ${styles.topFriendsPanel}`}>
          <h2 className={styles.panelTitle}>Top 8 Projects</h2>
          <div className={styles.topGrid}>
            {topFriends.map((project) => (
              <div key={project.id} className={styles.friend}>
                <Image
                  src={project.imageSrc}
                  alt={project.title}
                  width={48}
                  height={48}
                />
                <span>{project.title.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </aside>

        <aside className={`${styles.panel} ${styles.musicPanel}`}>
          <h2 className={styles.panelTitle}>Now Playing</h2>
          <p className={styles.nowPlaying}>
            🎵 Linkin Park — In The End (lo-fi remix)
            <br />
            <small>autoplay blocked lol</small>
          </p>
          <div className={styles.equalizer} aria-hidden="true">
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
          </div>
        </aside>

        <aside className={`${styles.panel} ${styles.statsPanel}`}>
          <p className={styles.visitorCount}>{visitorCount.toLocaleString()}</p>
          <p className={styles.underConstruction}>
            🚧 UNDER CONSTRUCTION 🚧
          </p>
        </aside>
      </div>

      {guestbookOpen ? (
        <div
          className={styles.guestbookModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guestbook-title"
        >
          <div className={styles.guestbookCard}>
            <h3 id="guestbook-title">Sign My Guestbook ✨</h3>
            <p>
              thx 4 visiting my page!!! leave a comment if u think frontend dev
              is cool ~~ &lt;3
            </p>
            <button type="button" onClick={() => setGuestbookOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
