"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { scrollFadeIn, scrollStaggerReveal } from "@/src/lib/gsap/scroll";
import { 
  IoNewspaperOutline,
  IoMapOutline,
  IoPlayCircleOutline,
  IoCodeSlashOutline,
  IoArrowForwardOutline
} from "react-icons/io5";

const showcaseItems = [
  {
    category: "Blogs",
    icon: IoNewspaperOutline,
    description: "In-depth articles on web development",
    count: "24 posts",
    featured: {
      title: "Building Scalable Next.js Applications",
      excerpt: "Learn how to structure Next.js apps that can handle millions of users...",
      readTime: "8 min read",
      date: "Dec 15, 2024",
    },
    href: "/blog",
  },
  {
    category: "Guides",
    icon: IoMapOutline,
    description: "Step-by-step development tutorials",
    count: "18 guides",
    featured: {
      title: "Complete TypeScript Setup Guide",
      excerpt: "Everything you need to know about setting up TypeScript in your projects...",
      readTime: "12 min read",
      date: "Dec 10, 2024",
    },
    href: "/guides",
  },
  {
    category: "Tutorials",
    icon: IoPlayCircleOutline,
    description: "Video & interactive learning content",
    count: "32 tutorials",
    featured: {
      title: "GSAP Animations Masterclass",
      excerpt: "Master the art of web animations with GSAP ScrollTrigger and smooth scroll...",
      readTime: "45 min video",
      date: "Dec 8, 2024",
    },
    href: "/tutorials",
  },
  {
    category: "Code Snippets",
    icon: IoCodeSlashOutline,
    description: "Ready-to-use code examples",
    count: "156 snippets",
    featured: {
      title: "React Hooks Collection",
      excerpt: "Essential custom hooks for React applications that save development time...",
      readTime: "3 min read",
      date: "Dec 12, 2024",
    },
    href: "/snippets",
  },
];

export function ShowcaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    setTimeout(() => {
      // Animate section header
      scrollFadeIn(".showcase-header", {
        start: "top 85%",
        y: 60,
      });

      // Animate showcase cards with stagger
      scrollStaggerReveal(".showcase-card", {
        start: "top 80%",
        stagger: 0.15,
        y: 80,
      });
    }, 100);
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="showcase-header text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            What I Offer
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive resources to help you level up your development skills
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {showcaseItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.category}
                className="showcase-card group border-2 border-border rounded-sm bg-background overflow-hidden hover:border-primary/20 transition-all duration-300"
              >
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{item.category}</h3>
                      <p className="text-sm text-muted-foreground">{item.count}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>

                {/* Featured Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {item.featured.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {item.featured.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.featured.date}</span>
                      <span>·</span>
                      <span>{item.featured.readTime}</span>
                    </div>
                  </div>
                  
                  <Button asChild variant="outline" className="w-full rounded-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link href={item.href} className="flex items-center justify-center gap-2">
                      Browse All {item.category}
                      <IoArrowForwardOutline className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
