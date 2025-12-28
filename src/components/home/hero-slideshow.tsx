"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import Link from "next/link";
import Image from "next/image";
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
  IoTimeOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoBookOutline,
  IoNewspaperOutline,
  IoPlayOutline
} from "react-icons/io5";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin);
}

// Mock data - replace with actual data fetching
const heroSlides = [
  {
    id: 1,
    type: "intro",
    title: "Sean Filimon",
    subtitle: "Full Stack Developer & Tech Educator",
    description: "Building the future of web development with Next.js, React, and modern technologies. Sharing knowledge through tutorials, courses, and open-source projects.",
    cta: "Explore My Work",
    ctaLink: "/portfolio",
    secondaryCta: "Watch Intro",
    image: "/images/hero-profile.jpg",
    gradient: "from-blue-600 via-purple-600 to-pink-600",
    stats: [
      { label: "Projects", value: "50+" },
      { label: "Articles", value: "120+" },
      { label: "Students", value: "10K+" },
      { label: "GitHub Stars", value: "5K+" }
    ]
  },
  {
    id: 2,
    type: "blog",
    category: "Latest Blog",
    title: "Why I Migrated to Next.js 16",
    subtitle: "Framework • 8 min read",
    description: "Discover the game-changing features of Next.js 16 and why it's the perfect time to upgrade your applications.",
    author: "Sean Filimon",
    date: "Jan 28, 2024",
    image: "/images/blog-nextjs.jpg",
    gradient: "from-green-600 via-teal-600 to-blue-600",
    cta: "Read Article",
    ctaLink: "/blog/why-i-migrated-to-nextjs-16",
    tags: ["Next.js", "React", "Performance"]
  },
  {
    id: 3,
    type: "course",
    category: "New Course",
    title: "Next.js 16 Complete Masterclass",
    subtitle: "Course • 12 hours • Beginner to Advanced",
    description: "Master Next.js 16 with this comprehensive course covering everything from basics to advanced patterns.",
    students: "2,450",
    rating: 4.9,
    image: "/images/course-nextjs.jpg",
    gradient: "from-orange-600 via-red-600 to-pink-600",
    cta: "Start Learning",
    ctaLink: "/courses/nextjs-16-masterclass",
    modules: 24,
    price: "$49.99"
  },
  {
    id: 4,
    type: "project",
    category: "Featured Project",
    title: "AI-Powered Code Assistant",
    subtitle: "Open Source • TypeScript • React",
    description: "An intelligent code assistant that helps developers write better code faster with AI-powered suggestions.",
    stars: "1.2K",
    forks: "234",
    image: "/images/project-ai.jpg",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    cta: "View on GitHub",
    ctaLink: "https://github.com/seanfilimon/ai-code-assistant",
    tech: ["TypeScript", "React", "OpenAI", "Next.js"]
  },
  {
    id: 5,
    type: "video",
    category: "Latest Video",
    title: "Building a SaaS with Next.js",
    subtitle: "Tutorial • 45 minutes",
    description: "Learn how to build a complete SaaS application from scratch using Next.js, Prisma, and Stripe.",
    views: "8.2K",
    likes: "450",
    image: "/images/video-saas.jpg",
    gradient: "from-red-600 via-pink-600 to-purple-600",
    cta: "Watch Now",
    ctaLink: "/videos/building-saas-nextjs",
    duration: "45:20"
  }
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize GSAP animations
  useEffect(() => {
    if (!containerRef.current) return;

    // Create main timeline
    const tl = gsap.timeline({ paused: true });
    timelineRef.current = tl;

    // Initial animation
    gsap.set(slideRefs.current, { opacity: 0, scale: 0.9 });
    if (slideRefs.current[0]) {
      gsap.to(slideRefs.current[0], {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out"
      });
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        handleNextSlide();
      }, 6000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying]);

  const handleSlideChange = (newIndex: number) => {
    const currentEl = slideRefs.current[currentSlide];
    const nextEl = slideRefs.current[newIndex];

    if (!currentEl || !nextEl) return;

    // Create transition timeline
    const tl = gsap.timeline();

    // Animate out current slide
    tl.to(currentEl, {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.in"
    });

    // Animate in new slide
    tl.to(nextEl, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.3");

    // Animate content elements
    const contentElements = nextEl.querySelectorAll(".slide-content > *");
    tl.from(contentElements, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.5");

    setCurrentSlide(newIndex);
  };

  const handleNextSlide = () => {
    const nextIndex = (currentSlide + 1) % heroSlides.length;
    handleSlideChange(nextIndex);
  };

  const handlePrevSlide = () => {
    const prevIndex = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    handleSlideChange(prevIndex);
  };

  const renderSlideContent = (slide: typeof heroSlides[0]) => {
    switch (slide.type) {
      case "intro":
        return (
          <div className="slide-content space-y-6">
            <Badge variant="outline" className="px-3 py-1 text-sm border-white/20 text-white">
              <IoSparklesOutline className="mr-2 h-4 w-4" />
              Welcome to My Portfolio
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              {slide.title}
            </h1>
            
            <h2 className="text-2xl md:text-3xl text-white/90">
              {slide.subtitle}
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {slide.description}
            </p>
            
            <div className="flex flex-wrap gap-8 py-4">
              {slide.stats?.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="gap-2 bg-white text-black hover:bg-white/90">
                {slide.cta}
                <IoArrowForwardOutline className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
                <IoPlayCircleOutline className="h-5 w-5" />
                {slide.secondaryCta}
              </Button>
            </div>
          </div>
        );

      case "blog":
        return (
          <div className="slide-content space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 text-sm border-white/20 text-white">
                <IoNewspaperOutline className="mr-2 h-4 w-4" />
                {slide.category}
              </Badge>
              <span className="text-white/70 text-sm">{slide.subtitle}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {slide.title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {slide.description}
            </p>
            
            <div className="flex items-center gap-4 text-white/70">
              <div className="flex items-center gap-2">
                <IoPersonOutline className="h-4 w-4" />
                <span className="text-sm">{slide.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoCalendarOutline className="h-4 w-4" />
                <span className="text-sm">{slide.date}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {slide.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-white/10 text-white border-white/20">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="pt-4">
              <Button size="lg" className="gap-2 bg-white text-black hover:bg-white/90" asChild>
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
              <Badge variant="outline" className="px-3 py-1 text-sm border-white/20 text-white">
                <IoBookOutline className="mr-2 h-4 w-4" />
                {slide.category}
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                ★ {slide.rating}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {slide.title}
            </h1>
            
            <p className="text-lg text-white/70">
              {slide.subtitle}
            </p>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {slide.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-white">
              <div>
                <div className="text-2xl font-bold">{slide.students}</div>
                <div className="text-sm text-white/70">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{slide.modules}</div>
                <div className="text-sm text-white/70">Modules</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{slide.price}</div>
                <div className="text-sm text-white/70">Price</div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button size="lg" className="gap-2 bg-white text-black hover:bg-white/90" asChild>
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
              <Badge variant="outline" className="px-3 py-1 text-sm border-white/20 text-white">
                <IoRocketOutline className="mr-2 h-4 w-4" />
                {slide.category}
              </Badge>
              <span className="text-white/70 text-sm">{slide.subtitle}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {slide.title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {slide.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="font-bold">{slide.stars}</div>
                  <div className="text-xs text-white/70">Stars</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔱</span>
                <div>
                  <div className="font-bold">{slide.forks}</div>
                  <div className="text-xs text-white/70">Forks</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {slide.tech?.map((tech, index) => (
                <Badge key={index} variant="secondary" className="bg-white/10 text-white border-white/20">
                  {tech}
                </Badge>
              ))}
            </div>
            
            <div className="pt-4">
              <Button size="lg" className="gap-2 bg-white text-black hover:bg-white/90" asChild>
                <a href={slide.ctaLink} target="_blank" rel="noopener noreferrer">
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
              <Badge variant="outline" className="px-3 py-1 text-sm border-white/20 text-white">
                <IoPlayOutline className="mr-2 h-4 w-4" />
                {slide.category}
              </Badge>
              <span className="text-white/70 text-sm">{slide.duration}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {slide.title}
            </h1>
            
            <p className="text-lg text-white/70">
              {slide.subtitle}
            </p>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {slide.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <div>
                  <div className="font-bold">{slide.views}</div>
                  <div className="text-xs text-white/70">Views</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">👍</span>
                <div>
                  <div className="font-bold">{slide.likes}</div>
                  <div className="text-xs text-white/70">Likes</div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button size="lg" className="gap-2 bg-white text-black hover:bg-white/90" asChild>
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

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 opacity-50">
        <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient}`} />
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Slides Container */}
      <div className="relative z-10 min-h-screen">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(el) => (slideRefs.current[index] = el)}
            className={`absolute inset-0 flex items-center ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
            style={{ display: index === currentSlide ? 'flex' : 'none' }}
          >
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  {renderSlideContent(slide)}
                </div>
                
                {/* Image/Visual Element */}
                <div className="order-1 lg:order-2 relative">
                  <div className="relative aspect-square max-w-lg mx-auto">
                    {/* Placeholder for image - replace with actual images */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm" />
                    <div className="absolute inset-4 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
                    
                    {/* Content Type Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {slide.type === "intro" && <IoCodeSlashOutline className="h-32 w-32 text-white/20" />}
                      {slide.type === "blog" && <IoNewspaperOutline className="h-32 w-32 text-white/20" />}
                      {slide.type === "course" && <IoBookOutline className="h-32 w-32 text-white/20" />}
                      {slide.type === "project" && <IoRocketOutline className="h-32 w-32 text-white/20" />}
                      {slide.type === "video" && <IoPlayCircleOutline className="h-32 w-32 text-white/20" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/60'
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
                {isAutoPlaying ? 'Pause' : 'Play'}
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
