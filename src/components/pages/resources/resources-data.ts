import {
  IoRocketOutline,
  IoFlashOutline,
  IoServerOutline,
  IoConstructOutline,
  IoCloudOutline,
  IoBriefcaseOutline
} from "react-icons/io5";
import { ResourceCategory } from "./resources-sidebar";

export const resourcesTree: ResourceCategory[] = [
  {
    category: "Frameworks",
    icon: IoRocketOutline,
    expanded: true,
    items: [
      {
        id: "nextjs",
        name: "Next.js",
        logo: "▲",
        color: "#000000",
        tutorials: 12,
        guides: 8,
        articles: 5,
        href: "/resources/nextjs"
      },
      {
        id: "react",
        name: "React",
        logo: "⚛", 
        color: "#61DAFB",
        tutorials: 18,
        guides: 12,
        articles: 10,
        href: "/resources/react"
      },
      {
        id: "tailwind",
        name: "Tailwind CSS",
        logo: "🎨",
        color: "#06B6D4",
        tutorials: 14,
        guides: 8,
        articles: 5,
        href: "/resources/tailwind"
      },
      {
        id: "vue",
        name: "Vue.js",
        logo: "V",
        color: "#4FC08D",
        tutorials: 10,
        guides: 6,
        articles: 4,
        href: "/resources/vue"
      },
    ]
  },
  {
    category: "Languages",
    icon: IoFlashOutline,
    expanded: false,
    items: [
      {
        id: "typescript",
        name: "TypeScript",
        logo: "TS",
        color: "#3178C6",
        tutorials: 15,
        guides: 10,
        articles: 8,
        href: "/resources/typescript"
      },
      {
        id: "javascript",
        name: "JavaScript",
        logo: "JS",
        color: "#F7DF1E",
        tutorials: 20,
        guides: 14,
        articles: 12,
        href: "/resources/javascript"
      },
      {
        id: "python",
        name: "Python",
        logo: "🐍",
        color: "#3776AB",
        tutorials: 16,
        guides: 11,
        articles: 9,
        href: "/resources/python"
      },
    ]
  },
  {
    category: "Databases",
    icon: IoServerOutline,
    expanded: false,
    items: [
      {
        id: "postgres",
        name: "PostgreSQL",
        logo: "🐘",
        color: "#336791",
        tutorials: 8,
        guides: 6,
        articles: 4,
        href: "/resources/postgres"
      },
      {
        id: "mongodb",
        name: "MongoDB",
        logo: "M",
        color: "#47A248",
        tutorials: 10,
        guides: 7,
        articles: 5,
        href: "/resources/mongodb"
      },
      {
        id: "redis",
        name: "Redis",
        logo: "R",
        color: "#DC382D",
        tutorials: 6,
        guides: 4,
        articles: 3,
        href: "/resources/redis"
      },
    ]
  },
  {
    category: "Tools & Libraries",
    icon: IoConstructOutline,
    expanded: false,
    items: [
      {
        id: "prisma",
        name: "Prisma",
        logo: "P",
        color: "#2D3748",
        tutorials: 10,
        guides: 7,
        articles: 3,
        href: "/resources/prisma"
      },
      {
        id: "graphql",
        name: "GraphQL",
        logo: "◇",
        color: "#E10098",
        tutorials: 12,
        guides: 8,
        articles: 6,
        href: "/resources/graphql"
      },
      {
        id: "trpc",
        name: "tRPC",
        logo: "T",
        color: "#398CCB",
        tutorials: 8,
        guides: 5,
        articles: 4,
        href: "/resources/trpc"
      },
    ]
  },
  {
    category: "Cloud & DevOps",
    icon: IoCloudOutline,
    expanded: false,
    items: [
      {
        id: "docker",
        name: "Docker",
        logo: "🐳",
        color: "#2496ED",
        tutorials: 12,
        guides: 9,
        articles: 6,
        href: "/resources/docker"
      },
      {
        id: "aws",
        name: "AWS",
        logo: "☁",
        color: "#FF9900",
        tutorials: 14,
        guides: 10,
        articles: 8,
        href: "/resources/aws"
      },
      {
        id: "vercel",
        name: "Vercel",
        logo: "▲",
        color: "#000000",
        tutorials: 8,
        guides: 5,
        articles: 4,
        href: "/resources/vercel"
      },
    ]
  },
  {
    category: "Companies",
    icon: IoBriefcaseOutline,
    expanded: false,
    items: [
      {
        id: "legionedge",
        name: "LegionEdge",
        logo: "LE",
        color: "#6366F1",
        tutorials: 6,
        guides: 4,
        articles: 3,
        href: "/resources/legionedge"
      },
      {
        id: "cezium",
        name: "Cezium Software",
        logo: "CS",
        color: "#8B5CF6",
        tutorials: 5,
        guides: 3,
        articles: 2,
        href: "/resources/cezium"
      },
    ]
  }
];

