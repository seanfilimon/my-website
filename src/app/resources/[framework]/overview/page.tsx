"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoArrowForwardOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoBookOutline,
  IoCodeSlashOutline,
  IoRocketOutline
} from "react-icons/io5";

const frameworkData: Record<string, any> = {
  nextjs: {
    name: "Next.js",
    description: "The React Framework for Production",
    stats: { courses: 18, articles: 45, blogs: 28 }
  }
};

export default function FrameworkOverviewPage() {
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
          <span className="text-foreground font-medium">Overview</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">{data.name} Overview</h1>
        <p className="text-muted-foreground mb-6">{data.description}</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><IoBookOutline className="h-4 w-4" /><span>{data.stats.courses} Courses</span></div>
          <div className="flex items-center gap-2"><IoCodeSlashOutline className="h-4 w-4" /><span>{data.stats.articles} Articles</span></div>
          <div className="flex items-center gap-2"><IoRocketOutline className="h-4 w-4" /><span>{data.stats.blogs} Blogs</span></div>
        </div>
      </div>
    </main>
  );
}

