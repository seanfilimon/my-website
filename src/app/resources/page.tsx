"use client";

import { useEffect, useRef, useState } from "react";
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
  IoMenuOutline,
  IoCloseOutline
} from "react-icons/io5";
import { ResourcesMobileMenu } from "@/src/components/pages/resources/resources-mobile-menu";

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
    id: "vue",
    name: "Vue",
    category: "Framework",
    logo: "V",
    color: "#4FC08D",
    description: "The Progressive JavaScript Framework for building modern web interfaces",
    tutorials: 14,
    guides: 9,
    articles: 7,
    image: "/bg-pattern.png",
    href: "/resources/vue"
  },
  {
    id: "trpc",
    name: "tRPC",
    category: "API",
    logo: "T",
    color: "#398CCB",
    description: "End-to-end typesafe APIs made easy",
    tutorials: 8,
    guides: 5,
    articles: 4,
    image: "/bg-pattern.png",
    href: "/resources/trpc"
  },
  {
    id: "inngest",
    name: "Inngest",
    category: "Workflow",
    logo: "I",
    color: "#6366F1",
    description: "Durable workflow engine for TypeScript",
    tutorials: 6,
    guides: 4,
    articles: 3,
    image: "/bg-pattern.png",
    href: "/resources/inngest"
  },
  {
    id: "codesandbox",
    name: "CodeSandbox SDK",
    category: "SDK",
    logo: "CS",
    color: "#151515",
    description: "Browser-based development environment SDK",
    tutorials: 5,
    guides: 3,
    articles: 2,
    image: "/bg-pattern.png",
    href: "/resources/codesandbox"
  },
  {
    id: "daytona",
    name: "Daytona SDK",
    category: "SDK",
    logo: "D",
    color: "#FF6B35",
    description: "Development environment automation SDK",
    tutorials: 4,
    guides: 3,
    articles: 2,
    image: "/bg-pattern.png",
    href: "/resources/daytona"
  },
  {
    id: "prisma",
    name: "Prisma",
    category: "ORM",
    logo: "P",
    color: "#2D3748",
    description: "Next-generation Node.js and TypeScript ORM",
    tutorials: 12,
    guides: 8,
    articles: 6,
    image: "/bg-pattern.png",
    href: "/resources/prisma"
  },
  {
    id: "typeorm",
    name: "TypeORM",
    category: "ORM",
    logo: "TO",
    color: "#E83524",
    description: "ORM for TypeScript and JavaScript",
    tutorials: 10,
    guides: 6,
    articles: 5,
    image: "/bg-pattern.png",
    href: "/resources/typeorm"
  },
  {
    id: "nestjs",
    name: "NestJS",
    category: "Framework",
    logo: "N",
    color: "#E0234E",
    description: "Progressive Node.js framework for building efficient server-side applications",
    tutorials: 11,
    guides: 7,
    articles: 5,
    image: "/bg-pattern.png",
    href: "/resources/nestjs"
  },
  {
    id: "express",
    name: "Express",
    category: "Framework",
    logo: "E",
    color: "#000000",
    description: "Fast, unopinionated, minimalist web framework for Node.js",
    tutorials: 15,
    guides: 9,
    articles: 7,
    image: "/bg-pattern.png",
    href: "/resources/express"
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

// Featured Blogs
const featuredBlogs = [
  {
    id: 1,
    title: "My Journey Building a $2M SaaS",
    category: "Startup",
    image: "/bg-pattern.png",
    readTime: "6 min read",
    publishedAt: "1 day ago",
    href: "/blogs/journey-building-2m-saas"
  },
  {
    id: 2,
    title: "Why I Chose Next.js Over Everything Else",
    category: "Tech Stack",
    image: "/bg-pattern.png",
    readTime: "5 min read",
    publishedAt: "3 days ago",
    href: "/blogs/why-nextjs"
  },
  {
    id: 3,
    title: "Lessons from 100+ Client Projects",
    category: "Business",
    image: "/bg-pattern.png",
    readTime: "7 min read",
    publishedAt: "1 week ago",
    href: "/blogs/lessons-from-clients"
  },
  {
    id: 4,
    title: "The Tech Behind LegionEdge",
    category: "Case Study",
    image: "/bg-pattern.png",
    readTime: "9 min read",
    publishedAt: "2 weeks ago",
    href: "/blogs/tech-behind-legionedge"
  }
];

// Popular Tutorials
const popularTutorials = [
  {
    id: 1,
    title: "Building a Full-Stack SaaS with Next.js 16",
    category: "Full Stack",
    image: "/bg-pattern.png",
    duration: "45 min",
    level: "Intermediate",
    href: "/tutorials/fullstack-saas-nextjs"
  },
  {
    id: 2,
    title: "Stripe Payments Integration Guide",
    category: "Backend",
    image: "/bg-pattern.png",
    duration: "30 min",
    level: "Beginner",
    href: "/tutorials/stripe-integration"
  },
  {
    id: 3,
    title: "Advanced tRPC Patterns & Best Practices",
    category: "API",
    image: "/bg-pattern.png",
    duration: "40 min",
    level: "Advanced",
    href: "/tutorials/advanced-trpc"
  },
  {
    id: 4,
    title: "Authentication with Prisma & NextAuth",
    category: "Auth",
    image: "/bg-pattern.png",
    duration: "35 min",
    level: "Intermediate",
    href: "/tutorials/prisma-nextauth"
  }
];

export default function ResourcesPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        delay: 0,
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
        delay: 0,
        scrollTrigger: {
          trigger: ".articles-grid",
          start: "top 75%",
          toggleActions: "play none none none",
          scroller: ".resources-content"
        }
      }
    );

    // Blogs animation - using content scroller
    gsap.fromTo(
      ".blog-card",
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0,
        scrollTrigger: {
          trigger: ".blogs-grid",
          start: "top 75%",
          toggleActions: "play none none none",
          scroller: ".resources-content"
        }
      }
    );

    // Tutorials animation - using content scroller
    gsap.fromTo(
      ".tutorial-card",
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0,
        scrollTrigger: {
          trigger: ".tutorials-grid",
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
    <>
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-sm hover:bg-accent transition-colors"
              >
                {mobileMenuOpen ? (
                  <>
                    <IoCloseOutline className="h-4 w-4" />
                    <span>Close</span>
                  </>
                ) : (
                  <>
                    <IoMenuOutline className="h-4 w-4" />
                    <span>Menu</span>
                  </>
                )}
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

            <div className="topics-grid grid grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={topic.href}
                  className="topic-card group relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer select-none"
                >
                  {/* Logo */}
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-lg text-xl font-bold flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${topic.color}20`,
                      color: topic.color
                    }}
                  >
                    {topic.logo}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors truncate">
                      {topic.name}
                    </h3>

                    {/* Category Badge */}
                    <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-accent text-accent-foreground">
                      {topic.category}
                    </span>
                  </div>
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

        {/* Featured Blogs Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/5">
          <div className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Featured Blogs
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Personal insights, stories, and lessons from my journey
              </p>
            </div>

            <div className="blogs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={blog.href}
                  className="blog-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover transition-all duration-300"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 z-20">
                      <span className="px-2 py-1 text-xs font-medium bg-background/90 backdrop-blur text-foreground border rounded-sm shadow">
                        {blog.category}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium">Read Blog</span>
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
                          {blog.title}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IoTimeOutline className="h-3 w-3" />
                          {blog.readTime}
                        </span>
                        <span className="truncate">{blog.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="sm" className="rounded-sm">
                <Link href="/blogs" className="flex items-center gap-2">
                  View All Blogs
                  <IoArrowForwardOutline className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Popular Tutorials Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Popular Tutorials
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Step-by-step guides to build real-world applications
              </p>
            </div>

            <div className="tutorials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popularTutorials.map((tutorial) => (
                <Link
                  key={tutorial.id}
                  href={tutorial.href}
                  className="tutorial-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    <Image
                      src={tutorial.image}
                      alt={tutorial.title}
                      fill
                      className="object-cover transition-all duration-300"
                    />

                    {/* Level Badge */}
                    <div className="absolute top-2 left-2 z-20">
                      <span className={`px-2 py-1 text-xs font-medium backdrop-blur border rounded-sm shadow ${
                        tutorial.level === 'Beginner' ? 'bg-green-500/90 text-white' :
                        tutorial.level === 'Intermediate' ? 'bg-blue-500/90 text-white' :
                        'bg-purple-500/90 text-white'
                      }`}>
                        {tutorial.level}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 right-2 z-20">
                      <span className="px-2 py-1 text-xs font-medium bg-background/90 backdrop-blur text-foreground border rounded-sm shadow">
                        {tutorial.category}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium">Start Tutorial</span>
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
                          {tutorial.title}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IoTimeOutline className="h-3 w-3" />
                          {tutorial.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="sm" className="rounded-sm">
                <Link href="/tutorials" className="flex items-center gap-2">
                  View All Tutorials
                  <IoArrowForwardOutline className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <ResourcesMobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
