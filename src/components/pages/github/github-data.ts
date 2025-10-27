import { TechCategory } from "./github-sidebar";
import { CompactRepository } from "./compact-repo-card";

// Language colors from GitHub
const languageColors: Record<string, string> = {
  "TypeScript": "#3178c6",
  "JavaScript": "#f1e05a",
  "Python": "#3572A5",
  "React": "#61dafb",
  "Vue": "#42b883",
  "CSS": "#563d7c",
  "HTML": "#e34c26",
  "Go": "#00ADD8",
  "Rust": "#dea584",
  "Java": "#b07219",
};

// Repositories organized by technology
export const repositories: CompactRepository[] = [
  // Next.js Projects
  {
    id: "1",
    name: "nextjs-saas-starter",
    description: "Complete SaaS starter template with authentication, payments, and more",
    language: "TypeScript",
    languageColor: languageColors.TypeScript,
    stars: 1234,
    forks: 234,
    updatedAt: "2 days ago",
    url: "https://github.com/seanfilimon/nextjs-saas-starter",
    category: "Next.js"
  },
  {
    id: "2",
    name: "nextjs-blog-template",
    description: "Modern blog template with MDX support and CMS integration",
    language: "TypeScript",
    languageColor: languageColors.TypeScript,
    stars: 567,
    forks: 89,
    updatedAt: "1 week ago",
    url: "https://github.com/seanfilimon/nextjs-blog-template",
    category: "Next.js"
  },
  
  // React Projects
  {
    id: "3",
    name: "react-dashboard-template",
    description: "Modern admin dashboard with charts and data visualization",
    language: "TypeScript",
    languageColor: languageColors.TypeScript,
    stars: 890,
    forks: 156,
    updatedAt: "5 days ago",
    url: "https://github.com/seanfilimon/react-dashboard-template",
    category: "React"
  },
  {
    id: "4",
    name: "react-component-library",
    description: "Reusable React components with TypeScript and Storybook",
    language: "TypeScript",
    languageColor: languageColors.TypeScript,
    stars: 678,
    forks: 123,
    updatedAt: "2 weeks ago",
    url: "https://github.com/seanfilimon/react-component-library",
    category: "React"
  },

  // Nuxt.js Projects
  {
    id: "5",
    name: "nuxtjs-portfolio-template",
    description: "Beautiful portfolio template built with Nuxt.js and Tailwind",
    language: "Vue",
    languageColor: languageColors.Vue,
    stars: 456,
    forks: 78,
    updatedAt: "3 weeks ago",
    url: "https://github.com/seanfilimon/nuxtjs-portfolio-template",
    category: "Nuxt.js"
  },
  {
    id: "6",
    name: "nuxt-ecommerce-starter",
    description: "E-commerce starter with Nuxt 3 and payment integration",
    language: "Vue",
    languageColor: languageColors.Vue,
    stars: 345,
    forks: 67,
    updatedAt: "1 month ago",
    url: "https://github.com/seanfilimon/nuxt-ecommerce-starter",
    category: "Nuxt.js"
  },

  // Tools & Libraries
  {
    id: "7",
    name: "gsap-animations-library",
    description: "Reusable GSAP animation components and utilities",
    language: "JavaScript",
    languageColor: languageColors.JavaScript,
    stars: 789,
    forks: 134,
    updatedAt: "2 weeks ago",
    url: "https://github.com/seanfilimon/gsap-animations-library",
    category: "Tools"
  },
  {
    id: "8",
    name: "better-auth-examples",
    description: "Authentication examples with Better Auth",
    language: "TypeScript",
    languageColor: languageColors.TypeScript,
    stars: 432,
    forks: 89,
    updatedAt: "3 weeks ago",
    url: "https://github.com/seanfilimon/better-auth-examples",
    category: "Tools"
  },

  // AI/Python Projects
  {
    id: "9",
    name: "ai-code-reviewer",
    description: "AI-powered code review tool using OpenAI",
    language: "Python",
    languageColor: languageColors.Python,
    stars: 567,
    forks: 92,
    updatedAt: "1 week ago",
    url: "https://github.com/seanfilimon/ai-code-reviewer",
    category: "AI/ML"
  },
];

// Generate categories from repositories
export const techCategories: TechCategory[] = [
  {
    category: "Next.js",
    icon: "▲",
    color: "#000000",
    repos: repositories.filter(r => r.category === "Next.js").map(r => r.name)
  },
  {
    category: "React",
    icon: "⚛",
    color: "#61DAFB",
    repos: repositories.filter(r => r.category === "React").map(r => r.name)
  },
  {
    category: "Nuxt.js",
    icon: "N",
    color: "#00DC82",
    repos: repositories.filter(r => r.category === "Nuxt.js").map(r => r.name)
  },
  {
    category: "Tools",
    icon: "🔧",
    color: "#8B5CF6",
    repos: repositories.filter(r => r.category === "Tools").map(r => r.name)
  },
  {
    category: "AI/ML",
    icon: "🤖",
    color: "#F59E0B",
    repos: repositories.filter(r => r.category === "AI/ML").map(r => r.name)
  },
].filter(cat => cat.repos.length > 0);
