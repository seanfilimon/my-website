"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IoArrowForwardOutline,
  IoPlayCircleOutline,
  IoCodeSlashOutline,
  IoRocketOutline,
  IoTrendingUpOutline,
  IoSparklesOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoBookOutline,
  IoNewspaperOutline,
  IoPlayOutline,
  IoStarOutline,
  IoGitBranchOutline,
} from "react-icons/io5";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin);
}

// Type for hero data passed from server
interface HeroData {
  profile: {
    name: string | null;
    title: string | null;
    bio: string | null;
    image: string | null;
  } | null;
  stats: {
    projects: number;
    articles: number;
    students: number;
    githubStars: string;
  };
  latestBlog: any;
  featuredCourse: any;
  featuredProject: any;
  latestVideo: any;
}

interface HeroSlideshowProps {
  data: HeroData;
}

// Default values for when data is missing
const defaultProfile = {
  name: "Sean Filimon",
  title: "Full Stack Developer",
  bio: "Building robust applications with modern technologies.",
  image: "/me.jpg",
};

const defaultStats = {
  projects: 0,
  articles: 0,
  students: 0,
  githubStars: "0",
};

export default function HeroSlideshowWithData({ data }: HeroSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Build slides from data
  const buildSlides = () => {
    const slides = [];
    const profile = data.profile || defaultProfile;
    const stats = data.stats || defaultStats;

    // Intro slide
    slides.push({
      id: 1,
      type: "intro",
      layout: "split",
      title: profile.name || "Sean Filimon",
      subtitle: profile.title || "Full Stack Developer & Tech Educator",
      description: profile.bio || "Building the future of web development with Next.js, React, and modern technologies.",
      cta: "Explore My Work",
      ctaLink: "/portfolio",
      secondaryCta: "Watch Intro",
      gradient: "from-neutral-800 via-neutral-700 to-neutral-600",
      stats: [
        { label: "Projects", value: `${stats.projects}+` },
        { label: "Articles", value: `${stats.articles}+` },
        { label: "Students", value: `${stats.students}+` },
        { label: "GitHub Stars", value: stats.githubStars },
      ],
      image: profile.image,
    });

    // Latest blog slide
    if (data.latestBlog) {
      const blog = data.latestBlog;
      slides.push({
        id: 2,
        type: "blog",
        layout: "full",
        category: "Latest Blog",
        title: blog.title,
        subtitle: `${blog.resource?.name || "Blog"} • ${blog.readTime || "5 min read"}`,
        description: blog.excerpt,
        author: blog.author?.name || "Anonymous",
        date: new Date(blog.publishedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        gradient: "from-neutral-700 via-neutral-600 to-neutral-800",
        cta: "Read Article",
        ctaLink: `/blog/${blog.slug}`,
        tags: blog.tags?.map((t: any) => t.name) || [],
        views: blog.views,
        likes: blog.likes,
        image: blog.image,
      });
    }

    // Featured course slide
    if (data.featuredCourse) {
      const course = data.featuredCourse;
      slides.push({
        id: 3,
        type: "course",
        layout: "split",
        category: "Featured Course",
        title: course.title,
        subtitle: `Course • ${course.duration || "12 hours"} • ${course.level}`,
        description: course.description,
        students: course.enrollments?.length || 0,
        rating: 4.9, // You might want to calculate this from reviews
        gradient: "from-neutral-600 via-neutral-700 to-neutral-800",
        cta: "Start Learning",
        ctaLink: `/courses/${course.slug}`,
        modules: course.modules?.length || 0,
        price: course.price ? `$${course.price}` : "Free",
        image: course.image,
      });
    }

    // Featured project slide
    if (data.featuredProject) {
      const project = data.featuredProject;
      const githubMetric = project.metrics?.find(
        (m: any) => m.label === "GitHub Stars",
      );
      const forksMetric = project.metrics?.find(
        (m: any) => m.label === "Forks",
      );

      slides.push({
        id: 4,
        type: "project",
        layout: "split",
        category: "Featured Project",
        title: project.title,
        subtitle: project.subtitle || "Open Source Project",
        description: project.description,
        stars: githubMetric?.value || "0",
        forks: forksMetric?.value || "0",
        gradient: "from-neutral-800 via-neutral-600 to-neutral-700",
        cta: "View Project",
        ctaLink: project.projectUrl || project.githubUrl || "#",
        tech: project.technologies?.map((t: any) => t.name) || [],
        image: project.image,
      });
    }

    // Latest video slide
    if (data.latestVideo) {
      const video = data.latestVideo;
      slides.push({
        id: 5,
        type: "video",
        layout: "full",
        category: "Latest Video",
        title: video.title,
        subtitle: `Tutorial • ${video.duration}`,
        description: video.description,
        views: video.views,
        likes: video.likes,
        gradient: "from-neutral-700 via-neutral-800 to-neutral-600",
        cta: "Watch Now",
        ctaLink: `/videos/${video.slug}`,
        duration: video.duration,
        thumbnail: video.thumbnail,
        image: video.thumbnail,
      });
    }

    return slides;
  };

  const heroSlides = buildSlides();

  // Initialize GSAP animations
  useEffect(() => {
    if (!containerRef.current) return;

    // Create main timeline
    const tl = gsap.timeline({ paused: true });
    timelineRef.current = tl;

    // Initial animation with blur
    gsap.set(slideRefs.current, { opacity: 0, filter: "blur(10px)" });
    if (slideRefs.current[0]) {
      gsap.to(slideRefs.current[0], {
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power2.out",
      });
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && heroSlides.length > 1) {
      autoPlayRef.current = setInterval(() => {
        handleNextSlide();
      }, 6000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying, heroSlides.length]);

  const handleSlideChange = (newIndex: number) => {
    if (heroSlides.length === 0) return;

    const currentEl = slideRefs.current[currentSlide];
    const nextEl = slideRefs.current[newIndex];

    if (!currentEl || !nextEl) return;

    // Create transition timeline
    const tl = gsap.timeline();

    // Animate out current slide with blur
    tl.to(currentEl, {
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.5,
      ease: "power2.in",
    });

    // Animate in new slide with blur
    tl.to(
      nextEl,
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.3",
    );

    // Animate content elements with blur
    const contentElements = nextEl.querySelectorAll(".slide-content > *");
    tl.from(
      contentElements,
      {
        filter: "blur(8px)",
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.5",
    );

    setCurrentSlide(newIndex);
  };

  const handleNextSlide = () => {
    if (heroSlides.length === 0) return;
    const nextIndex = (currentSlide + 1) % heroSlides.length;
    handleSlideChange(nextIndex);
  };

  const handlePrevSlide = () => {
    if (heroSlides.length === 0) return;
    const prevIndex =
      currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    handleSlideChange(prevIndex);
  };

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case "intro":
        return (
          <div className="slide-content space-y-4">
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm border-border/50 text-muted-foreground"
            >
              <IoSparklesOutline className="mr-2 h-4 w-4" />
              Welcome to My Portfolio
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {slide.title}
            </h1>

            <h2 className="text-xl md:text-2xl text-muted-foreground">
              {slide.subtitle}
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              {slide.description}
            </p>

            {/* Quick Navigation Links */}
            <div className="flex flex-wrap gap-3 py-3">
              <Link href="/resources/blogs">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/50 hover:bg-muted/50 hover:border-foreground/30"
                >
                  <IoNewspaperOutline className="h-4 w-4" />
                  Blogs
                </Button>
              </Link>
              <Link href="/resources">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/50 hover:bg-muted/50 hover:border-foreground/30"
                >
                  <IoBookOutline className="h-4 w-4" />
                  Resources
                </Button>
              </Link>
              <Link href="/resources/articles">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/50 hover:bg-muted/50 hover:border-foreground/30"
                >
                  <IoNewspaperOutline className="h-4 w-4" />
                  Articles
                </Button>
              </Link>
              <Link href="/resources/tutorials">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/50 hover:bg-muted/50 hover:border-foreground/30"
                >
                  <IoPlayOutline className="h-4 w-4" />
                  Tutorials
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/50 hover:bg-muted/50 hover:border-foreground/30"
                >
                  <IoRocketOutline className="h-4 w-4" />
                  Portfolio
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 py-2">
              {slide.stats?.map((stat: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={slide.ctaLink}>
                <Button
                  size="default"
                  className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                >
                  {slide.cta}
                  <IoArrowForwardOutline className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="default"
                variant="outline"
                className="gap-2 border-border/50 hover:bg-muted/50"
              >
                <IoPlayCircleOutline className="h-4 w-4" />
                {slide.secondaryCta}
              </Button>
            </div>
          </div>
        );

      case "blog":
        return (
          <div className="slide-content space-y-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm border-border/50 text-muted-foreground"
              >
                <IoNewspaperOutline className="mr-2 h-4 w-4" />
                {slide.category}
              </Badge>
              <span className="text-muted-foreground text-sm">{slide.subtitle}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {slide.title}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {slide.description}
            </p>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <IoPersonOutline className="h-4 w-4" />
                <span className="text-sm">{slide.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoCalendarOutline className="h-4 w-4" />
                <span className="text-sm">{slide.date}</span>
              </div>
              {slide.views && (
                <div className="flex items-center gap-2">
                  <IoTrendingUpOutline className="h-4 w-4" />
                  <span className="text-sm">{slide.views} views</span>
                </div>
              )}
            </div>

            {slide.tags && slide.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {slide.tags.map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-muted/50 text-foreground border-border/50"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="pt-4">
              <Button
                size="lg"
                className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                asChild
              >
                <Link href={slide.ctaLink}>
                  {slide.cta}
                  <IoArrowForwardOutline className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        );

      case "course":
        return (
          <div className="slide-content space-y-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm border-border/50 text-muted-foreground"
              >
                <IoBookOutline className="mr-2 h-4 w-4" />
                {slide.category}
              </Badge>
              {slide.rating && (
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  ★ {slide.rating}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {slide.title}
            </h1>

            <p className="text-lg text-muted-foreground">{slide.subtitle}</p>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {slide.description}
            </p>

            <div className="flex flex-wrap gap-6 text-foreground">
              <div>
                <div className="text-2xl font-bold">{slide.students}</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{slide.modules}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{slide.price}</div>
                <div className="text-sm text-muted-foreground">Price</div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                asChild
              >
                <Link href={slide.ctaLink}>
                  {slide.cta}
                  <IoArrowForwardOutline className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        );

      case "project":
        return (
          <div className="slide-content space-y-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm border-border/50 text-muted-foreground"
              >
                <IoRocketOutline className="mr-2 h-4 w-4" />
                {slide.category}
              </Badge>
              <span className="text-muted-foreground text-sm">{slide.subtitle}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {slide.title}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {slide.description}
            </p>

            <div className="flex flex-wrap gap-6 text-foreground">
              <div className="flex items-center gap-2">
                <IoStarOutline className="h-5 w-5" />
                <div>
                  <div className="font-bold">{slide.stars}</div>
                  <div className="text-xs text-muted-foreground">Stars</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IoGitBranchOutline className="h-5 w-5" />
                <div>
                  <div className="font-bold">{slide.forks}</div>
                  <div className="text-xs text-muted-foreground">Forks</div>
                </div>
              </div>
            </div>

            {slide.tech && slide.tech.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {slide.tech.map((tech: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-muted/50 text-foreground border-border/50"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            )}

            <div className="pt-4">
              <Button
                size="lg"
                className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                asChild
              >
                <a
                  href={slide.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {slide.cta}
                  <IoArrowForwardOutline className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="slide-content space-y-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm border-border/50 text-muted-foreground"
              >
                <IoPlayOutline className="mr-2 h-4 w-4" />
                {slide.category}
              </Badge>
              <span className="text-muted-foreground text-sm">{slide.duration}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {slide.title}
            </h1>

            <p className="text-lg text-muted-foreground">{slide.subtitle}</p>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {slide.description}
            </p>

            <div className="flex flex-wrap gap-6 text-foreground">
              <div className="flex items-center gap-2">
                <IoTrendingUpOutline className="h-5 w-5" />
                <div>
                  <div className="font-bold">{slide.views}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">👍</span>
                <div>
                  <div className="font-bold">{slide.likes}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                asChild
              >
                <Link href={slide.ctaLink}>
                  <IoPlayCircleOutline className="h-5 w-5" />
                  {slide.cta}
                </Link>
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  if (heroSlides.length === 0) {
    return (
      <section className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-2xl">No content available</div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden bg-background"
    >
      {/* Custom Grid Background */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black" />
        
        {/* Main grid pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Secondary smaller grid for depth */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }}
        />
        
        {/* Radial gradient fade from center */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)'
          }}
        />
        
        
        {/* Dynamic accent gradient - very subtle */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient} opacity-[0.02]`}
        />
        
        {/* Top and bottom fade for polish */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Slides Container */}
      <div className="relative z-10 min-h-[70vh] md:min-h-[80vh]">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className={`absolute inset-0 flex items-center ${index === 0 ? "opacity-100" : "opacity-0"}`}
            style={{ display: index === currentSlide ? "flex" : "none" }}
          >
            {slide.layout === "full" ? (
              <div className="w-full h-full relative flex items-center justify-center pb-16">
                {slide.image && (
                  <div className="absolute inset-0 z-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
                  </div>
                )}
                <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center justify-center text-center">
                  <div className="max-w-4xl [&_.slide-content]:items-center [&_.slide-content]:text-center [&_.flex]:justify-center [&_p]:mx-auto">
                    {renderSlideContent(slide)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="container mx-auto px-4 md:px-6 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    {renderSlideContent(slide)}
                  </div>

                  {/* Image/Visual Element */}
                  <div className="order-1 lg:order-2 relative">
                    <div className="relative aspect-square max-w-lg mx-auto">
                      {slide.image ? (
                        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      ) : (
                        <>
                          {/* Placeholder for image - replace with actual images */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm" />
                          <div className="absolute inset-4 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

                          {/* Content Type Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {slide.type === "intro" && (
                              <IoCodeSlashOutline className="h-32 w-32 text-white/20" />
                            )}
                            {slide.type === "blog" && (
                              <IoNewspaperOutline className="h-32 w-32 text-white/20" />
                            )}
                            {slide.type === "course" && (
                              <IoBookOutline className="h-32 w-32 text-white/20" />
                            )}
                            {slide.type === "project" && (
                              <IoRocketOutline className="h-32 w-32 text-white/20" />
                            )}
                            {slide.type === "video" && (
                              <IoPlayCircleOutline className="h-32 w-32 text-white/20" />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Slide Indicators */}
            <div className="flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-2 transition-all duration-300 ${
                    index === currentSlide
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevSlide}
                className="text-white hover:bg-white/10"
              >
                <IoChevronBackOutline className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="text-white hover:bg-white/10"
              >
                {isAutoPlaying ? "Pause" : "Play"}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextSlide}
                className="text-white hover:bg-white/10"
              >
                <IoChevronForwardOutline className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="text-white/60 text-sm">Scroll to explore</div>
      </div>
    </section>
  );
}
