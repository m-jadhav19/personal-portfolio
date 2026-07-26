import { ScrambleText } from "@/components/About/ScrambleText";
import { portfolio } from "@/content/portfolio";

import { BackToTopLink } from "./BackToTopLink";
import styles from "./ContactFooter.module.css";

export function ContactFooter() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.top}>
        <p className={styles.eyebrow}>(04) Contact</p>
        <p className={styles.availability}>
          <span aria-hidden="true" />
          {portfolio.hero.availability ? "Open to work" : "Currently booked"}
        </p>
      </div>

      <div className={styles.main}>
        <p className={styles.prompt}>{portfolio.contact.cta}</p>
        <ScrambleText
          as="h2"
          text="Get in touch"
          className={styles.heading}
        />
        <a
          className={styles.email}
          href={`mailto:${portfolio.contact.email}`}
          data-cursor="interactive"
        >
          {portfolio.contact.email}
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className={styles.details}>
        <div>
          <p className={styles.label}>Based in</p>
          <p>{portfolio.hero.location}</p>
        </div>

        <nav className={styles.socials} aria-label="Social links">
          <p className={styles.label}>Elsewhere</p>
          <div>
            {portfolio.socials.map((social) => (
              <a
                key={social.id}
                href={social.link}
                target={social.link.startsWith("http") ? "_blank" : undefined}
                rel={
                  social.link.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                data-cursor="interactive"
              >
                {social.title}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} {portfolio.name} Jadhav</p>
        <p>{portfolio.contact.credit}</p>
        <BackToTopLink>
          Back to top <span aria-hidden="true">↑</span>
        </BackToTopLink>
      </div>
    </footer>
  );
}
