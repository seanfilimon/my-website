"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { IoArrowForwardOutline, IoTimeOutline } from "react-icons/io5";

// Type for article data passed from server
interface ArticleItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  readTime: string;
  publishedAt: Date | null;
  href: string;
}

interface ServicesSectionProps {
  articles: ArticleItem[];
}

/**
 * Format relative time for display
 */
function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "Recently";
  
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

export function ServicesSection({ articles }: ServicesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Header animation with blur
    gsap.fromTo(
      ".teach-header",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".teach-header",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      },
    );

    // Articles stagger animation with blur
    gsap.fromTo(
      ".article-card",
      { opacity: 0, filter: "blur(8px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".articles-grid",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-muted/5">
      <div className="max-w-7xl mx-auto">
        <div className="teach-header text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            How I Teach & Lead
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Sharing knowledge through practical articles and real-world
            experiences
          </p>
        </div>

        <div className="articles-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={article.href}
              className="article-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  fill
                  className="object-cover transition-all duration-300"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 backdrop-blur-sm">
                  <Button size="sm" className="rounded-lg font-bold">
                    <span>Read Article</span>
                    <IoArrowForwardOutline className="h-3.5 w-3.5 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex items-center gap-3 pb-1 pl-1">
                <div className="flex flex-1 flex-col gap-2">
                  {/* Title and Category */}
                  <div className="flex items-center gap-2">
                    <span className="line-clamp-1 font-medium leading-none transition-colors duration-300 select-none">
                      {article.title}
                    </span>

                    {/* Category Badge */}
                    <div className="px-2 py-0.5 rounded bg-accent flex items-center justify-center shrink-0 ml-auto select-none">
                      <span className="text-xs font-medium text-accent-foreground">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IoTimeOutline className="h-3 w-3" />
                      {article.readTime}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeTime(article.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" className="rounded-sm">
            <Link
              href="/portfolio?category=Articles"
              className="flex items-center gap-2"
            >
              View All Articles
              <IoArrowForwardOutline className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
