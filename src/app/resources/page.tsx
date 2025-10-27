"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { 
  IoArrowForwardOutline,
  IoTimeOutline,
  IoCodeSlashOutline,
  IoHomeOutline,
  IoChevronForwardOutline
} from "react-icons/io5";
import { useResources } from "./resources-context";

// Featured Technologies with categories
const featuredTopics = [
  {
    id: "nextjs",
    name: "Next.js",
    category: "Framework",
    logo: "▲",
    color: "#000000",
    description: "The React Framework for Production - Server rendering, static sites, and more",
    tutorials: 12,
    guides: 8,
    articles: 5,
    image: "/bg-pattern.png",
    href: "/resources/nextjs"
  },
  {
    id: "react",
    name: "React",
    category: "Framework",
    logo: "⚛",
    color: "#61DAFB",
    description: "A JavaScript library for building user interfaces with component-based architecture",
    tutorials: 18,
    guides: 12,
    articles: 10,
    image: "/bg-pattern.png",
    href: "/resources/react"
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Language",
    logo: "TS",
    color: "#3178C6",
    description: "JavaScript with syntax for types - Build scalable applications with confidence",
    tutorials: 15,
    guides: 10,
    articles: 8,
    image: "/bg-pattern.png",
    href: "/resources/typescript"
  },
  {
    id: "nuxtjs",
    name: "Nuxt.js",
    category: "Framework",
    logo: "N",
    color: "#00DC82",
    description: "The Intuitive Vue Framework - Create performant and SEO-friendly web applications",
    tutorials: 10,
    guides: 6,
    articles: 4,
    image: "/bg-pattern.png",
    href: "/resources/nuxtjs"
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "Framework",
    logo: "🎨",
    color: "#06B6D4",
    description: "A utility-first CSS framework for rapidly building custom user interfaces",
    tutorials: 14,
    guides: 8,
    articles: 5,
    image: "/bg-pattern.png",
    href: "/resources/tailwind"
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "Language",
    logo: "N",
    color: "#339933",
    description: "JavaScript runtime built on Chrome's V8 engine for building scalable network applications",
    tutorials: 16,
    guides: 11,
    articles: 9,
    image: "/bg-pattern.png",
    href: "/resources/nodejs"
  }
];

// Recent articles
const recentArticles = [
  {
    id: 1,
    title: "Getting Started with Next.js 16",
    category: "Framework",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "2 days ago",
    href: "/articles/nextjs-16-guide"
  },
  {
    id: 2,
    title: "TypeScript Advanced Patterns",
    category: "Language",
    image: "/bg-pattern.png",
    readTime: "12 min read",
    publishedAt: "5 days ago",
    href: "/articles/typescript-patterns"
  },
  {
    id: 3,
    title: "Building Scalable APIs",
    category: "Backend",
    image: "/bg-pattern.png",
    readTime: "15 min read",
    publishedAt: "1 week ago",
    href: "/articles/scalable-apis"
  },
  {
    id: 4,
    title: "Modern CSS Techniques",
    category: "Frontend",
    image: "/bg-pattern.png",
    readTime: "10 min read",
    publishedAt: "2 weeks ago",
    href: "/articles/modern-css"
  },
  {
    id: 5,
    title: "React Performance Tips",
    category: "Framework",
    image: "/bg-pattern.png",
    readTime: "9 min read",
    publishedAt: "2 weeks ago",
    href: "/articles/react-performance"
  },
  {
    id: 6,
    title: "Mastering Tailwind CSS",
    category: "Framework",
    image: "/bg-pattern.png",
    readTime: "11 min read",
    publishedAt: "3 weeks ago",
    href: "/articles/mastering-tailwind"
  }
];

export default function ResourcesPage() {
  const { toggleSidebar } = useResources();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll delegation - make the content area respond to wheel events anywhere on the page
  useEffect(() => {
    const content = sectionRef.current;
    if (!content) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if target is within a scrollable area
      const isOverSidebar = target.closest('.resources-sidebar-wrapper');
      const isOverContent = target.closest('.resources-content');
      
      // If not over any scrollable area, forward to content
      if (!isOverSidebar && !isOverContent) {
        // Don't prevent default - let browser handle it naturally
        // Just programmatically scroll the content as well
        content.scrollBy({
          top: e.deltaY,
          left: e.deltaX,
          behavior: 'auto'
        });
      }
    };

    // Use passive listener to not block scrolling performance
    document.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // GSAP Animations for content - NO sidebar animation
  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Enable smooth scrolling on the content area
    if (sectionRef.current) {
      sectionRef.current.style.scrollBehavior = 'smooth';
    }

    // Animate breadcrumb
    gsap.fromTo(
      ".breadcrumb-section",
      { opacity: 0, y: -15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
        delay: 0.2
      }
    );

    // Configure ScrollTrigger to use the content area as scroller
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });

    // Topics animation - using content scroller
    gsap.fromTo(
      ".topic-card",
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".topics-grid",
          start: "top 75%",
          toggleActions: "play none none none",
          scroller: ".resources-content"
        }
      }
    );

    // Articles animation - using content scroller
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
          toggleActions: "play none none none",
          scroller: ".resources-content"
        }
      }
    );

    const content = sectionRef.current;
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      // Reset scroll behavior on cleanup
      if (content) {
        content.style.scrollBehavior = 'auto';
      }
    };
  }, []);

  return (
    <main ref={sectionRef} className="resources-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
        {/* Breadcrumb Section */}
        <div className="breadcrumb-section border-b bg-muted/5">
          <div className="w-full px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Link 
                  href="/" 
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IoHomeOutline className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">Learning Resources</span>
              </div>
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-sm hover:bg-accent transition-colors"
              >
                <IoCodeSlashOutline className="h-4 w-4" />
                <span>Browse</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Comprehensive guides, tutorials, and articles for modern web development
            </p>
          </div>
        </div>

        {/* Featured Topics - styled like services section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/5">
          <div className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Featured Technologies
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Popular frameworks and languages to build modern applications
              </p>
            </div>

            <div className="topics-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {featuredTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={topic.href}
                  className="topic-card group relative flex flex-col items-center p-4 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer select-none"
                >
                  {/* Logo */}
                  <div
                    className="flex items-center justify-center h-14 w-14 rounded-lg text-2xl font-bold mb-3 transition-transform duration-200 group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${topic.color}20`,
                      color: topic.color
                    }}
                  >
                    {topic.logo}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-center mb-1 group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>

                  {/* Category Badge */}
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-accent text-accent-foreground">
                    {topic.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Articles - styled like services section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Latest Articles
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Fresh insights and tutorials from the development community
              </p>
            </div>

            <div className="articles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 z-20">
                      <span className="px-2 py-1 text-xs font-medium bg-background/90 backdrop-blur text-foreground border rounded-sm shadow">
                        {article.category}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium">Read Article</span>
                        <IoArrowForwardOutline className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-3 pb-1 pl-1">
                    <div className="flex flex-1 flex-col gap-2">
                      {/* Title */}
                      <div className="flex items-start gap-2">
                        <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">
                          {article.title}
                        </span>
                      </div>

                      {/* Meta Info */}
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

            {/* View All Button */}
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="sm" className="rounded-sm">
                <Link href="/articles" className="flex items-center gap-2">
                  View All Articles
                  <IoArrowForwardOutline className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
  );
}
