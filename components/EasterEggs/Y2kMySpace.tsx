"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMySpaceMusic } from "@/hooks/useMySpaceMusic";
import { MYSPACE_CHEAT_CODE } from "@/lib/easterEggs/codes";

import { portfolio } from "@/content/portfolio";

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

type FloatingHeart = {
  id: number;
  x: number;
  delay: number;
};

type ViewerToast = {
  id: number;
  name: string;
};

const SPARKLE_GLYPHS = ["✨", "⭐", "💖", "★", "♥", "✧", "☆", "♡"];
const MARQUEE_TEXT =
  "★★★ WELCOME 2 MY PORTFOLIO ★★★ MANDAR IS ONLINE ★★★ SIGN MY GUESTBOOK ★★★ TOP 8 PROJECTS INSIDE ★★★ ";

const GUESTBOOK_ENTRIES = [
  { name: "xX_darkCoder_Xx", message: "omg ur site is SO cool!! add me plz!!!" },
  { name: "Sarah_2004", message: "luv the sparkles ✨ come visit my page 2!!" },
  { name: "FrontendFan99", message: "mandar u r the best dev on myspace tbh" },
  { name: "PopPunk4Lyfe", message: "blink 182 4ever ~~ thx 4 the add <3" },
  { name: "Guest_48291", message: "how did u get that hit counter?? teach me" },
];

const VIEWER_NAMES = [
  "Jessica",
  "Tyler",
  "Ashley",
  "Brandon",
  "Megan",
  "Chris",
  "Nicole",
  "Derek",
  "Amanda",
  "Justin",
];

const WEB_RING = [
  "Best Devs '04",
  "Mumbai Crew",
  "HTML Hotties",
  "CSS Kings",
  "React Rulers",
];

