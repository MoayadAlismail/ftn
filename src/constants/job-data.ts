// Shared constants for job/opportunity data
// Used in both employer job posting and talent preferences

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Marketing",
  "Design",
  "Consulting",
  "Education",
  "Non-profit",
  "Media",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Energy",
  "Transportation",
] as const;

export const SAUDI_CITIES = [
  "Riyadh",
  "Jeddah",
  "Mecca",
  "Medina",
  "Dammam",
  "Khobar",
  "Dhahran",
  "Tabuk",
  "Buraidah",
  "Khamis Mushait",
  "Al-Ahsa",
  "Hafar Al-Batin",
  "Jubail",
  "Yanbu",
  "Abha",
  "Najran",
  "Taif",
  "Arar",
  "Sakakah",
  "Jizan",
  "Remote",
  "Hybrid",
] as const;

export const COMMON_SKILLS = [
  // Programming Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",

  // Frontend
  "React",
  "Vue.js",
  "Angular",
  "Next.js",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "SASS",
  "Redux",

  // Backend
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  "ASP.NET",
  "Laravel",
  "Ruby on Rails",

  // Databases
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Oracle",
  "SQL Server",
  "Firebase",
  "Supabase",

  // Cloud & DevOps
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Jenkins",
  "GitHub Actions",
  "Terraform",

  // Mobile
  "React Native",
  "Flutter",
  "iOS Development",
  "Android Development",

  // Data & AI
  "Machine Learning",
  "Deep Learning",
  "Data Analysis",
  "Data Science",
  "TensorFlow",
  "PyTorch",
  "Power BI",
  "Tableau",

  // Design
  "Figma",
  "Adobe XD",
  "Sketch",
  "Photoshop",
  "Illustrator",
  "UI/UX Design",
  "Graphic Design",

  // Business & Soft Skills
  "Project Management",
  "Agile",
  "Scrum",
  "Communication",
  "Leadership",
  "Problem Solving",
  "Critical Thinking",
  "Team Collaboration",

  // Marketing & Sales
  "Digital Marketing",
  "SEO",
  "Content Marketing",
  "Social Media Marketing",
  "Google Analytics",
  "Sales",
  "CRM",

  // Other
  "Git",
  "REST API",
  "GraphQL",
  "Testing",
  "Documentation",
] as const;

export type Industry = typeof INDUSTRIES[number];
export type City = typeof SAUDI_CITIES[number];
export type Skill = typeof COMMON_SKILLS[number];
