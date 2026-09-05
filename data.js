/**
 * ============================================================
 *  data.js — ALL your personal content lives here.
 *  Edit this file to update the site. You should not need to
 *  touch index.html, styles.css or script.js for content changes.
 * ============================================================
 */

const SITE_DATA = {
  personal: {
    name: "Jordan Avery",
    role: "Full-Stack Developer & UI Engineer",
    tagline:
      "I build fast, thoughtful interfaces and the systems that power them.",
    email: "jordan.avery@example.com",
    location: "Remote / Based in your city",
    // Path to profile photo. Replace with your own image in assets/images/,
    // or use Edit Mode in the browser to upload one (saved to localStorage).
    photo: "assets/images/profile-placeholder.svg",
    bio: [
      "I'm a developer who likes turning ambiguous problems into clean, usable products. My background spans front-end engineering, small-scale systems design, and a fair amount of debugging things at 1am.",
      "Outside of code, I'm usually reading about design systems, tinkering with side projects, or trying to make my coffee slightly better than the last batch."
    ],
    resumeFile: "assets/resume/resume.pdf"
  },

  social: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    email: "mailto:jordan.avery@example.com",
    twitter: "" // leave blank to hide
  },

  nav: [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" }
  ],

  skills: [
    { name: "JavaScript / TypeScript", level: 90 },
    { name: "React", level: 85 },
    { name: "Node.js", level: 78 },
    { name: "HTML / CSS", level: 92 },
    { name: "Python", level: 70 },
    { name: "SQL", level: 65 },
    { name: "Git / GitHub", level: 88 },
    { name: "UI / UX Design", level: 72 }
  ],

  // Freeform tags shown alongside the skill bars (tools, not proficiency-rated)
  tools: [
    "VS Code", "Figma", "Docker", "Vite", "Tailwind CSS",
    "PostgreSQL", "REST APIs", "Vercel"
  ],

  // Projects can also be added/removed live via the "Add Project" button
  // in Edit Mode — those are stored in localStorage and merged with this list.
  projects: [
    {
      id: "proj-1",
      title: "Project One",
      description:
        "A short, punchy description of what this project does and the problem it solves for its users.",
      image: "assets/images/project-placeholder-1.svg",
      tech: ["React", "Node.js", "PostgreSQL"],
      liveUrl: "https://example.com",
      repoUrl: "https://github.com/yourusername/project-one"
    },
    {
      id: "proj-2",
      title: "Project Two",
      description:
        "Another project summary — focus on the outcome or impact, not just the tech stack.",
      image: "assets/images/project-placeholder-2.svg",
      tech: ["Python", "Flask", "Docker"],
      liveUrl: "https://example.com",
      repoUrl: "https://github.com/yourusername/project-two"
    },
    {
      id: "proj-3",
      title: "Project Three",
      description:
        "A third example project card. Swap this content for your real work, or delete it in Edit Mode.",
      image: "assets/images/project-placeholder-3.svg",
      tech: ["TypeScript", "Vite", "Tailwind"],
      liveUrl: "https://example.com",
      repoUrl: "https://github.com/yourusername/project-three"
    }
  ],

  // Timeline — mix experience and education, sorted newest first.
  timeline: [
    {
      type: "work",
      title: "Software Engineer",
      org: "Company Name",
      period: "2024 — Present",
      description:
        "Brief description of your role, responsibilities and a notable achievement or two."
    },
    {
      type: "education",
      title: "B.S. in Computer Science",
      org: "University Name",
      period: "2020 — 2024",
      description:
        "Relevant coursework, honors, or academic projects worth mentioning."
    },
    {
      type: "work",
      title: "Frontend Intern",
      org: "Previous Company",
      period: "2023 — 2023",
      description:
        "What you built, learned, or shipped during this role."
    }
  ]
};