export function Y2kMySpace({ onExit }: Y2kMySpaceProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [visitorCount, setVisitorCount] = useState(42069);
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const [showCheatToast, setShowCheatToast] = useState(true);
  const [viewerToast, setViewerToast] = useState<ViewerToast | null>(null);
  const [blinkOn, setBlinkOn] = useState(true);

  const sparkleIdRef = useRef(0);
  const heartIdRef = useRef(0);
  const topFriends = portfolio.projects.slice(0, 8);

  const music = useMySpaceMusic({ enabled: true });

  const addSparkle = useCallback((x: number, y: number) => {
    const id = ++sparkleIdRef.current;
    const glyph =
      SPARKLE_GLYPHS[Math.floor(Math.random() * SPARKLE_GLYPHS.length)];

    setSparkles((current) => [...current.slice(-28), { id, x, y, glyph }]);

    window.setTimeout(() => {
      setSparkles((current) => current.filter((sparkle) => sparkle.id !== id));
    }, 900);
  }, []);

  const spawnHeart = useCallback(() => {
    const id = ++heartIdRef.current;
    const x = 5 + Math.random() * 90;

    setHearts((current) => [...current.slice(-12), { id, x, delay: Math.random() * 2 }]);

    window.setTimeout(() => {
      setHearts((current) => current.filter((heart) => heart.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    document.body.classList.add("easter-egg-myspace-active");

    const handleMouseMove = (event: MouseEvent) => {
      if (Math.random() > 0.5) return;
      addSparkle(event.clientX, event.clientY);
    };

    const handleClick = () => {
      if (music.needsInteraction) {
        void music.playCurrent();
      }
    };

    const visitorInterval = window.setInterval(() => {
      setVisitorCount((count) => count + Math.floor(Math.random() * 5) + 1);
    }, 1600);

    const heartInterval = window.setInterval(() => {
      if (Math.random() > 0.35) spawnHeart();
    }, 2200);

    const viewerInterval = window.setInterval(() => {
      if (Math.random() > 0.4) return;

      const id = Date.now();
      const name = VIEWER_NAMES[Math.floor(Math.random() * VIEWER_NAMES.length)];
      setViewerToast({ id, name });
      window.setTimeout(() => setViewerToast(null), 3200);
    }, 7000);

    const blinkInterval = window.setInterval(() => {
      setBlinkOn((current) => !current);
    }, 600);

    const cheatTimeout = window.setTimeout(() => setShowCheatToast(false), 2800);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      document.body.classList.remove("easter-egg-myspace-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.clearInterval(visitorInterval);
      window.clearInterval(heartInterval);
      window.clearInterval(viewerInterval);
      window.clearInterval(blinkInterval);
      window.clearTimeout(cheatTimeout);
    };
  }, [addSparkle, music, spawnHeart]);

  const moodText = music.track
    ? `♫ vibing 2 ${music.track.artist} ♫`
    : "♫ coding 2 pop-punk ♫";

  return (
    <>
      <div className={styles.tiledBg} aria-hidden="true" />

      <div className={styles.heartLayer} aria-hidden="true">
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className={styles.floatingHeart}
            style={{ left: `${heart.x}%`, animationDelay: `${heart.delay}s` }}
          >
            ♥
          </span>
        ))}
      </div>

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

        {viewerToast ? (
          <div className={styles.viewerToast} key={viewerToast.id}>
            {viewerToast.name} is viewing your profile!
          </div>
        ) : null}

        <div className={styles.marqueeBar}>
          <span className={styles.marqueeTrack}>
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
          </span>
        </div>

        <button type="button" className={styles.exitButton} onClick={onExit}>
          ✖ Exit MySpace (ESC)
        </button>

        <aside className={`${styles.panel} ${styles.profilePanel}`}>
          <h2 className={styles.panelTitle}>~* Mandar&apos;s Page *~</h2>
          <span className={styles.online}>● ONLINE NOW</span>
          <span className={styles.newBadge}>NEW!</span>
          <p className={styles.mood}>
            Mandar is: <strong>{moodText}</strong>
          </p>
          <p className={styles.mood}>
            Location: <strong>Mumbai, India</strong>
          </p>
          <p className={styles.mood}>
            Last Login: <strong>{blinkOn ? "2 min ago" : "just now!!!"}</strong>
          </p>
          <div className={styles.profileQuote}>
            &quot;life is short. make ur css sparkle.&quot;
          </div>
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
            {topFriends.map((project, index) => (
              <div key={project.id} className={styles.friend}>
                <div className={styles.friendRank}>#{index + 1}</div>
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
          <h2 className={styles.panelTitle}>Winamp 2.91</h2>

          {music.isLoading ? (
            <p className={styles.nowPlaying}>Loading random 2000s bangers…</p>
          ) : music.track ? (
            <>
              <div className={styles.playerRow}>
                {music.track.artworkUrl ? (
                  <Image
                    src={music.track.artworkUrl}
                    alt=""
                    width={52}
                    height={52}
                    className={styles.albumArt}
                    unoptimized
                  />
                ) : (
                  <div className={styles.albumArtPlaceholder}>CD</div>
                )}
                <div className={styles.trackMeta}>
                  <p className={styles.trackTitle}>{music.track.title}</p>
                  <p className={styles.trackArtist}>{music.track.artist}</p>
                  <p className={styles.trackYear}>{music.track.releaseYear}</p>
                </div>
              </div>

              <div
                className={`${styles.equalizer} ${music.isPlaying ? styles.equalizerActive : ""}`}
                aria-hidden="true"
              >
                <span className={styles.bar} />
                <span className={styles.bar} />
                <span className={styles.bar} />
                <span className={styles.bar} />
                <span className={styles.bar} />
                <span className={styles.bar} />
                <span className={styles.bar} />
              </div>

              <div className={styles.playerControls}>
                <button type="button" onClick={() => void music.togglePlay()}>
                  {music.isPlaying ? "⏸" : "▶"}
                </button>
                <button type="button" onClick={() => void music.skip()}>
                  ⏭
                </button>
                <button type="button" onClick={() => void music.shuffle()}>
                  🔀
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
                  🔊 Click 2 unmute (autoplay blocked lol)
                </button>
              ) : null}

              {music.error ? (
                <p className={styles.musicError}>{music.error}</p>
              ) : null}

              <p className={styles.musicCredit}>
                <small>30s previews via iTunes Search API</small>
              </p>
            </>
          ) : (
            <p className={styles.nowPlaying}>No tracks loaded :(</p>
          )}
        </aside>

        <aside className={`${styles.panel} ${styles.commentsPanel}`}>
          <h2 className={styles.panelTitle}>Comment Wall</h2>
          <ul className={styles.commentList}>
            {GUESTBOOK_ENTRIES.slice(0, 3).map((entry) => (
              <li key={entry.name} className={styles.commentItem}>
                <strong>{entry.name}:</strong> {entry.message}
              </li>
            ))}
          </ul>
        </aside>

        <aside className={`${styles.panel} ${styles.webRingPanel}`}>
          <h2 className={styles.panelTitle}>Web Ring</h2>
          <div className={styles.webRing}>
            {WEB_RING.map((site) => (
              <button
                key={site}
                type="button"
                className={styles.webRingLink}
                onClick={() => spawnHeart()}
              >
                {site}
              </button>
            ))}
          </div>
        </aside>

        <aside className={`${styles.panel} ${styles.statsPanel}`}>
          <p className={styles.visitorCount}>{visitorCount.toLocaleString()}</p>
          <p className={styles.visitorLabel}>profile views</p>
          <p className={styles.underConstruction}>🚧 UNDER CONSTRUCTION 🚧</p>
          <div className={styles.blinkies}>
            <span className={styles.blinkie}>HTML</span>
            <span className={styles.blinkie}>CSS</span>
            <span className={styles.blinkie}>JS</span>
          </div>
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
            <ul className={styles.guestbookEntries}>
              {GUESTBOOK_ENTRIES.map((entry) => (
                <li key={entry.name}>
                  <strong>{entry.name}</strong>: {entry.message}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setGuestbookOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
