export type Social = {
  id: string;
  title: string;
  link: string;
};

export type Project = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  imageSrc: string;
  url: string;
  tags: string[];
  year?: string;
  role?: string;
  status?: string;
};

export type Service = {
  id: string;
  title: string;
  imageSrc: string;
  items: string[];
};

export type Experience = {
  id: string;
  dates: string;
  type: string;
  position: string;
  bullets: string[];
};

export type Resume = {
  tagline: string;
  description: string;
  experiences: Experience[];
  education: {
    universityName: string;
    universityDate: string;
    universityPara: string;
  };
  languages: string[];
  frameworks: string[];
  others: string[];
};

export type Portfolio = {
  name: string;
  headerTaglineOne: string;
  headerTaglineTwo: string;
  headerTaglineThree: string;
  headerTaglineFour: string;
  showBlog: boolean;
  showCursor: boolean;
  darkMode: boolean;
  socials: Social[];
  projects: Project[];
  services: Service[];
  servicesIntro: string;
  aboutCopy: string;
  stats: {
    yearsExperience: string;
    projectsCompleted: number;
    technologiesMastered: number;
    happyClients: number;
  };
  featuredSkills: {
    name: string;
    icon: string;
    color: string;
  }[];
  resume: Resume;
  hero: {
    roles: string[];
    portrait: {
      src: string;
    };
    location: string;
    availability: boolean;
  };
  contact: {
    email: string;
    phone: string;
    cta: string;
    credit: string;
  };
};
