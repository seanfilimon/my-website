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
  IoPlayCircleOutline,
  IoBookOutline,
  IoCodeSlashOutline,
  IoRocketOutline,
  IoStarOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoNewspaperOutline,
  IoDocumentTextOutline,
  IoSchoolOutline,
  IoGridOutline,
  IoListOutline
} from "react-icons/io5";

// Next.js Courses
const nextjsCourses = [
  {
    id: 1,
    title: "Next.js 16 Complete Masterclass",
    description: "Learn Next.js from scratch and build production-ready applications",
    thumbnail: "/bg-pattern.png",
    duration: "12 hours",
    lessons: 85,
    level: "Beginner",
    students: "2,450",
    rating: 4.8,
    price: "$49.99",
    href: "/courses/nextjs-masterclass"
  },
  {
    id: 2,
    title: "Advanced Next.js Patterns",
    description: "Master advanced patterns and best practices for scalable applications",
    thumbnail: "/bg-pattern.png",
    duration: "8 hours",
    lessons: 45,
    level: "Advanced",
    students: "1,230",
    rating: 4.9,
    price: "$79.99",
    href: "/courses/advanced-nextjs"
  },
  {
    id: 3,
    title: "Next.js E-commerce Build",
    description: "Build a full-featured e-commerce platform with Next.js and Stripe",
    thumbnail: "/bg-pattern.png",
    duration: "15 hours",
    lessons: 120,
    level: "Intermediate",
    students: "3,890",
    rating: 4.7,
    price: "$59.99",
    href: "/courses/nextjs-ecommerce"
  },
  {
    id: 4,
    title: "Next.js API Development",
    description: "Build robust REST and GraphQL APIs with Next.js Route Handlers",
    thumbnail: "/bg-pattern.png",
    duration: "10 hours",
    lessons: 65,
    level: "Intermediate",
    students: "1,890",
    rating: 4.6,
    price: "$54.99",
    href: "/courses/nextjs-api-development"
  },
  {
    id: 5,
    title: "Server Components Deep Dive",
    description: "Master React Server Components and streaming in Next.js",
    thumbnail: "/bg-pattern.png",
    duration: "6 hours",
    lessons: 38,
    level: "Advanced",
    students: "980",
    rating: 4.9,
    price: "$69.99",
    href: "/courses/server-components"
  },
  {
    id: 6,
    title: "Next.js Authentication & Security",
    description: "Implement secure authentication with NextAuth, JWT, and OAuth",
    thumbnail: "/bg-pattern.png",
    duration: "9 hours",
    lessons: 52,
    level: "Intermediate",
    students: "2,100",
    rating: 4.8,
    price: "$59.99",
    href: "/courses/nextjs-auth"
  },
  {
    id: 7,
    title: "Full-Stack Next.js with Prisma",
    description: "Build complete applications with Next.js, Prisma, and PostgreSQL",
    thumbnail: "/bg-pattern.png",
    duration: "14 hours",
    lessons: 95,
    level: "Intermediate",
    students: "3,200",
    rating: 4.7,
    price: "$64.99",
    href: "/courses/fullstack-prisma"
  },
  {
    id: 8,
    title: "Next.js Performance Optimization",
    description: "Advanced techniques for building blazing-fast Next.js applications",
    thumbnail: "/bg-pattern.png",
    duration: "7 hours",
    lessons: 42,
    level: "Advanced",
    students: "1,450",
    rating: 4.9,
    price: "$74.99",
    href: "/courses/performance-optimization"
  }
];

