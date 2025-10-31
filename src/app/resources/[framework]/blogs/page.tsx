"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoGridOutline,
  IoListOutline,
  IoSearchOutline
} from "react-icons/io5";

const frameworkData: Record<string, any> = {
  nextjs: {
    name: "Next.js",
    slug: "nextjs",
    icon: "▲",
    color: "#000000",
    blogs: [
      {
        id: 1,
        title: "Why I Migrated to Next.js 16",
        excerpt: "My experience migrating a large production app to the latest Next.js",
        image: "/bg-pattern.png",
        readTime: "6 min read",
        publishedAt: "1 day ago",
        author: "Sean Filimon",
        href: "/blogs/migrated-to-nextjs-16"
      }
      // More blogs...
    ]
  }
};

export default function FrameworkBlogsPage() {
  const params = useParams();
  const framework = params.framework as string;
  const data = frameworkData[framework];
  const sectionRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".blog-card",
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out"
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [view]);

  if (!data) {
    return <div className="p-8">Framework not found</div>;
  }

  return (
    <main ref={sectionRef} className="resources-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
      {/* Header with Background */}
      <div className="relative border-b bg-gradient-to-br from-muted/50 via-background to-muted/30 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/bg-pattern.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <IoHomeOutline className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <Link href={`/resources/${framework}`} className="text-muted-foreground hover:text-foreground transition-colors">
              {data.name}
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Blogs</span>
          </div>

          {/* Page Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-background border shadow-sm flex-shrink-0">
                <span className="text-2xl font-bold">{data.icon}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {data.name} Blogs
                </h1>
                <p className="text-sm text-muted-foreground">
                  Personal insights and experiences with {data.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-sm p-1 bg-background">
                <button onClick={() => setView('grid')} className={`p-2 rounded-sm transition-colors ${view === 'grid' ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                  <IoGridOutline className="h-4 w-4" />
                </button>
                <button onClick={() => setView('list')} className={`p-2 rounded-sm transition-colors ${view === 'list' ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                  <IoListOutline className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b bg-background px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative max-w-md">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.blogs.map((blog: any) => (
                <Link key={blog.id} href={blog.href} className="blog-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 pb-1 pl-1">
                    <span className="line-clamp-2 font-medium leading-tight">{blog.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IoTimeOutline className="h-3 w-3" />
                        {blog.readTime}
                      </span>
                      <span>{blog.publishedAt}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

