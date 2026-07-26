export type NavigationItem = {
  id: string;
  label: string;
  number: string;
};

export const navigation: NavigationItem[] = [
  { id: "about", label: "About", number: "01" },
  { id: "projects", label: "Projects", number: "02" },
  { id: "contact", label: "Contact", number: "03" },
];

export type MobileExtraLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const mobileExtraLinks: MobileExtraLink[] = [
  { label: "Resume", href: "/resume" },
  { label: "Github", href: "https://github.com/m-jadhav19/", external: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mjadhav19/",
    external: true,
  },
];