// Next.js Articles
const nextjsArticles = [
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
  },
  {
    id: 3,
    title: "Optimizing Next.js Performance",
    excerpt: "Best practices for making your Next.js applications blazingly fast",
    image: "/bg-pattern.png",
    readTime: "12 min read",
    publishedAt: "1 week ago",
    category: "Performance",
    href: "/articles/nextjs-performance"
  },
  {
    id: 4,
    title: "Next.js Middleware Patterns",
    excerpt: "Advanced middleware patterns for authentication, redirects, and more",
    image: "/bg-pattern.png",
    readTime: "9 min read",
    publishedAt: "2 weeks ago",
    category: "Advanced",
    href: "/articles/nextjs-middleware"
  },
  {
    id: 5,
    title: "Building APIs with Route Handlers",
    excerpt: "Create robust API endpoints using Next.js Route Handlers",
    image: "/bg-pattern.png",
    readTime: "7 min read",
    publishedAt: "2 weeks ago",
    category: "API",
    href: "/articles/nextjs-route-handlers"
  },
  {
    id: 6,
    title: "Static vs Dynamic Rendering",
    excerpt: "Understanding when to use static generation vs dynamic rendering",
    image: "/bg-pattern.png",
    readTime: "11 min read",
    publishedAt: "3 weeks ago",
    category: "Fundamentals",
    href: "/articles/static-vs-dynamic"
  },
  {
    id: 7,
    title: "Data Fetching in Next.js 16",
    excerpt: "Master the latest data fetching patterns and best practices",
    image: "/bg-pattern.png",
    readTime: "15 min read",
    publishedAt: "3 weeks ago",
    category: "Tutorial",
    href: "/articles/data-fetching"
  },
  {
    id: 8,
    title: "SEO Best Practices for Next.js",
    excerpt: "Optimize your Next.js site for search engines and social media",
    image: "/bg-pattern.png",
    readTime: "10 min read",
    publishedAt: "4 weeks ago",
    category: "SEO",
    href: "/articles/seo-best-practices"
  },
  {
    id: 9,
    title: "Deploying Next.js to Production",
    excerpt: "Complete guide to deploying and optimizing Next.js apps",
    image: "/bg-pattern.png",
    readTime: "13 min read",
    publishedAt: "1 month ago",
    category: "Deployment",
    href: "/articles/deploying-production"
  },
  {
    id: 10,
    title: "Next.js Image Optimization",
    excerpt: "Leverage the Image component for perfect image performance",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "1 month ago",
    category: "Performance",
    href: "/articles/image-optimization"
  },
  {
    id: 11,
    title: "Error Handling in Next.js",
    excerpt: "Implement robust error boundaries and error handling strategies",
    image: "/bg-pattern.png",
    readTime: "9 min read",
    publishedAt: "1 month ago",
    category: "Guide",
    href: "/articles/error-handling"
  },
  {
    id: 12,
    title: "Testing Next.js Applications",
    excerpt: "Complete guide to unit, integration, and E2E testing",
    image: "/bg-pattern.png",
    readTime: "14 min read",
    publishedAt: "2 months ago",
    category: "Testing",
    href: "/articles/testing-nextjs"
  }
];

// Next.js Blogs
const nextjsBlogs = [
  {
    id: 1,
    title: "Why I Migrated to Next.js 16",
    excerpt: "My experience migrating a large production app to the latest Next.js",
    image: "/bg-pattern.png",
    readTime: "6 min read",
    publishedAt: "1 day ago",
    author: "Sean Filimon",
    href: "/blogs/migrated-to-nextjs-16"
  },
  {
    id: 2,
    title: "Next.js at Scale: Lessons Learned",
    excerpt: "What I learned building and scaling Next.js apps for 100K+ users",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "4 days ago",
    author: "Sean Filimon",
    href: "/blogs/nextjs-at-scale"
  },
  {
    id: 3,
    title: "My Next.js Starter Template",
    excerpt: "The boilerplate I use to start every new Next.js project",
    image: "/bg-pattern.png",
    readTime: "5 min read",
    publishedAt: "1 week ago",
    author: "Sean Filimon",
    href: "/blogs/nextjs-starter-template"
  },
  {
    id: 4,
    title: "Next.js vs Other Frameworks",
    excerpt: "An honest comparison based on real production experience",
    image: "/bg-pattern.png",
    readTime: "10 min read",
    publishedAt: "2 weeks ago",
    author: "Sean Filimon",
    href: "/blogs/nextjs-vs-others"
  },
  {
    id: 5,
    title: "Building My First SaaS with Next.js",
    excerpt: "Journey from idea to launch using Next.js as the foundation",
    image: "/bg-pattern.png",
    readTime: "7 min read",
    publishedAt: "3 weeks ago",
    author: "Sean Filimon",
    href: "/blogs/first-saas-nextjs"
  },
  {
    id: 6,
    title: "The Cost of Using Next.js",
    excerpt: "Real numbers and insights about hosting and infrastructure costs",
    image: "/bg-pattern.png",
    readTime: "6 min read",
    publishedAt: "3 weeks ago",
    author: "Sean Filimon",
    href: "/blogs/cost-of-nextjs"
  },
  {
    id: 7,
    title: "Why I Love Server Components",
    excerpt: "How React Server Components changed my development workflow",
    image: "/bg-pattern.png",
    readTime: "5 min read",
    publishedAt: "1 month ago",
    author: "Sean Filimon",
    href: "/blogs/love-server-components"
  },
  {
    id: 8,
    title: "My Next.js Development Setup",
    excerpt: "Tools, extensions, and configurations I use daily",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "1 month ago",
    author: "Sean Filimon",
    href: "/blogs/development-setup"
  }
];

