import type { Portfolio } from "@/lib/types";
import { projectThumbnailSrc } from "@/lib/projectThumbnails";

export const portfolio: Portfolio = {
  name: "Mandar",
  headerTaglineOne: "Hello, I'm",
  headerTaglineTwo: "Mandar Jadhav",
  headerTaglineThree: "Frontend Developer",
  headerTaglineFour: "Developer based in Mumbai, India.",
  showBlog: false,
  showCursor: true,
  darkMode: true,
  socials: [
    {
      id: "1",
      title: "Github",
      link: "https://github.com/m-jadhav19/",
    },
    {
      id: "2",
      title: "LinkedIn",
      link: "https://www.linkedin.com/in/mjadhav19/",
    },
    {
      id: "3",
      title: "Email",
      link: "mailto:jadhavmandar44@gmail.com",
    },
  ],
  hero: {
    roles: ["Frontend Developer", "UX/UI Designer", "Creative"],
    portrait: {
      src: "/portrait.png",
    },
    location: "Mumbai, India",
    availability: true,
  },
  contact: {
    email: "jadhavmandar44@gmail.com",
    phone: "",
    cta: "Have a project in mind?",
    credit: "Designed & Developed by Mandar",
  },
  projects: [
    {
      id: "1",
      slug: "retro-cassette",
      title: "Retro Cassette",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description:
        "A platform that allows users to search and stream their own retro cassette tapes",
      imageSrc: projectThumbnailSrc("retro-cassette"),
      url: "https://retro-cassette.vercel.app/",
      tags: ["React", "Spotify API", "Framer Motion"],
    },
    {
      id: "2",
      slug: "brutalist-ui",
      title: "Brutalist UI",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description:
        "Brutalist UI components library for a Raw. Bold. Minimalist. Design.",
      imageSrc: projectThumbnailSrc("brutalist-ui"),
      url: "https://brutalist-components.vercel.app/",
      tags: ["Next.js", "Tailwind CSS", "Storybook"],
    },
    {
      id: "3",
      slug: "ply-digital-workspace",
      title: "Ply - Digital Workspace",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description:
        "A tactile digital workspace where ideas come to life through motion, intuition, and design.",
      imageSrc: projectThumbnailSrc("ply-digital-workspace"),
      url: "https://ply-app-delta.vercel.app/",
      tags: ["React", "GSAP", "Canvas"],
    },
    {
      id: "4",
      slug: "epoch-world-timer",
      title: "Epoch - World Timer",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description:
        "A sleek world-time dashboard with an interactive time-travel experience.",
      imageSrc: projectThumbnailSrc("epoch-world-timer"),
      url: "https://globalsync-world-timer.vercel.app/",
      tags: ["Next.js", "Luxon", "Radix UI"],
    },
    {
      id: "5",
      slug: "auratry-virtual-try-on",
      title: "AuraTry - Virtual Try On",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description:
        "A web app that allows users to try on AR Accessories virtually",
      imageSrc: projectThumbnailSrc("auratry-virtual-try-on"),
      url: "https://virtual-try-on-lac.vercel.app/",
      tags: ["Mediapipe", "Three.js", "React"],
    },
    {
      id: "6",
      slug: "ditherboy",
      title: "DitherBoy",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description: "A Photo Dithering Effect Generator",
      imageSrc: projectThumbnailSrc("ditherboy"),
      url: "https://dithered-editor.vercel.app/",
      tags: ["GLSL", "Three.js", "Next.js"],
    },
    {
      id: "7",
      slug: "3d-portfolio-website",
      title: "3D Portfolio Website",
      year: "2025",
      role: "Design & Development",
      status: "In Progress",
      description:
        "A 3D portfolio website that allows users to view 3D models in a 3D environment",
      imageSrc: projectThumbnailSrc("3d-portfolio-website"),
      url: "https://3d-portfolio-zeta-ten.vercel.app/",
      tags: ["Three.js", "React Three Fiber", "GSAP"],
    },
  ],
  services: [
    {
      id: "1",
      title: "Art Direction",
      imageSrc: projectThumbnailSrc("retro-cassette"),
      items: [
        "Visual strategy",
        "Creative concept",
        "Art supervision",
        "Brand storytelling",
      ],
    },
    {
      id: "2",
      title: "Branding",
      imageSrc: projectThumbnailSrc("brutalist-ui"),
      items: [
        "Brand identity",
        "Logo design",
        "Visual language",
        "Style guide",
      ],
    },
    {
      id: "3",
      title: "Digital Design",
      imageSrc: projectThumbnailSrc("ply-digital-workspace"),
      items: [
        "UI/UX design",
        "Prototyping",
        "Design systems",
        "Interaction design",
      ],
    },
    {
      id: "4",
      title: "Development",
      imageSrc: projectThumbnailSrc("epoch-world-timer"),
      items: [
        "Frontend development",
        "React / Next.js",
        "Motion & interactions",
        "Responsive design",
      ],
    },
  ],
  servicesIntro:
    "I'm not a founder, a CEO, or a strategist hiding behind a title. I'm just a creator. Someone who designs, builds, and thinks in equal measure, using that mix to take ideas from first sketch to live product with the care they deserve.",
  aboutCopy:
    "I design and build digital experiences with a focus on craft, motion, and interaction — creating interfaces where every detail feels intentional. Based in Mumbai, I work across React, Next.js, and GSAP to turn ideas into polished, responsive products.",
  stats: {
    yearsExperience: "2+",
    projectsCompleted: 7,
    technologiesMastered: 12,
    happyClients: 3,
  },
  featuredSkills: [
    { name: "React", icon: "CodeBracketIcon", color: "pastelCyan" },
    { name: "Next.js", icon: "CommandLineIcon", color: "pastelLavender" },
    { name: "Three.js", icon: "CpuChipIcon", color: "pastelMint" },
    { name: "Figma", icon: "PaintBrushIcon", color: "pastelPink" },
    { name: "GSAP", icon: "InfinityIcon", color: "pastelCyan" },
  ],
  resume: {
    tagline: "I'm a Creative Developer and Frontend Engineer.",
    description:
      "I create top-class user experiences using modern frontend tools and design principles. Well-versed with React, JavaScript, Three.js, and the modern web stack.",
    experiences: [
      {
        id: "1",
        dates: "August 2022 - May 2024",
        type: "Full Time",
        position: "IoT Engineer",
        bullets: [
          "Worked on building Web applications for IoT purposes",
          "Worked with IoT devices",
        ],
      },
      {
        id: "2",
        dates: "January 2025 - Present",
        type: "Full Time",
        position: "Frontend Developer",
        bullets: [
          "Worked on building Web applications for post-purchase platform and solutions for the clients",
          "Worked with Nuxt, Vue.js Tailwind CSS, and Javascript",
        ],
      },
    ],
    education: {
      universityName: "MIT ADT University",
      universityDate: "2018-2021",
      universityPara: "",
    },
    languages: ["Javascript", "HTML5", "CSS", "TypeScript"],
    frameworks: ["React", "Next.js", "Vue.js", "Tailwind CSS"],
    others: ["Figma", "Three.js", "GSAP"],
  },
};
