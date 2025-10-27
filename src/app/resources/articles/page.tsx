"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  IoArrowForwardOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoHomeOutline,
  IoChevronForwardOutline
} from "react-icons/io5";
import { useResources } from "../resources-context";

// Sample articles data
const articles = [
  {
    id: 1,
    title: "Getting Started with Next.js 16",
    excerpt: "A comprehensive guide to getting started with the latest version of Next.js, covering new features and best practices.",
    category: "Framework",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "2 days ago",
    tags: ["Next.js", "React", "Web Development"],
    href: "/articles/nextjs-16-guide"
  },
  {
    id: 2,
    title: "TypeScript Advanced Patterns",
    excerpt: "Deep dive into advanced TypeScript patterns including generics, conditional types, and mapped types.",
    category: "Language",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "12 min read",
    publishedAt: "5 days ago",
    tags: ["TypeScript", "JavaScript", "Programming"],
    href: "/articles/typescript-patterns"
  },
  {
    id: 3,
    title: "Building Scalable APIs",
    excerpt: "Learn how to design and build scalable REST and GraphQL APIs that can handle millions of requests.",
    category: "Backend",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "15 min read",
    publishedAt: "1 week ago",
    tags: ["API", "Backend", "Architecture"],
    href: "/articles/scalable-apis"
  },
  {
    id: 4,
    title: "Modern CSS Techniques",
    excerpt: "Explore modern CSS features like Grid, Flexbox, Custom Properties, and Container Queries.",
    category: "Frontend",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "10 min read",
    publishedAt: "2 weeks ago",
    tags: ["CSS", "Frontend", "Web Design"],
    href: "/articles/modern-css"
  },
  {
    id: 5,
    title: "React Performance Tips",
    excerpt: "Optimize your React applications with these performance tips and best practices.",
    category: "Framework",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "9 min read",
    publishedAt: "2 weeks ago",
    tags: ["React", "Performance", "Optimization"],
    href: "/articles/react-performance"
  },
  {
    id: 6,
    title: "Mastering Tailwind CSS",
    excerpt: "Complete guide to mastering Tailwind CSS for rapid UI development.",
    category: "Framework",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "11 min read",
    publishedAt: "3 weeks ago",
    tags: ["Tailwind", "CSS", "UI"],
    href: "/articles/mastering-tailwind"
  },
  {
    id: 7,
    title: "Database Design Principles",
    excerpt: "Essential principles for designing efficient and scalable database schemas.",
    category: "Database",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "13 min read",
    publishedAt: "3 weeks ago",
    tags: ["Database", "SQL", "Architecture"],
    href: "/articles/database-design"
  },
  {
    id: 8,
    title: "Authentication Best Practices",
    excerpt: "Implement secure authentication in your applications following industry best practices.",
    category: "Security",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "14 min read",
    publishedAt: "1 month ago",
    tags: ["Security", "Auth", "Backend"],
    href: "/articles/auth-best-practices"
  },
];

const categories = ["All", "Framework", "Language", "Backend", "Frontend", "Database", "Security"];

export default function ArticlesPage() {
  const { toggleSidebar } = useResources();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Auto-scroll delegation
  useEffect(() => {
    const content = sectionRef.current;
    if (!content) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const isOverSidebar = target.closest('.resources-sidebar-wrapper');
      const isOverContent = target.closest('.resources-content');
      
      if (!isOverSidebar && !isOverContent) {
        content.scrollBy({
          top: e.deltaY,
          left: e.deltaX,
          behavior: 'auto'
        });
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // GSAP Animations - NO sidebar animation
  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    if (sectionRef.current) {
      sectionRef.current.style.scrollBehavior = 'smooth';
    }

    // Animate breadcrumb only
    gsap.fromTo(
      ".breadcrumb-section",
      { opacity: 0, y: -15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
        delay: 0.1
      }
    );

    // Animate article cards
    gsap.fromTo(
      ".article-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".articles-container",
          start: "top 75%",
          toggleActions: "play none none none",
          scroller: ".resources-content"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (sectionRef.current) {
        sectionRef.current.style.scrollBehavior = 'auto';
      }
    };
  }, [selectedCategory, searchTerm]);

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
                <Link 
                  href="/resources" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resources
                </Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">Articles</span>
              </div>
              
              <button
                onClick={toggleSidebar}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-sm hover:bg-accent transition-colors"
              >
                <IoFilterOutline className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              In-depth articles covering web development, programming, and software engineering
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="w-full px-4 py-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="articles-container py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "All" ? "All Articles" : `${selectedCategory} Articles`}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredArticles.map((article) => (
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

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded bg-accent text-accent-foreground"
                          >
                            {tag}
                          </span>
                        ))}
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
          )}
        </div>
    </main>
  );
}

