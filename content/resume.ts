export const resumeDocument = {
  name: "Mandar Jadhav",
  email: "jadhavmandar44@gmail.com",
  phone: "+91-8956193777",
  links: [
    { label: "Portfolio", href: "https://mandar.is-a.dev/" },
    { label: "GitHub", href: "https://github.com/m-jadhav19/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mjadhav19/" },
  ],
  /** Served from public/Mandar_Jadhav_Resume.pdf */
  pdfPath: "/Mandar_Jadhav_Resume.pdf",
  summary:
    "Frontend Developer specializing in building modern, responsive web applications and IoT solutions.",
  highlights: [
    {
      title: "Cross-Framework Development",
      body: "Experienced across React.js, Vue.js, and Next.js, building production-grade interfaces for e-commerce and B2B/D2C platforms.",
    },
    {
      title: "Mentorship & Process Improvement",
      body: "Mentored junior developers and introduced collaboration tools that improved team productivity and delivery speed.",
    },
    {
      title: "Web3 and IoT",
      body: "Prior experience with Web3 and IoT projects, integrating emerging technologies into scalable solutions.",
    },
  ],
  skills: [
    {
      label: "Languages & Technologies",
      items: "HTML5, CSS3, JavaScript, TypeScript, PHP, C#",
    },
    {
      label: "Frameworks & Libraries",
      items: "React.js, Next.js, Vue.js, Nuxt, React Native",
    },
    {
      label: "Web3 & UI/UX",
      items: "Solidity, Web3.js, Figma, Redux, Bootstrap, Tailwind CSS",
    },
    {
      label: "E-Commerce",
      items: "Shopify App Development, B2B/D2C Platform Integrations",
    },
    {
      label: "Performance & Optimization",
      items: "Code Splitting, Lazy Loading, Web Performance Optimization (WPO)",
    },
    {
      label: "Testing & Debugging",
      items: "Jest, Mocha, React Testing Library, Chrome DevTools",
    },
    {
      label: "Collaboration & Communication",
      items: "Agile/Scrum, Jira, Trello",
    },
  ],
  experience: [
    {
      role: "Frontend Developer",
      dates: "January 2025 — Present",
      company: "ShipDelight Logistics Technologies",
      location: "Mumbai, India",
      items: [
        {
          title: "Multi-Framework Development",
          body: "Built and maintained responsive web applications using Vue.js and Next.js, delivering seamless user experiences across logistics platforms.",
        },
        {
          title: "Shopify App Development",
          body: "Developed custom Shopify applications, extending platform functionality to meet merchant-specific requirements.",
        },
        {
          title: "B2B/D2C Operations",
          body: "Contributed to applications supporting both B2B and D2C business operations, streamlining order management and customer-facing workflows.",
        },
      ],
    },
    {
      role: "Associate IoT Engineer",
      dates: "August 2022 — May 2024",
      company: "Futurism Technologies Pvt. Ltd.",
      location: "Pune, India",
      items: [
        {
          title: "Led Team Development",
          body: "Spearheaded UI development for IoT projects, improving efficiency by 20%.",
        },
        {
          title: "Optimized Operations",
          body: "Enhanced frontend performance, reducing load times by 30%.",
        },
        {
          title: "Managed Initiatives",
          body: "Streamlined project meetings, achieving a 15% faster delivery rate.",
        },
      ],
    },
  ],
  projects: [
    {
      title: "Post-Purchase SaaS Platform",
      year: "2025",
      stack: "Vue.js, Nuxt, Next.js, Tailwind CSS",
      items: [
        {
          title: "Product Development",
          body: "Built and maintained core frontend modules for a SaaS platform serving B2B and D2C e-commerce clients.",
        },
        {
          title: "Shopify Integrations",
          body: "Developed custom Shopify applications to extend platform capabilities for merchant workflows.",
        },
      ],
    },
    {
      title: "Property Search",
      year: "2024",
      stack: "Vue.js and Maptiler",
      items: [
        {
          title: "Interactive Mapping",
          body: "Created an interactive map with property markers and filters for precise searches.",
        },
      ],
    },
    {
      title: "Retro Cassette",
      year: "2023",
      stack: "React, Spotify API, Framer Motion",
      items: [
        {
          title: "Music Streaming",
          body: "Built a platform enabling users to search and stream their own retro cassette tapes with smooth, animated interactions.",
        },
      ],
    },
  ],
  education: [
    {
      school: "MIT ADT University",
      location: "Pune, India",
      degree: "B.Tech in Computer Science and Engineering",
      dates: "2018 — 2021",
    },
  ],
} as const;
