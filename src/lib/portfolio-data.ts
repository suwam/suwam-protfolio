import saiketOfferLetter from "@/assets/saiket-offer-letter.png";
import itineraryVoyagerImage from "@/assets/itinerary-voyager.png";
import mazeGeneratorImage from "@/assets/maze-generator.png";
import fileCompressionImage from "@/assets/file-compression.png";

export const PORTFOLIO = {
  name: "Suwam Subedi",
  shortName: "Suwam",
  role: "Computer Engineering Student & Developer",
  intro:
    "I build practical web and mobile products with React, Flutter, Node.js and Firebase - turning ideas into clean, usable software.",
  about:
    "I'm a Computer Engineering student focused on product-minded software development. I enjoy building full-stack apps, mobile experiences and thoughtful interfaces that solve real problems. My work blends engineering fundamentals with a strong eye for UI, performance and maintainable code.",
  email: "suwamsubedi30@gmail.com",
  phones: ["9865407952", "9709043147"],
  socials: {
    github: "https://github.com/suwam",
    linkedin: "https://www.linkedin.com/in/suwam-subedi-40024a358/",
    facebook: "https://www.facebook.com/suwam.subedi.2025",
    instagram: "https://www.instagram.com/suwam_subedi/?__pwa=1",
  },
  cvUrl: "/docs/suwam-subedi-cv.pdf",
  stats: [
    { value: "3+", label: "Years building" },
    { value: "10+", label: "Projects shipped" },
    { value: "4", label: "Roles & internships" },
  ],
  highlights: [
    { title: "Full Stack Development", description: "End-to-end web apps with React, Node.js, Supabase and Firebase." },
    { title: "Mobile App Development", description: "Cross-platform mobile apps with Flutter and Firebase-backed workflows." },
    { title: "UI/UX Design", description: "Clean, accessible interfaces shaped in Figma and refined in code." },
    { title: "Problem Solving", description: "Algorithms and engineering fundamentals in C, C++ and Python." },
  ],
  skills: [
    { group: "Frontend", items: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Tailwind CSS"] },
    { group: "Mobile", items: ["Flutter", "Firebase"] },
    { group: "Backend", items: ["Node.js", "Supabase", "REST APIs"] },
    { group: "Programming", items: ["C", "C++", "Python", "JavaScript"] },
    { group: "Tools", items: ["Git", "Figma", "OpenCV", "Postman"] },
  ],
  experience: [
    {
      role: "Full Stack Developer",
      org: "ASLENIX",
      period: "2025 - Present",
      description: "Building scalable web applications, UI systems and modern digital solutions.",
    },
    {
      role: "UI/UX Designer",
      org: "Kitwosd",
      period: "2024",
      description: "Designed responsive UI flows in Figma and collaborated with developers on implementation.",
      supportUrl: "/docs/experience-letter-kitwosd.pdf",
      supportLabel: "Experience letter",
    },
    {
      role: "IT Officer",
      org: "Baljagriti School",
      period: "2023 - 2024",
      description: "Maintained school IT infrastructure and digital systems for staff and students.",
      supportUrl: "/docs/experience-letter-baljagriti.pdf",
      supportLabel: "Experience letter",
    },
    {
      role: "Frontend Intern",
      org: "Saiket Systems",
      period: "2024",
      description: "Built UI components and contributed to client-facing dashboards alongside the senior team.",
      supportImage: saiketOfferLetter,
      supportLabel: "Internship offer letter",
    },
    {
      role: "Freelance Developer",
      org: "Independent",
      period: "2022 - Present",
      description: "Delivered websites, landing pages and UI work for individual and small business clients.",
    },
  ],
  projects: [
    {
      id: "static-itinerary-voyager",
      title: "Itinerary Voyager",
      slug: "itinerary-voyager",
      description: "A travel planning app for building organized itineraries with destination details, schedules and a clear planning flow.",
      tech: ["React", "TypeScript", "Tailwind", "Supabase"],
      image_url: itineraryVoyagerImage,
      github_url: "https://github.com/suwam/itinerary-voyager",
      live_url: null,
      achievement: "Featured project",
      featured: true,
      source: "manual" as const,
    },
    {
      id: "static-maze-generator",
      title: "Maze Generator",
      slug: "maze-generator",
      description: "An interactive maze generation project that visualizes algorithmic thinking through a playful browser experience.",
      tech: ["JavaScript", "Algorithms", "Canvas", "CSS"],
      image_url: mazeGeneratorImage,
      github_url: "https://github.com/suwam/maze-generator",
      live_url: null,
      achievement: "Algorithms",
      featured: true,
      source: "manual" as const,
    },
    {
      id: "static-file-compressor",
      title: "File Compressor",
      slug: "file-compressor",
      description: "A utility project focused on compression concepts, file handling and practical data processing workflows.",
      tech: ["Python", "Compression", "Data Structures"],
      image_url: fileCompressionImage,
      github_url: "https://github.com/suwam/file-compressor",
      live_url: null,
      achievement: "Utility",
      featured: true,
      source: "manual" as const,
    },
  ],
  achievements: [
    {
      id: "static-product-builder",
      title: "Built and maintained a full portfolio CMS",
      description: "Created a personal portfolio with admin-managed projects, blog posts, analytics and contact submissions.",
      date_text: "2026",
    },
    {
      id: "static-internships",
      title: "Completed professional software and UI roles",
      description: "Worked across full-stack development, UI/UX design and IT support roles while continuing engineering studies.",
      date_text: "2023 - 2025",
    },
  ],
  certifications: [
    {
      id: "static-cv",
      title: "Computer Engineering Portfolio",
      issuer: "Suwam Subedi",
      date_text: "Updated 2026",
      credential_url: "/docs/suwam-subedi-cv.pdf",
    },
  ],
  posts: [
    {
      id: "static-building-portfolio",
      title: "How I Think About Building Portfolio Projects",
      slug: "building-portfolio-projects",
      excerpt: "A short note on choosing portfolio projects that show product thinking, fundamentals and polish.",
      category: "Personal Learnings",
      tags: ["portfolio", "projects", "learning"],
      cover_image: null,
      read_time_minutes: 3,
      published_at: "2026-04-24",
      content:
        "Good portfolio projects should prove more than syntax. I like projects that show a real user flow, a thoughtful interface, and one technical idea worth explaining.\n\nFor each project, I try to make the goal obvious, keep the interface clean, and document the tradeoffs. That makes the work easier to understand for recruiters, collaborators and future me.",
    },
  ],
};
