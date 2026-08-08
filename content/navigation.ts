import { portfolio } from "@/content/portfolio";

export type NavigationItem = {
  id: string;
  label: string;
  number: string;
};

export const navigation: NavigationItem[] = [
  { id: "projects", label: "Work", number: "01" },
  { id: "about", label: "About", number: "02" },
  { id: "lab", label: "Lab", number: "03" },
  { id: "experience", label: "Experience", number: "04" },
  { id: "contact", label: "Contact", number: "05" },
];

export type MobileExtraLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const mobileExtraLinks: MobileExtraLink[] = [
  {
    label: "Resume",
    href: portfolio.resumeUrl,
  },
  { label: "Github", href: "https://github.com/m-jadhav19/", external: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mjadhav19/",
    external: true,
  },
];