// Combined latest content for Overview
const latestContent = [
  {
    id: "blog-1",
    type: "Blog",
    title: "Why I Migrated to Next.js 16",
    excerpt: "My experience migrating a large production app to the latest Next.js",
    image: "/bg-pattern.png",
    readTime: "6 min read",
    publishedAt: "1 day ago",
    author: "Sean Filimon",
    href: "/blogs/migrated-to-nextjs-16"
  },
  {
    id: "article-1",
    type: "Article",
    title: "Understanding Next.js App Router",
    excerpt: "Deep dive into the new App Router and how it changes the way we build Next.js applications",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "2 days ago",
    category: "Tutorial",
    href: "/articles/nextjs-app-router"
  },
  {
    id: "course-1",
    type: "Course",
    title: "Next.js 16 Complete Masterclass",
    excerpt: "Learn Next.js from scratch and build production-ready applications",
    image: "/bg-pattern.png",
    duration: "12 hours",
    level: "Beginner",
    publishedAt: "3 days ago",
    href: "/courses/nextjs-masterclass"
  },
  {
    id: "blog-2",
    type: "Blog",
    title: "Next.js at Scale: Lessons Learned",
    excerpt: "What I learned building and scaling Next.js apps for 100K+ users",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "4 days ago",
    author: "Sean Filimon",
    href: "/blogs/nextjs-at-scale"
  },
  {
    id: "article-2",
    type: "Article",
    title: "Server Components vs Client Components",
    excerpt: "Learn when to use Server Components and when Client Components are necessary",
    image: "/bg-pattern.png",
    readTime: "10 min read",
    publishedAt: "5 days ago",
    category: "Guide",
    href: "/articles/server-vs-client-components"
  },
  {
    id: "article-3",
    type: "Article",
    title: "Optimizing Next.js Performance",
    excerpt: "Best practices for making your Next.js applications blazingly fast",
    image: "/bg-pattern.png",
    readTime: "12 min read",
    publishedAt: "1 week ago",
    category: "Performance",
    href: "/articles/nextjs-performance"
  }
];

