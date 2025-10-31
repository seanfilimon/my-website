"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { IoHomeOutline, IoChevronForwardOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

const frameworkData: Record<string, any> = {
  nextjs: {
    name: "Next.js",
    roadmap: [
      { title: "Fundamentals", items: ["Setup & Installation", "Routing Basics", "Pages & Layouts"] },
      { title: "Intermediate", items: ["Server Components", "Data Fetching", "API Routes"] },
      { title: "Advanced", items: ["Performance Optimization", "Deployment", "Advanced Patterns"] }
    ]
  }
};

export default function FrameworkRoadmapPage() {
  const params = useParams();
  const framework = params.framework as string;
  const data = frameworkData[framework];

  if (!data) return <div>Framework not found</div>;

  return (
    <main className="resources-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
      <div className="p-8">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <IoHomeOutline className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
          <Link href="/resources" className="text-muted-foreground hover:text-foreground">Resources</Link>
          <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
          <Link href={`/resources/${framework}`} className="text-muted-foreground hover:text-foreground">{data.name}</Link>
          <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-foreground font-medium">Roadmap</span>
        </div>
        <h1 className="text-3xl font-bold mb-6">{data.name} Learning Roadmap</h1>
        <div className="space-y-6">
          {data.roadmap.map((section: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <IoCheckmarkCircleOutline className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

