"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { 
  IoArrowForwardOutline,
  IoTimeOutline
} from "react-icons/io5";

// Recent articles with most recent first
const recentArticles = [
  {
    id: 1,
    title: "Building LegionEdge: Series A Journey",
    category: "Entrepreneurship",
    image: "/bg-pattern.png",
    readTime: "12 min read",
    publishedAt: "2 days ago",
    href: "/article/building-legionedge-series-a"
  },
  {
    id: 2,
    title: "Next.js Performance Optimization Guide",
    category: "Development",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "1 week ago",
    href: "/article/nextjs-performance"
  },
  {
    id: 3,
    title: "Scaling to 100K Users: TechFlow Story",
    category: "Case Study",
    image: "/bg-pattern.png",
    readTime: "15 min read",
    publishedAt: "2 weeks ago",
    href: "/article/scaling-techflow"
  },
  {
    id: 4,
    title: "AI-Powered Code Reviews at Scale",
    category: "AI & Dev",
    image: "/bg-pattern.png",
    readTime: "10 min read",
    publishedAt: "3 weeks ago",
    href: "/article/ai-code-reviews"
  },
  {
    id: 5,
    title: "From 0 to $2M ARR in 18 Months",
    category: "Growth",
    image: "/bg-pattern.png",
    readTime: "14 min read",
    publishedAt: "1 month ago",
    href: "/article/zero-to-2m-arr"
  },
  {
    id: 6,
    title: "Building Open Source Developer Tools",
    category: "Open Source",
    image: "/bg-pattern.png",
    readTime: "9 min read",
    publishedAt: "1 month ago",
    href: "/article/open-source-tools"
  }
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Header animation
    gsap.fromTo(
      ".teach-header",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".teach-header",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    // Articles stagger animation
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
          trigger: ".articles-grid",
          start: "top 75%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
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
            Sharing knowledge through practical articles and real-world experiences
          </p>
        </div>

        <div className="articles-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recentArticles.map((article) => (
            <Link
              key={article.id}
              href={article.href}
              className="article-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-all duration-300"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
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
                    <span>{article.publishedAt}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" className="rounded-sm">
            <Link href="/portfolio?category=Articles" className="flex items-center gap-2">
              View All Articles
              <IoArrowForwardOutline className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
