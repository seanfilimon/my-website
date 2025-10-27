"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  IoHomeOutline, 
  IoChevronForwardOutline, 
  IoFilterOutline, 
  IoSearchOutline,
  IoArrowForwardOutline,
  IoTimeOutline,
  IoHeartOutline,
  IoChatbubbleOutline
} from "react-icons/io5";
import { useResources } from "../resources-context";

// Sample blog posts data
const blogs = [
  {
    id: 1,
    title: "My Journey Building a SaaS to $100K MRR",
    excerpt: "Lessons learned, mistakes made, and insights gained while building and scaling a successful SaaS business from scratch.",
    category: "Entrepreneurship",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "15 min read",
    publishedAt: "3 days ago",
    tags: ["SaaS", "Startup", "Revenue"],
    stats: {
      likes: 234,
      comments: 45
    },
    href: "/blog/saas-100k-mrr"
  },
  {
    id: 2,
    title: "Why I Switched from Vue to React",
    excerpt: "A developer's perspective on migrating a large codebase and the lessons learned along the way.",
    category: "Development",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "10 min read",
    publishedAt: "1 week ago",
    tags: ["React", "Vue", "Migration"],
    stats: {
      likes: 189,
      comments: 67
    },
    href: "/blog/vue-to-react"
  },
  {
    id: 3,
    title: "The Tech Stack Behind My Portfolio",
    excerpt: "A deep dive into the technologies, tools, and decisions that power this website.",
    category: "Development",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "8 min read",
    publishedAt: "2 weeks ago",
    tags: ["Next.js", "Tech Stack", "Design"],
    stats: {
      likes: 312,
      comments: 28
    },
    href: "/blog/portfolio-tech-stack"
  },
  {
    id: 4,
    title: "Lessons from My First Failed Startup",
    excerpt: "What went wrong, what I learned, and how failure shaped my approach to building products.",
    category: "Entrepreneurship",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "12 min read",
    publishedAt: "3 weeks ago",
    tags: ["Startup", "Failure", "Lessons"],
    stats: {
      likes: 456,
      comments: 92
    },
    href: "/blog/first-failed-startup"
  },
  {
    id: 5,
    title: "How I Stay Productive as a Solo Developer",
    excerpt: "My daily routines, tools, and mindset practices that keep me focused and shipping code.",
    category: "Productivity",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "7 min read",
    publishedAt: "1 month ago",
    tags: ["Productivity", "Solo Dev", "Workflow"],
    stats: {
      likes: 278,
      comments: 34
    },
    href: "/blog/solo-dev-productivity"
  },
  {
    id: 6,
    title: "Building in Public: Month 6 Update",
    excerpt: "Sharing metrics, challenges, wins, and what's coming next in my build in public journey.",
    category: "Updates",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "6 min read",
    publishedAt: "1 month ago",
    tags: ["Building in Public", "Updates", "Metrics"],
    stats: {
      likes: 198,
      comments: 41
    },
    href: "/blog/month-6-update"
  },
  {
    id: 7,
    title: "The Best VSCode Extensions for 2024",
    excerpt: "My curated list of essential VSCode extensions that boost productivity and make coding more enjoyable.",
    category: "Tools",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "9 min read",
    publishedAt: "2 months ago",
    tags: ["VSCode", "Tools", "Productivity"],
    stats: {
      likes: 523,
      comments: 78
    },
    href: "/blog/vscode-extensions-2024"
  },
  {
    id: 8,
    title: "Why I Write About Everything I Learn",
    excerpt: "The benefits of learning in public and how writing has accelerated my growth as a developer.",
    category: "Learning",
    author: "Sean Filimon",
    image: "/bg-pattern.png",
    readTime: "5 min read",
    publishedAt: "2 months ago",
    tags: ["Learning", "Writing", "Growth"],
    stats: {
      likes: 367,
      comments: 56
    },
    href: "/blog/learning-in-public"
  }
];

const categories = ["All", "Entrepreneurship", "Development", "Productivity", "Tools", "Updates", "Learning"];

export default function BlogsPage() {
  const { toggleSidebar } = useResources();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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

  // GSAP Animations
  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

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
        delay: 0.1
      }
    );

    // Animate blog cards
    gsap.fromTo(
      ".blog-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".blogs-container",
          start: "top 75%",
          toggleActions: "play none none none",
          scroller: ".resources-content"
        }
      }
    );

    const content = sectionRef.current;
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (content) {
        content.style.scrollBehavior = 'auto';
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
                <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <IoHomeOutline className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">Blogs</span>
              </div>
              <button onClick={toggleSidebar} className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-sm hover:bg-accent transition-colors">
                <IoFilterOutline className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Personal insights, opinions, and thoughts on web development</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="w-full px-4 py-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search blogs..."
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

        {/* Blogs Grid */}
        <div className="blogs-container py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "All" ? "All Blog Posts" : `${selectedCategory} Posts`}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBlogs.map((blog) => (
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
                        <span className="text-sm font-medium">Read Post</span>
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

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {blog.tags.slice(0, 3).map(tag => (
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
                          {blog.readTime}
                        </span>
                        <span className="truncate">{blog.publishedAt}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IoHeartOutline className="h-3 w-3" />
                          {blog.stats.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <IoChatbubbleOutline className="h-3 w-3" />
                          {blog.stats.comments}
                        </span>
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

