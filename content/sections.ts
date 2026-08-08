/**
 * Canonical section registry — mirrors prototype build order.
 * Used by navigation scroll-spy, Lenis anchors, and theme observer.
 */

export type SectionId =
  | "hero"
  | "about"
  | "projects"
  | "capabilities"
  | "experience"
  | "lab"
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
  { id: "projects", label: "Work", number: "01", legacyId: "work" },
  { id: "about", label: "About", number: "02" },
  { id: "lab", label: "Lab", number: "03" },
  { id: "experience", label: "Experience", number: "04" },
  { id: "capabilities", label: "Capabilities", legacyId: "services" },
  { id: "contact", label: "Contact", number: "05", themeTrigger: true },
];

/** Section ids that toggle dark theme when centered (Contact) */
export const themeDarkSections = pageSections
  .filter((s) => s.themeTrigger)
  .map((s) => s.id);
