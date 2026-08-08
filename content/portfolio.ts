import type { Portfolio } from "@/lib/types";
import { projectThumbnailSrc } from "@/lib/projectThumbnails";

export const portfolio: Portfolio = {
  name: "Mandar",
  headerTaglineOne: "Hello, I'm",
  headerTaglineTwo: "Mandar Jadhav",
  headerTaglineThree: "Frontend Engineer",
  headerTaglineFour: "Creative developer based in Mumbai, India.",
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
    roles: [
      "FRONTEND ENGINEER",
      "CREATIVE DEVELOPER",
      "INTERACTION / WEBGL",
    ],
    portrait: {
      src: "/portrait.png",
    },
    location: "Mumbai, India",
    availability: true,
  },
  heroStack: ["React", "Next.js", "TypeScript", "Three.js", "GSAP"],
  techTicker: [
    "REACT",
    "NEXT.JS",
    "TYPESCRIPT",
    "THREE.JS",
    "GSAP",
    "WEBGL",
    "CANVAS",
    "GRAPHQL",
  ],
  contact: {
    email: "jadhavmandar44@gmail.com",
    phone: "+91-8956193777",
    cta: "Let's build something interesting.",
    credit: "Designed & Developed by Mandar",
  },
  resumeUrl: "/resume",
  projects: [
    {
      id: "1",
      slug: "retro-cassette",
      title: "Retro Cassette",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description: "Spotify-powered cassette browser with motion-led discovery",
      impact:
        "Client-side Spotify OAuth + playback UI with Framer Motion browse transitions",
      contribution:
        "Built the full React app end-to-end: Spotify auth and playback wiring, cassette-style browse/search flows, and motion states that keep discovery feeling physical instead of like a generic media player. Owned layout, interaction timing, and API error/empty states.",
      imageSrc: projectThumbnailSrc("retro-cassette"),
      url: "https://retro-cassette.vercel.app/",
      tags: ["React", "Spotify API", "Framer Motion"],
      technologies: ["React", "Spotify API", "Framer Motion"],
      roles: ["Design", "Frontend", "Interaction"],
    },
    {
      id: "2",
      slug: "brutalist-ui",
      title: "Brutalist UI",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description: "Production-minded component library with Storybook coverage",
      impact:
        "40+ documented primitives — tokens, variants, and composition patterns in Storybook",
      contribution:
        "Designed and engineered a Next.js + Tailwind component system with typed props, consistent spacing/type tokens, and Storybook stories for each primitive. Focused on reusable architecture (composition over one-offs) so the library works as a real UI kit, not a visual demo.",
      imageSrc: projectThumbnailSrc("brutalist-ui"),
      url: "https://brutalist-components.vercel.app/",
      tags: ["Next.js", "Tailwind CSS", "Storybook"],
      technologies: ["Next.js", "Tailwind CSS", "Storybook"],
      roles: ["Design", "Frontend", "UI Engineering"],
    },
    {
      id: "3",
      slug: "ply-digital-workspace",
      title: "Ply - Digital Workspace",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description: "Canvas workspace with GSAP-driven spatial interaction",
      impact:
        "Canvas + GSAP interaction layer targeting 60fps pan, drag, and settle motion",
      contribution:
        "Implemented a React + Canvas workspace where cards and surfaces respond to drag, inertia, and scroll-linked GSAP timelines. Tuned transform/compositing paths so motion stays smooth under load, and structured the UI so interaction logic stays separate from presentational components.",
      imageSrc: projectThumbnailSrc("ply-digital-workspace"),
      url: "https://ply-app-delta.vercel.app/",
      tags: ["React", "GSAP", "Canvas"],
      technologies: ["React", "GSAP", "Canvas"],
      roles: ["Design", "Frontend", "Interaction"],
    },
    {
      id: "4",
      slug: "epoch-world-timer",
      title: "Epoch - World Timer",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description: "Multi-timezone dashboard with Luxon-accurate scrubbing",
      impact:
        "Luxon timezone engine + Radix UI controls for live multi-city time scrubbing",
      contribution:
        "Shipped a Next.js world-time dashboard with Luxon for DST-safe conversions and a scrubbable timeline for comparing cities. Used Radix primitives for accessible controls, and kept the time-travel metaphor readable so operators can scan offsets without losing precision.",
      imageSrc: projectThumbnailSrc("epoch-world-timer"),
      url: "https://globalsync-world-timer.vercel.app/",
      tags: ["Next.js", "Luxon", "Radix UI"],
      technologies: ["Next.js", "Luxon", "Radix UI"],
      roles: ["Design", "Frontend"],
    },
    {
      id: "5",
      slug: "auratry-virtual-try-on",
      title: "AuraTry - Virtual Try On",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description: "Browser AR try-on with landmark-locked 3D overlays",
      impact:
        "MediaPipe face mesh → Three.js accessory overlays at camera frame rate",
      contribution:
        "Built a React webcam pipeline that feeds MediaPipe landmarks into Three.js meshes so accessories stay locked to the face in real time. Handled calibration, occlusion-friendly layering, and performance so the try-on feels product-ready in a browser tab — no native app required.",
      imageSrc: projectThumbnailSrc("auratry-virtual-try-on"),
      url: "https://virtual-try-on-lac.vercel.app/",
      tags: ["Mediapipe", "Three.js", "React"],
      technologies: ["Mediapipe", "Three.js", "React"],
      roles: ["Frontend", "3D", "Interaction"],
    },
    {
      id: "6",
      slug: "ditherboy",
      title: "DitherBoy",
      year: "2024",
      role: "Design & Development",
      status: "Completed",
      description: "Live GLSL dithering editor with tunable image pipelines",
      impact:
        "Fragment-shader dither pipeline with live threshold, palette, and grain controls",
      contribution:
        "Engineered a Next.js + Three.js tool where GLSL shaders run the dither pipeline on the GPU. Exposed threshold, palette, and grain as live uniforms so artists get instant feedback, and structured the UI around a clear process: upload → tune → export.",
      imageSrc: projectThumbnailSrc("ditherboy"),
      url: "https://dithered-editor.vercel.app/",
      tags: ["GLSL", "Three.js", "Next.js"],
      technologies: ["GLSL", "Three.js", "Next.js"],
      roles: ["Frontend", "Shaders", "Creative Coding"],
    },
    {
      id: "7",
      slug: "3d-portfolio-website",
      title: "3D Portfolio Website",
      year: "2025",
      role: "Design & Development",
      status: "In Progress",
      description: "R3F scene with GSAP-orchestrated camera navigation",
      impact:
        "React Three Fiber scene graph + GSAP camera paths for spatial project browsing",
      contribution:
        "Prototyping a navigable 3D portfolio in React Three Fiber: scene composition, lighting, and GSAP-driven camera transitions between project nodes. Goal is intentional spatial browsing — clear wayfinding and readable hierarchy — not a gimmick flythrough.",
      imageSrc: projectThumbnailSrc("3d-portfolio-website"),
      url: "https://3d-portfolio-zeta-ten.vercel.app/",
      tags: ["Three.js", "React Three Fiber", "GSAP"],
      technologies: ["Three.js", "React Three Fiber", "GSAP"],
      roles: ["Design", "3D", "Frontend"],
    },
  ],
  capabilities: [
    {
      id: "1",
      title: "Frontend Engineering",
      imageSrc: projectThumbnailSrc("retro-cassette"),
      items: [
        "React / Next.js / Vue / Nuxt",
        "TypeScript component architecture",
        "API integration & state flows",
        "Performance & responsive systems",
      ],
    },
    {
      id: "2",
      title: "Interaction",
      imageSrc: projectThumbnailSrc("ply-digital-workspace"),
      items: [
        "GSAP timelines & ScrollTrigger",
        "Canvas interaction systems",
        "WebGL hover / distortion effects",
        "Motion that survives production constraints",
      ],
    },
    {
      id: "3",
      title: "3D Development",
      imageSrc: projectThumbnailSrc("3d-portfolio-website"),
      items: [
        "Three.js / React Three Fiber",
        "GLSL shaders & post-processing",
        "Camera / scene orchestration",
        "Realtime landmark-driven overlays",
      ],
    },
    {
      id: "4",
      title: "UI Engineering",
      imageSrc: projectThumbnailSrc("brutalist-ui"),
      items: [
        "Design systems & tokens",
        "Composable component APIs",
        "Storybook documentation",
        "Accessible, production-ready UI",
      ],
    },
  ],
  capabilitiesIntro:
    "I ship frontend systems — component architecture, motion, and 3D when the product needs it — from prototype to production.",
  aboutCopy:
    "I design and build digital experiences with a focus on craft, motion, and interaction — creating interfaces where every detail feels intentional. Based in Mumbai, I work across React, Next.js, Vue, and GSAP to turn ideas into polished, responsive products that hold up in production.",
  technicalStack: [
    {
      id: "frontend",
      label: "Frontend",
      items: ["React", "Next.js", "TypeScript", "Vue", "Nuxt"],
    },
    {
      id: "creative",
      label: "Creative",
      items: ["Three.js", "R3F", "GSAP", "WebGL", "Canvas", "GLSL"],
    },
    {
      id: "backend",
      label: "Backend",
      items: ["Node.js", "GraphQL", "REST", ".NET APIs"],
    },
    {
      id: "tools",
      label: "Tools",
      items: ["Git", "Figma", "Vite", "Storybook"],
    },
  ],
  stats: {
    yearsExperience: "3+",
    projectsCompleted: 7,
    technologiesMastered: 12,
    happyClients: 3,
  },
  metrics: [
    { value: "03+", label: "Years", sublabel: "Professional experience" },
    { value: "07", label: "Selected", sublabel: "Projects" },
    { value: "∞", label: "Experiments", sublabel: "" },
    { value: "01", label: "Very", sublabel: "Curious developer" },
  ],
  featuredSkills: [
    { name: "React", icon: "CodeBracketIcon", color: "pastelCyan" },
    { name: "Next.js", icon: "CommandLineIcon", color: "pastelLavender" },
    { name: "Three.js", icon: "CpuChipIcon", color: "pastelMint" },
    { name: "Figma", icon: "PaintBrushIcon", color: "pastelPink" },
    { name: "GSAP", icon: "InfinityIcon", color: "pastelCyan" },
  ],
  experiences: [
    {
      id: "1",
      dates: "January 2025 — Present",
      type: "Full Time",
      position: "Frontend Engineer",
      company: "ShipDelight Logistics Technologies",
      stack: ["Vue", "Nuxt", "React", "TypeScript", "Tailwind CSS"],
      summary: "Frontend · Logistics · Post-purchase platforms",
      bullets: [
        "Own frontend delivery for post-purchase logistics UIs used by merchant and ops workflows",
        "Ship Vue/Nuxt and React features against REST APIs — tables, status flows, and responsive layouts that stay fast under real data",
        "Tighten UX and performance on high-traffic screens so operators can scan shipments without fighting the interface",
      ],
    },
    {
      id: "2",
      dates: "August 2022 — May 2024",
      type: "Full Time",
      position: "Associate IoT Engineer / Team Lead",
      company: "Futurism Technologies",
      stack: ["React", "Vue", "Three.js", "GraphQL"],
      summary: "Frontend · IoT · Data Visualization",
      bullets: [
        "Led frontend for IoT dashboards — device state, alerts, and operator views over GraphQL/REST",
        "Built interactive data visualizations (including Three.js where spatial context helped) for live telemetry",
        "Mentored juniors on component structure, reviews, and shipping stable UI against hardware-backed APIs",
      ],
    },
  ],
  exploring: [
    "WEBGL",
    "SHADERS",
    "GENERATIVE ART",
    "DATAMOSHING",
    "PIXEL SORTING",
    "CREATIVE CODING",
  ],
  experiments: [
    {
      id: "1",
      title: "Image Distortion System",
      stack: ["WebGL", "Canvas", "GLSL"],
      blurb:
        "Reusable GLSL pass for RGB split, displacement, and scanline — tuned for short hover bursts",
      status: "Active",
    },
    {
      id: "2",
      title: "Datamoshing Studies",
      stack: ["Canvas", "Pixel sorting"],
      blurb:
        "Frame-delta and compression-artifact techniques treated as controllable visual parameters",
      status: "Exploring",
    },
    {
      id: "3",
      title: "Pixel Sorting",
      stack: ["Canvas", "Image processing"],
      blurb:
        "Luminance / channel sort kernels for generative stills and transition frames",
      status: "Exploring",
    },
    {
      id: "4",
      title: "Shader Sketches",
      stack: ["GLSL", "Three.js"],
      blurb:
        "Fragment-shader notebooks for noise, light falloff, and texture synthesis",
      status: "Active",
    },
    {
      id: "5",
      title: "Generative Typography",
      stack: ["Canvas", "GSAP"],
      blurb:
        "Procedural scramble / warp / settle cycles on display type for section intros",
      status: "Exploring",
    },
    {
      id: "6",
      title: "Three.js Experiments",
      stack: ["Three.js", "R3F"],
      blurb:
        "Small R3F scenes testing camera paths, instancing, and interaction picking",
      status: "Active",
    },
  ],
  resume: {
    tagline: "Creative Developer and Frontend Engineer.",
    description:
      "I build production frontend systems with React, Vue, TypeScript, and motion/3D when the product needs it — from logistics UIs to interactive WebGL experiences.",
    experiences: [
      {
        id: "1",
        dates: "January 2025 — Present",
        type: "Full Time",
        position: "Frontend Engineer",
        company: "ShipDelight Logistics Technologies",
        stack: ["Vue", "Nuxt", "React", "TypeScript", "Tailwind CSS"],
        summary: "Frontend · Logistics · Post-purchase platforms",
        bullets: [
          "Own frontend delivery for post-purchase logistics UIs used by merchant and ops workflows",
          "Ship Vue/Nuxt and React features against REST APIs — tables, status flows, and responsive layouts that stay fast under real data",
          "Tighten UX and performance on high-traffic screens so operators can scan shipments without fighting the interface",
        ],
      },
      {
        id: "2",
        dates: "August 2022 — May 2024",
        type: "Full Time",
        position: "Associate IoT Engineer / Team Lead",
        company: "Futurism Technologies",
        stack: ["React", "Vue", "Three.js", "GraphQL"],
        summary: "Frontend · IoT · Data Visualization",
        bullets: [
          "Led frontend for IoT dashboards — device state, alerts, and operator views over GraphQL/REST",
          "Built interactive data visualizations (including Three.js where spatial context helped) for live telemetry",
          "Mentored juniors on component structure, reviews, and shipping stable UI against hardware-backed APIs",
        ],
      },
    ],
    education: {
      universityName: "MIT ADT University",
      universityDate: "2018-2021",
      universityPara: "",
    },
    languages: ["Javascript", "HTML5", "CSS", "TypeScript"],
    frameworks: ["React", "Next.js", "Vue.js", "Nuxt", "Tailwind CSS"],
    others: ["Figma", "Three.js", "GSAP", "GraphQL"],
  },
};
