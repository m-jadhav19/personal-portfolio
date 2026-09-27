import { ScrambleText } from "@/components/About/ScrambleText";
import { Magnetic } from "@/components/Cursor/Magnetic";
import { portfolio } from "@/content/portfolio";

import { BackToTopLink } from "./BackToTopLink";
import styles from "./ContactFooter.module.css";
import { DogTownHud } from "./DogTownHud";
import { DogTownScene } from "./DogTownScene";
import { LocalTime } from "./LocalTime";

export function ContactFooter() {
  const { contact, hero, socials } = portfolio;
  const phoneHref = `tel:${contact.phone.replace(/[^+\d]/g, "")}`;

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.stage}>
        <div className={styles.top}>
          <p className={styles.eyebrow}>(05) Contact</p>
          <p className={styles.availability}>
            <span aria-hidden="true" />
            {hero.availability ? "Available for work" : "Currently booked"}
          </p>
        </div>

        <div className={styles.main}>
          <p className={styles.prompt}>{contact.cta}</p>
          <ScrambleText
            as="h2"
            text="Get in touch"
            className={styles.heading}
          />
          <Magnetic strength={0.2}>
            <a
              className={styles.email}
              href={`mailto:${contact.email}`}
              data-cursor="link"
            >
              {contact.email}
              <span aria-hidden="true">↗</span>
            </a>
          </Magnetic>
        </div>

        <div className={styles.details}>
          <div>
            <p className={styles.label}>Based in</p>
            <p>{hero.location}</p>
          </div>

          <div>
            <p className={styles.label}>Local time</p>
            <LocalTime
              timezone={contact.timezone}
              label={contact.timezoneLabel}
              className={styles.clock}
            />
          </div>

          <div>
            <p className={styles.label}>Call</p>
            <p>
              <a href={phoneHref} data-cursor="link" className={styles.phone}>
                {contact.phone}
              </a>
            </p>
          </div>

          <nav className={styles.socials} aria-label="Social links">
            <p className={styles.label}>Elsewhere</p>
            <div>
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.link}
                  target={social.link.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.link.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  data-cursor="link"
                >
                  {social.title}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </nav>
        </div>

        <div className={styles.resumeNote}>
          Want the boring version?{" "}
          <Magnetic strength={0.2}>
            <a href={portfolio.resumeUrl} data-cursor="link">
              View résumé ↗
            </a>
          </Magnetic>
        </div>

        <DogTownScene
          dogName={contact.mascot.name}
          timezone={contact.timezone}
        />
      </div>

      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} {portfolio.name} Jadhav
        </p>
        <p className={styles.credit}>
          <span>{contact.credit}</span>
          <span aria-hidden="true" className={styles.creditDivider}>
            ·
          </span>
          <span>{contact.colophon}</span>
        </p>
        <DogTownHud dogName={contact.mascot.name} className={styles.hud} />
        <BackToTopLink>
          Back to top <span aria-hidden="true">↑</span>
        </BackToTopLink>
      </div>
    </footer>
  );
}
