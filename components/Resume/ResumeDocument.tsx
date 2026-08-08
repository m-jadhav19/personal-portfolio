import { resumeDocument } from "@/content/resume";

import styles from "./ResumeDocument.module.css";

export function ResumeDocument() {
  const resume = resumeDocument;

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.name}>{resume.name}</h1>
        <p className={styles.meta}>
          <a href={`mailto:${resume.email}`}>{resume.email}</a>
          {resume.links.map((link) => (
            <span key={link.href}>
              {" · "}
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </span>
          ))}
          {" · "}
          <span>{resume.phone}</span>
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Career Summary</h2>
        <p className={styles.summary}>{resume.summary}</p>
        <p className={styles.highlightsLabel}>
          <strong>Key Highlights:</strong>
        </p>
        <ul className={styles.list}>
          {resume.highlights.map((item) => (
            <li key={item.title}>
              <strong>{item.title}:</strong> {item.body}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <ul className={styles.skills}>
          {resume.skills.map((skill) => (
            <li key={skill.label}>
              <strong>{skill.label}:</strong> {skill.items}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Work Experience</h2>
        {resume.experience.map((job) => (
          <div key={`${job.company}-${job.dates}`} className={styles.entry}>
            <div className={styles.entryHead}>
              <strong>{job.role}</strong>
              <span>{job.dates}</span>
            </div>
            <div className={styles.entrySub}>
              <em>{job.company}</em>
              <em>{job.location}</em>
            </div>
            <ul className={styles.list}>
              {job.items.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}:</strong> {item.body}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Projects</h2>
        {resume.projects.map((project) => (
          <div key={project.title} className={styles.entry}>
            <div className={styles.entryHead}>
              <strong>{project.title}</strong>
              <span>{project.year}</span>
            </div>
            <div className={styles.entrySub}>
              <em>{project.stack}</em>
              <span />
            </div>
            <ul className={styles.list}>
              {project.items.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}:</strong> {item.body}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Education</h2>
        {resume.education.map((edu) => (
          <div key={edu.school} className={styles.entry}>
            <div className={styles.entryHead}>
              <strong>{edu.school}</strong>
              <span>{edu.location}</span>
            </div>
            <div className={styles.entrySub}>
              <em>{edu.degree}</em>
              <em>{edu.dates}</em>
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}
