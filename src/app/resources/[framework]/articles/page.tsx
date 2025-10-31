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
  IoSearchOutline,
  IoFilterOutline
} from "react-icons/io5";

const frameworkData: Record<string, any> = {
  nextjs: {
    name: "Next.js",
    slug: "nextjs",
    icon: "▲",
    color: "#000000",
    articles: [
      {
        id: 1,
        title: "Understanding Next.js App Router",
        excerpt: "Deep dive into the new App Router and how it changes the way we build Next.js applications",
        image: "/bg-pattern.png",
        readTime: "8 min read",
        publishedAt: "2 days ago",
        category: "Tutorial",
        href: "/articles/nextjs-app-router"
      },
      {
        id: 2,
        title: "Server Components vs Client Components",
        excerpt: "Learn when to use Server Components and when Client Components are necessary",
        image: "/bg-pattern.png",
        readTime: "10 min read",
        publishedAt: "5 days ago",
        category: "Guide",
        href: "/articles/server-vs-client-components"
      }
      // Add more articles...
    ]
  }
};

export default function FrameworkArticlesPage() {
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
      ".article-card",
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".articles-container",
          start: "top 75%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [view]);

  if (!data) {
    return <div className="p-8">Framework not found</div>;
  }

  const filteredArticles = data.articles.filter((article: any) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span className="text-foreground font-medium">Articles</span>
          </div>

          {/* Page Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-background border shadow-sm flex-shrink-0">
                <span className="text-2xl font-bold">{data.icon}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {data.name} Articles
                </h1>
                <p className="text-sm text-muted-foreground">
                  In-depth tutorials and guides for {data.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-sm p-1 bg-background">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-sm transition-colors ${view === 'grid' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                >
                  <IoGridOutline className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-sm transition-colors ${view === 'list' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                >
                  <IoListOutline className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="border-b bg-background px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="sm" className="rounded-sm gap-2">
            <IoFilterOutline className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Articles Grid/List */}
      <div className="articles-container py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredArticles.map((article: any) => (
                <Link
                  key={article.id}
                  href={article.href}
                  className="article-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    <Image src={article.image} alt={article.title} fill className="object-cover transition-all duration-300" />
                    <div className="absolute top-2 left-2 z-20">
                      <span className="px-2 py-1 text-xs font-medium bg-background/90 backdrop-blur text-foreground border rounded-sm shadow">
                        {article.category}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium">Read Article</span>
                        <IoArrowForwardOutline className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-1 pl-1">
                    <div className="flex flex-1 flex-col gap-2">
                      <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">
                        {article.title}
                      </span>
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IoTimeOutline className="h-3 w-3" />
                          {article.readTime}
                        </span>
                        <span className="truncate">{article.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium">Article</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Read Time</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredArticles.map((article: any) => (
                    <tr key={article.id} className="article-card group hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={article.href} className="flex items-center gap-3 group-hover:text-primary transition-colors">
                          <div className="relative w-16 h-10 flex-shrink-0 overflow-hidden rounded bg-muted/20">
                            <Image src={article.image} alt={article.title} fill className="object-cover" />
                          </div>
                          <span className="font-medium line-clamp-1">{article.title}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-sm bg-muted text-foreground">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IoTimeOutline className="h-3.5 w-3.5" />
                          {article.readTime}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{article.publishedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

