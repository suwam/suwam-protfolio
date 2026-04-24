import saiketOfferLetter from "@/assets/saiket-offer-letter.png";

export const PORTFOLIO = {
  name: "Suwam Subedi",
  shortName: "Suwam",
  role: "Computer Engineering Student",
  intro:
    "I design and develop modern web and mobile applications with a strong focus on clean UI, scalability, and problem-solving.",
  about:
    "I'm a passionate Computer Engineering student fascinated by software development, UI/UX, full-stack engineering and the joy of solving real problems with code. I've shipped projects across mobile and web, contributed in internships, and continually push to learn the next thing.",
  email: "suwamsubedi30@gmail.com",
  phones: ["9865407952", "9709043147"],
  socials: {
    github: "https://github.com/suwam",
    linkedin: "https://www.linkedin.com/in/suwam-subedi-40024a358/",
    facebook: "https://www.facebook.com/suwam.subedi.2025",
    instagram: "https://www.instagram.com/suwam_subedi/?__pwa=1",
  },
  cvUrl: "/docs/suwam-subedi-cv.pdf",
  highlights: [
    { title: "Full Stack Development", description: "Building end-to-end web apps with React, Node.js and Firebase." },
    { title: "Mobile App Development", description: "Cross-platform apps with Flutter and Firebase." },
    { title: "UI/UX Design", description: "Crafting clean, accessible interfaces in Figma." },
    { title: "Problem Solving", description: "Algorithms in C, C++ and Python — competitive mindset." },
  ],
  skills: [
    { group: "Frontend", items: ["HTML", "CSS", "JavaScript", "React"] },
    { group: "Mobile", items: ["Flutter"] },
    { group: "Backend", items: ["Node.js", "Firebase"] },
    { group: "Programming", items: ["C", "C++", "Python"] },
    { group: "Tools", items: ["Git", "Figma", "OpenCV", "Postman"] },
  ],
  experience: [
    {
      role: "Full Stack Developer",
      org: "ASLENIX",
      period: "2025 — Present",
      description: "Building scalable web applications, UI systems, and modern digital solutions.",
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
      period: "2023 — 2024",
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
      period: "2022 — Present",
      description: "Delivered websites, landing pages and UI work for individual and small business clients.",
    },
  ],
};
