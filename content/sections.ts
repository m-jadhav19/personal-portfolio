/**
 * Canonical section registry — mirrors prototype build order.
 * Used by navigation scroll-spy, Lenis anchors, and theme observer.
 */

export type SectionId =
  | "hero"
  | "about"
  | "projects"
  | "services"
  | "contact";

export type SectionDefinition = {
  id: SectionId;
  label: string;
  number?: string;
  /** Russell reference used #work — we use #projects */
  legacyId?: string;
  themeTrigger?: boolean;
};

export const pageSections: SectionDefinition[] = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About", number: "01" },
  { id: "projects", label: "Projects", number: "02", legacyId: "work" },
  { id: "services", label: "Services", number: "03" },
  { id: "contact", label: "Contact", number: "04", themeTrigger: true },
];

/** Section ids that toggle dark theme when centered (Contact) */
export const themeDarkSections = pageSections
  .filter((s) => s.themeTrigger)
  .map((s) => s.id);