export default function NextJSResourcePage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [showResourceInfo, setShowResourceInfo] = useState(false);
  const [coursesView, setCoursesView] = useState<'grid' | 'list'>('grid');
  const [articlesView, setArticlesView] = useState<'grid' | 'list'>('grid');

  // Scroll detection for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setShowResourceInfo(headerBottom < 0);
      }
    };

    const scrollContainer = sectionRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero animation
    gsap.fromTo(
      ".hero-content",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      }
    );

    // Overview/Latest content animation
    gsap.fromTo(
      ".latest-card",
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
          trigger: ".latest-grid",
          start: "top 75%",
          toggleActions: "play none none none"
        }
      }
    );

    // Courses animation
    gsap.fromTo(
      ".course-card",
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0,
        scrollTrigger: {
          trigger: ".courses-grid",
          start: "top 75%",
          toggleActions: "play none none none"
        }
      }
    );

    // Articles animation
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
          toggleActions: "play none none none"
        }
      }
    );

    // Blogs animation
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
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <main ref={sectionRef} className="resources-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
      {/* Header Section with Background */}
      <div ref={headerRef} className="relative border-b bg-gradient-to-br from-muted/50 via-background to-muted/30 overflow-hidden">
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

        {/* Content */}
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link 
              href="/" 
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <IoHomeOutline className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <Link 
              href="/resources" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Resources
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Next.js</span>
          </div>
          
          {/* Resource Header */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-background border shadow-sm flex-shrink-0">
              <span className="text-2xl font-bold">▲</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Next.js
                </h1>
                <span className="px-2 py-0.5 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20">
                  Framework
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 max-w-3xl">
                The React Framework for Production - Build full-stack web applications with server-side rendering, 
                static generation, and more.
              </p>

              {/* Stats & Buttons Row */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-xs">
                    <IoBookOutline className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">18 Courses</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <IoCodeSlashOutline className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">45 Articles</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <IoRocketOutline className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">28 Blogs</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-2 ml-auto">
                  <Button asChild size="sm" className="rounded-sm h-7 text-xs">
                    <Link href="https://nextjs.org" target="_blank" className="flex items-center gap-1.5">
                      Official Docs
                      <IoArrowForwardOutline className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-sm h-7 text-xs">
                    <Link href="/resources/nextjs/all">
                      Browse All
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {/* Resource Info - Only visible when scrolled */}
            {showResourceInfo && (
              <div className="flex items-center gap-2 pr-4 border-r mr-2 animate-in fade-in slide-in-from-left-3 duration-200">
                <div className="flex items-center justify-center h-7 w-7 rounded bg-background border">
                  <span className="text-sm font-bold">▲</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-none">Next.js</span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Framework</span>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <a
              href="#overview"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap"
            >
              <IoRocketOutline className="h-4 w-4" />
              Overview
            </a>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap"
            >
              <IoPlayCircleOutline className="h-4 w-4" />
              Courses
            </a>
            <a
              href="#articles"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap"
            >
              <IoCodeSlashOutline className="h-4 w-4" />
              Articles
            </a>
            <a
              href="#blogs"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap"
            >
              <IoBookOutline className="h-4 w-4" />
              Blogs
            </a>
            <Link
              href="/resources/nextjs/all"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap ml-auto"
            >
              View All
              <IoArrowForwardOutline className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </div>

      {/* Overview Section - Latest Content */}
      <section id="overview" className="py-12 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Latest Next.js Content
            </h2>
            <p className="text-base text-muted-foreground">
              The most recent courses, articles, and blogs about Next.js
            </p>
          </div>

          <div className="latest-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {latestContent.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="latest-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-all duration-300"
                  />

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 z-20">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium backdrop-blur border rounded-sm shadow ${
                      item.type === 'Blog' ? 'bg-purple-500/90 text-white' :
                      item.type === 'Article' ? 'bg-blue-500/90 text-white' :
                      'bg-green-500/90 text-white'
                    }`}>
                      {item.type === 'Blog' ? <IoNewspaperOutline className="h-3 w-3" /> :
                       item.type === 'Article' ? <IoDocumentTextOutline className="h-3 w-3" /> :
                       <IoSchoolOutline className="h-3 w-3" />}
                      {item.type}
                    </span>
                  </div>

                  {/* Level Badge for Courses */}
                  {item.type === 'Course' && item.level && (
                    <div className="absolute top-2 right-2 z-20">
                      <span className={`px-2 py-1 text-xs font-medium backdrop-blur border rounded-sm shadow ${
                        item.level === 'Beginner' ? 'bg-green-500/90 text-white' :
                        item.level === 'Intermediate' ? 'bg-blue-500/90 text-white' :
                        'bg-purple-500/90 text-white'
                      }`}>
                        {item.level}
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-medium">View {item.type}</span>
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
                        {item.title}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IoTimeOutline className="h-3 w-3" />
                        {item.readTime || item.duration}
                      </span>
                      <span className="truncate">{item.publishedAt}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/5 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Next.js Courses
              </h2>
              <p className="text-base text-muted-foreground">
                Comprehensive video courses to master Next.js
              </p>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-sm p-1">
              <button
                onClick={() => setCoursesView('grid')}
                className={`p-2 rounded-sm transition-colors ${
                  coursesView === 'grid' ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                aria-label="Grid view"
              >
                <IoGridOutline className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCoursesView('list')}
                className={`p-2 rounded-sm transition-colors ${
                  coursesView === 'list' ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                aria-label="List view"
              >
                <IoListOutline className="h-4 w-4" />
              </button>
            </div>
          </div>

          {coursesView === 'grid' ? (
            <div className="courses-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {nextjsCourses.map((course) => (
                <Link
                  key={course.id}
                  href={course.href}
                  className="course-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover transition-all duration-300"
                    />
                    
                    {/* Level Badge */}
                    <div className="absolute top-2 right-2 z-20">
                      <span className={`px-2 py-1 text-xs font-medium backdrop-blur border rounded-sm shadow ${
                        course.level === 'Beginner' ? 'bg-green-500/90 text-white' :
                        course.level === 'Intermediate' ? 'bg-blue-500/90 text-white' :
                        'bg-purple-500/90 text-white'
                      }`}>
                        {course.level}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <IoPlayCircleOutline className="h-8 w-8" />
                        <span className="text-sm font-medium">Watch Course</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-3 pb-1 pl-1">
                    <div className="flex flex-1 flex-col gap-2">
                      <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">
                        {course.title}
                      </span>
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IoTimeOutline className="h-3 w-3" />
                          {course.duration}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">{course.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium">Course</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Level</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Duration</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Lessons</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Rating</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Students</th>
                      <th className="text-right px-4 py-3 text-sm font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {nextjsCourses.map((course) => (
                      <tr key={course.id} className="course-card group hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={course.href} className="flex items-center gap-3 group-hover:text-primary transition-colors">
                            <div className="relative w-16 h-10 flex-shrink-0 overflow-hidden rounded bg-muted/20">
                              <Image
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-medium line-clamp-1">{course.title}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-sm ${
                            course.level === 'Beginner' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                            course.level === 'Intermediate' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                            'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                          }`}>
                            {course.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{course.duration}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{course.lessons}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <IoStarOutline className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{course.students}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold">{course.price}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View All Courses */}
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="sm" className="rounded-sm">
              <Link href="/resources/nextjs/courses" className="flex items-center gap-2">
                View All Courses
                <IoArrowForwardOutline className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="py-12 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Next.js Articles
              </h2>
              <p className="text-base text-muted-foreground">
                In-depth tutorials and guides for Next.js
              </p>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-sm p-1">
              <button
                onClick={() => setArticlesView('grid')}
                className={`p-2 rounded-sm transition-colors ${
                  articlesView === 'grid' ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                aria-label="Grid view"
              >
                <IoGridOutline className="h-4 w-4" />
              </button>
              <button
                onClick={() => setArticlesView('list')}
                className={`p-2 rounded-sm transition-colors ${
                  articlesView === 'list' ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                aria-label="List view"
              >
                <IoListOutline className="h-4 w-4" />
              </button>
            </div>
          </div>

          {articlesView === 'grid' ? (
            <div className="articles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {nextjsArticles.map((article) => (
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
              <div className="overflow-x-auto">
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
                    {nextjsArticles.map((article) => (
                      <tr key={article.id} className="article-card group hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={article.href} className="flex items-center gap-3 group-hover:text-primary transition-colors">
                            <div className="relative w-16 h-10 flex-shrink-0 overflow-hidden rounded bg-muted/20">
                              <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                className="object-cover"
                              />
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
            </div>
          )}

          {/* View All Articles */}
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="sm" className="rounded-sm">
              <Link href="/resources/nextjs/articles" className="flex items-center gap-2">
                View All Articles
                <IoArrowForwardOutline className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/5 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Next.js Blogs
            </h2>
            <p className="text-base text-muted-foreground">
              Personal insights and experiences with Next.js
            </p>
          </div>

          <div className="blogs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {nextjsBlogs.map((blog) => (
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
                    <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">
                      {blog.title}
                    </span>
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

          {/* View All Blogs */}
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="sm" className="rounded-sm">
              <Link href="/resources/nextjs/blogs" className="flex items-center gap-2">
                View All Blogs
                <IoArrowForwardOutline className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

