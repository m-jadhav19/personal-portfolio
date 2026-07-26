import { Hero } from "@/components/Hero";
import { Grid } from "@/components/layout/Grid";
import { Section } from "@/components/layout/Section";
import { portfolio } from "@/content/portfolio";

const sections = [
  {
    id: "about",
    label: "About",
    body: portfolio.aboutParaLine1,
  },
  {
    id: "projects",
    label: "Projects",
    body: `Selected work across ${portfolio.projects.length} builds — from 3D experiences to editorial interfaces.`,
  },
  {
    id: "contact",
    label: "Contact",
    body: portfolio.contact.cta,
  },
] as const;

export default function HomePage() {
  return (
    <main id="top">
      <Hero />

      {sections.map((section) => (
        <Section key={section.id} id={section.id}>
          <Grid>
            <div className="flex max-w-3xl flex-col gap-space-24">
              <p className="text-label text-muted">{section.label}</p>
              <h2 className="text-heading-xl">{section.label}</h2>
              <p className="text-body-l text-muted">{section.body}</p>
            </div>
          </Grid>
        </Section>
      ))}
    </main>
  );
}
