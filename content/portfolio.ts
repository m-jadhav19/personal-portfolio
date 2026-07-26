import type { Portfolio } from "@/lib/types";

export const portfolio: Portfolio = {
  name: "Mandar",
  headerTaglineOne: "Hello, I'm",
  headerTaglineTwo: "Mandar Jadhav",
  headerTaglineThree: "Frontend Developer",
  headerTaglineFour: "Developer based in Mumbai, India.",
  showBlog: false,
  showCursor: true,
  darkMode: false,
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
      src: "/me-clean.png",
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
      imageSrc: "/images/retro.png",
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
      imageSrc: "/images/brutualist.png",
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
      imageSrc: "/images/ply-app.png",
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
      imageSrc: "/images/epoch.png",
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
      imageSrc: "/images/auratry.png",
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
      imageSrc: "/images/ditherboy.png",
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
      imageSrc: "/images/3dportfolio.png",
      url: "https://3d-portfolio-zeta-ten.vercel.app/",
      tags: ["Three.js", "React Three Fiber", "GSAP"],
    },
  ],
  services: [
    {
      id: "1",
      title: "Art Direction",
      description:
        "We help with the creation and development of online advertising ideas, with particular focus on their visual appearance.",
    },
    {
      id: "2",
      title: "Branding",
      description:
        "We design key brand elements such as the logo, color scheme, typography, and other design components that makes your brand stand out from competitors.",
    },
    {
      id: "3",
      title: "Web Design",
      description:
        "We build and optimize your online presence. Website is the digital entry point into your business and a powerful revenue channel.",
    },
    {
      id: "4",
      title: "3D Design",
      description:
        "We combine creative design and technical skills to build striking 3D visualisations that bring your project to life.",
    },
  ],
  aboutParaLine1:
    "I am an enthusiastic and devoted Frontend Developer with experience in building responsive, user-friendly online apps as a professional and as a hobby. With a strong background in HTML, CSS, and JavaScript, I specialize in creating dynamic and engaging user interfaces using modern frameworks like React.js, Vue.js and Next.js.",
  aboutParaLine2:
    "In my recent projects, I've been working on constructing interactive 3D model viewers with Three.js, as well as complex property search functions that allow users to easily filter properties. My expertise includes increasing site performance and guaranteeing cross-browser compatibility, which improves the overall user experience.",
  aboutParaLine3:
    "Aside from coding, I enjoy gaming and game creation, and I am always searching for new methods to merge complex graphics and interactivity into web applications. I also love football, and when I have free time, I like to play and watch the game.",
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
