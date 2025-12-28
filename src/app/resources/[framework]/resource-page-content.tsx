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
  IoHomeOutline,
  IoChevronForwardOutline,
  IoNewspaperOutline,
  IoDocumentTextOutline,
  IoSchoolOutline,
  IoGridOutline,
  IoListOutline,
} from "react-icons/io5";

interface Resource {
  id: string;
  name: string;
  slug: string;
  icon: string;
  iconUrl?: string | null;
  color: string;
  description: string;
  officialUrl: string | null;
  docsUrl: string | null;
  type: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  ogBackgroundColor?: string | null;
  ogBorderColor?: string | null;
  ogTextPrimary?: string | null;
  ogTextSecondary?: string | null;
  ogAccentStart?: string | null;
  ogAccentEnd?: string | null;
  ogResourceBgColor?: string | null;
  ogFontWeight?: number | null;
  ogBorderWidth?: number | null;
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string | null;
    readTime: string;
    publishedAt: Date | null;
    difficulty: string;
  }>;
  blogs: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string | null;
    readTime: string;
    publishedAt: Date | null;
  }>;
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    duration: string;
    level: string;
    price: number;
    discountPrice: number | null;
  }>;
  videos: Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    duration: string;
  }>;
}

interface ResourcePageContentProps {
  resource: Resource;
}

