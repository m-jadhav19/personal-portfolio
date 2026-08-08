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
  /** Recruiter-facing one-liner about what was accomplished */
  impact?: string;
  /** Short case-study style contribution (100–150 words) */
  contribution?: string;
  /** Structured stack for the technical strip */
  technologies?: string[];
  /** Roles played on the project */
  roles?: string[];
  caseStudyUrl?: string;
};

export type Capability = {
  id: string;
  title: string;
  imageSrc: string;
  items: string[];
};

/** @deprecated Use Capability — kept for transitional imports */
export type Service = Capability;

export type Experience = {
  id: string;
  dates: string;
  type: string;
  position: string;
  bullets: string[];
  company?: string;
  stack?: string[];
  summary?: string;
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

export type TechnicalStackCategory = {
  id: string;
  label: string;
  items: string[];
};

export type MetricItem = {
  value: string;
  label: string;
  sublabel?: string;
};

export type Experiment = {
  id: string;
  title: string;
  stack: string[];
  blurb: string;
  status?: string;
  url?: string;
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
  capabilities: Capability[];
  capabilitiesIntro: string;
  /** @deprecated alias — prefer capabilities */
  services?: Capability[];
  servicesIntro?: string;
  aboutCopy: string;
  technicalStack: TechnicalStackCategory[];
  techTicker: string[];
  heroStack: string[];
  stats: {
    yearsExperience: string;
    projectsCompleted: number;
    technologiesMastered: number;
    happyClients: number;
  };
  metrics: MetricItem[];
  featuredSkills: {
    name: string;
    icon: string;
    color: string;
  }[];
  resume: Resume;
  resumeUrl: string;
  experiences: Experience[];
  exploring: string[];
  experiments: Experiment[];
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