export function ResourcePageContent({ resource }: ResourcePageContentProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [showResourceInfo, setShowResourceInfo] = useState(false);
  const [coursesView, setCoursesView] = useState<"grid" | "list">("grid");
  const [articlesView, setArticlesView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setShowResourceInfo(headerBottom < 0);
      }
    };

    const scrollContainer = sectionRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".hero-content",
      { opacity: 0, filter: "blur(10px)" },
      { opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out", delay: 0.2 }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatPrice = (price: number, discountPrice: number | null) => {
    if (price === 0) return "Free";
    if (discountPrice) return `$${discountPrice.toFixed(2)}`;
    return `$${price.toFixed(2)}`;
  };

  const buildOgUrl = (item: { title: string; excerpt?: string | null; readTime?: string; publishedAt?: Date | null }) => {
    const params = new URLSearchParams();
    params.set("title", item.title);
    if (item.excerpt) params.set("excerpt", item.excerpt);
    if (item.readTime) params.set("readTime", item.readTime);
    if (item.publishedAt) {
      params.set("date", new Date(item.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }));
    }
    // Include resource info - use iconUrl (image) if available, otherwise icon (emoji)
    if (resource.iconUrl) params.set("resourceIcon", resource.iconUrl);
    else if (resource.icon) params.set("resourceEmoji", resource.icon);
    if (resource.name) params.set("resourceName", resource.name);
    
    // Add resource OG styles if customized
    if (resource.ogBackgroundColor) params.set("ogBackgroundColor", resource.ogBackgroundColor);
    if (resource.ogBorderColor) params.set("ogBorderColor", resource.ogBorderColor);
    if (resource.ogTextPrimary) params.set("ogTextPrimary", resource.ogTextPrimary);
    if (resource.ogTextSecondary) params.set("ogTextSecondary", resource.ogTextSecondary);
    if (resource.ogAccentStart) params.set("ogAccentStart", resource.ogAccentStart);
    if (resource.ogAccentEnd) params.set("ogAccentEnd", resource.ogAccentEnd);
    if (resource.ogResourceBgColor) params.set("ogResourceBgColor", resource.ogResourceBgColor);
    if (resource.ogFontWeight) params.set("ogFontWeight", resource.ogFontWeight.toString());
    if (resource.ogBorderWidth) params.set("ogBorderWidth", resource.ogBorderWidth.toString());
    
    return `/api/og/blog?${params.toString()}`;
  };

  const latestContent = [
    ...resource.blogs.slice(0, 2).map((b) => ({ ...b, type: "Blog" as const })),
    ...resource.articles.slice(0, 2).map((a) => ({ ...a, type: "Article" as const })),
    ...resource.courses.slice(0, 2).map((c) => ({ ...c, type: "Course" as const })),
  ].slice(0, 6);

  return (
    <main ref={sectionRef} className="resources-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div ref={headerRef} className="relative border-b bg-gradient-to-br from-muted/50 via-background to-muted/30 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image src="/bg-pattern.png" alt="" fill className="object-cover" priority />
        </div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <IoHomeOutline className="h-4 w-4" /><span>Home</span>
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">{resource.name}</span>
          </div>

          <div className="flex items-start gap-4 hero-content">
            <div className="relative flex items-center justify-center h-14 w-14 rounded-xl bg-background border shadow-sm shrink-0 overflow-hidden" style={{ borderColor: resource.color }}>
              {resource.iconUrl ? (
                <Image src={resource.iconUrl} alt={resource.name} fill className="object-cover" sizes="56px" />
              ) : (
                <span className="text-2xl">{resource.icon}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{resource.name}</h1>
                {resource.type && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20">{resource.type.name}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3 max-w-3xl">{resource.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-xs"><IoBookOutline className="h-3.5 w-3.5 text-primary" /><span className="font-medium">{resource.courses.length} Courses</span></div>
                  <div className="flex items-center gap-1.5 text-xs"><IoCodeSlashOutline className="h-3.5 w-3.5 text-primary" /><span className="font-medium">{resource.articles.length} Articles</span></div>
                  <div className="flex items-center gap-1.5 text-xs"><IoRocketOutline className="h-3.5 w-3.5 text-primary" /><span className="font-medium">{resource.blogs.length} Blogs</span></div>
                </div>
                {resource.docsUrl && (
                  <div className="flex flex-wrap gap-2 ml-auto">
                    <Button asChild size="sm" className="rounded-sm h-7 text-xs">
                      <Link href={resource.docsUrl} target="_blank" className="flex items-center gap-1.5">Official Docs<IoArrowForwardOutline className="h-3 w-3" /></Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {showResourceInfo && (
              <div className="flex items-center gap-2 pr-4 border-r mr-2 animate-in fade-in slide-in-from-left-3 duration-200">
                <div className="relative flex items-center justify-center h-7 w-7 rounded bg-background border overflow-hidden">
                  {resource.iconUrl ? (
                    <Image src={resource.iconUrl} alt={resource.name} fill className="object-cover" sizes="28px" />
                  ) : (
                    <span className="text-sm">{resource.icon}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-none">{resource.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{resource.type?.name}</span>
                </div>
              </div>
            )}
            <a href="#overview" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap"><IoRocketOutline className="h-4 w-4" />Overview</a>
            {resource.courses.length > 0 && <a href="#courses" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap"><IoPlayCircleOutline className="h-4 w-4" />Courses</a>}
            {resource.articles.length > 0 && <a href="#articles" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap"><IoCodeSlashOutline className="h-4 w-4" />Articles</a>}
            {resource.blogs.length > 0 && <a href="#blogs" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-accent transition-colors whitespace-nowrap"><IoBookOutline className="h-4 w-4" />Blogs</a>}
          </nav>
        </div>
      </div>

      {/* Overview */}
      <section id="overview" className="py-12 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="w-full">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Latest {resource.name} Content</h2>
            <p className="text-base text-muted-foreground">The most recent courses, articles, and blogs about {resource.name}</p>
          </div>
          {latestContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {latestContent.map((item) => (
                <Link key={`${item.type}-${item.id}`} href={item.type === "Blog" ? `/blogs/${item.slug}` : item.type === "Article" ? `/articles/${item.slug}` : `/courses/${item.slug}`} className="group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.thumbnail || buildOgUrl(item)} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                    />
                    <div className="absolute top-2 left-2 z-20">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium backdrop-blur border rounded-sm shadow ${item.type === "Blog" ? "bg-purple-500/90 text-white" : item.type === "Article" ? "bg-blue-500/90 text-white" : "bg-green-500/90 text-white"}`}>
                        {item.type === "Blog" ? <IoNewspaperOutline className="h-3 w-3" /> : item.type === "Article" ? <IoDocumentTextOutline className="h-3 w-3" /> : <IoSchoolOutline className="h-3 w-3" />}{item.type}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2"><span className="text-sm font-medium">View {item.type}</span><IoArrowForwardOutline className="h-4 w-4" /></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-1 pl-1">
                    <div className="flex flex-1 flex-col gap-2">
                      <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">{item.title}</span>
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><IoTimeOutline className="h-3 w-3" />{"readTime" in item ? item.readTime : "duration" in item ? item.duration : ""}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No content available yet for {resource.name}.</div>
          )}
        </div>
      </section>

      {/* Courses */}
      {resource.courses.length > 0 && (
        <section id="courses" className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/5 scroll-mt-16">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{resource.name} Courses</h2>
                <p className="text-base text-muted-foreground">Comprehensive video courses to master {resource.name}</p>
              </div>
              <div className="flex items-center gap-1 border rounded-sm p-1">
                <button onClick={() => setCoursesView("grid")} className={`p-2 rounded-sm transition-colors ${coursesView === "grid" ? "bg-accent" : "hover:bg-accent/50"}`}><IoGridOutline className="h-4 w-4" /></button>
                <button onClick={() => setCoursesView("list")} className={`p-2 rounded-sm transition-colors ${coursesView === "list" ? "bg-accent" : "hover:bg-accent/50"}`}><IoListOutline className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resource.courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    {course.thumbnail && <Image src={course.thumbnail} alt={course.title} fill className="object-cover transition-all duration-300" />}
                    <div className="absolute top-2 right-2 z-20">
                      <span className={`px-2 py-1 text-xs font-medium backdrop-blur border rounded-sm shadow ${course.level === "BEGINNER" ? "bg-green-500/90 text-white" : course.level === "INTERMEDIATE" ? "bg-blue-500/90 text-white" : "bg-purple-500/90 text-white"}`}>{course.level}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2"><IoPlayCircleOutline className="h-8 w-8" /><span className="text-sm font-medium">Watch Course</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-1 pl-1">
                    <div className="flex flex-1 flex-col gap-2">
                      <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">{course.title}</span>
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><IoTimeOutline className="h-3 w-3" />{course.duration}</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">{formatPrice(course.price, course.discountPrice)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      {resource.articles.length > 0 && (
        <section id="articles" className="py-12 px-4 sm:px-6 lg:px-8 scroll-mt-16">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{resource.name} Articles</h2>
                <p className="text-base text-muted-foreground">In-depth tutorials and guides for {resource.name}</p>
              </div>
              <div className="flex items-center gap-1 border rounded-sm p-1">
                <button onClick={() => setArticlesView("grid")} className={`p-2 rounded-sm transition-colors ${articlesView === "grid" ? "bg-accent" : "hover:bg-accent/50"}`}><IoGridOutline className="h-4 w-4" /></button>
                <button onClick={() => setArticlesView("list")} className={`p-2 rounded-sm transition-colors ${articlesView === "list" ? "bg-accent" : "hover:bg-accent/50"}`}><IoListOutline className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resource.articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={article.thumbnail || buildOgUrl(article)} 
                      alt={article.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                    />
                    <div className="absolute top-2 left-2 z-20">
                      <span className={`px-2 py-1 text-xs font-medium backdrop-blur border rounded-sm shadow ${article.difficulty === "BEGINNER" ? "bg-green-500/90 text-white" : article.difficulty === "INTERMEDIATE" ? "bg-blue-500/90 text-white" : "bg-purple-500/90 text-white"}`}>{article.difficulty}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2"><span className="text-sm font-medium">Read Article</span><IoArrowForwardOutline className="h-4 w-4" /></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-1 pl-1">
                    <div className="flex flex-1 flex-col gap-2">
                      <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">{article.title}</span>
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><IoTimeOutline className="h-3 w-3" />{article.readTime}</span>
                        <span className="truncate">{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blogs */}
      {resource.blogs.length > 0 && (
        <section id="blogs" className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/5 scroll-mt-16">
          <div className="w-full">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{resource.name} Blogs</h2>
              <p className="text-base text-muted-foreground">Personal insights and experiences with {resource.name}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resource.blogs.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={blog.thumbnail || buildOgUrl(blog)} 
                      alt={blog.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2"><span className="text-sm font-medium">Read Blog</span><IoArrowForwardOutline className="h-4 w-4" /></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-1 pl-1">
                    <div className="flex flex-1 flex-col gap-2">
                      <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">{blog.title}</span>
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><IoTimeOutline className="h-3 w-3" />{blog.readTime}</span>
                        <span className="truncate">{formatDate(blog.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
