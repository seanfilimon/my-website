"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  IoTrendingUpOutline,
  IoStatsChartOutline,
  IoRocketOutline,
  IoCodeSlashOutline,
  IoBulbOutline,
  IoLayersOutline,
  IoFlashOutline,
  IoBuildOutline,
  IoArrowForwardOutline,
  IoPlayCircleOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoBookOutline,
  IoNewspaperOutline,
  IoTerminalOutline,
  IoGitBranchOutline,
  IoCubeOutline,
  IoColorPaletteOutline,
  IoSchoolOutline,
  IoMapOutline
} from "react-icons/io5";

// Carousel images
const carouselImages = [
  {
    src: "/face_grayscale_nobg.png",
    alt: "Sean Filimon - Entrepreneur"
  },
  {
    src: "/bg-pattern.png",
    alt: "TechFlow Office"
  },
  {
    src: "/me.png", 
    alt: "Speaking at Conference"
  },
  {
    src: "/face_grayscale_nobg.png",
    alt: "Team Building"
  },
  {
    src: "/bg-pattern.png",
    alt: "Code Review Session"
  }
];

// Resource buttons (4x4 grid) - properly styled
const resourceButtons = [
  { icon: IoBookOutline, label: "Guides", href: "/portfolio?category=Guides", description: "Step-by-step tutorials" },
  { icon: IoPlayCircleOutline, label: "Tutorials", href: "/portfolio?category=Tutorials", description: "Video content" },
  { icon: IoNewspaperOutline, label: "Blog", href: "/portfolio?category=Blog", description: "Articles & insights" },
  { icon: IoCodeSlashOutline, label: "Code Snippets", href: "/portfolio?category=Snippets", description: "Ready-to-use code" },
  { icon: IoTerminalOutline, label: "CLI Tools", href: "/portfolio?category=Tools", description: "Command line utilities" },
  { icon: IoLayersOutline, label: "Templates", href: "/portfolio?category=Templates", description: "Project starters" },
  { icon: IoGitBranchOutline, label: "Boilerplates", href: "/portfolio?category=Boilerplates", description: "Full-stack setups" },
  { icon: IoCubeOutline, label: "Components", href: "/portfolio?category=Components", description: "UI building blocks" },
  { icon: IoColorPaletteOutline, label: "Designs", href: "/portfolio?category=Designs", description: "Design systems" },
  { icon: IoSchoolOutline, label: "Courses", href: "/portfolio?category=Courses", description: "In-depth learning" },
  { icon: IoMapOutline, label: "Roadmaps", href: "/portfolio?category=Roadmaps", description: "Learning paths" },
  { icon: IoBuildOutline, label: "Projects", href: "/portfolio?category=Projects", description: "Open source work" },
  { icon: IoBulbOutline, label: "Ideas", href: "/portfolio?category=Ideas", description: "Concepts & experiments" },
  { icon: IoFlashOutline, label: "Quick Wins", href: "/portfolio?category=Quick", description: "Fast solutions" },
  { icon: IoStatsChartOutline, label: "Case Studies", href: "/portfolio?category=Cases", description: "Real-world examples" },
  { icon: IoTrendingUpOutline, label: "Growth", href: "/portfolio?category=Growth", description: "Scaling strategies" }
];

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!heroRef.current) return;

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Dynamic background animations
    gsap.to(".floating-card", {
      y: "random(-15, 15)",
      x: "random(-10, 10)",
      rotation: "random(-5, 5)",
      duration: "random(3, 6)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.5
    });

    // Main content animations
    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.set(".hero-left > *", { opacity: 0, x: -50 })
      .set(".hero-right > *", { opacity: 0, x: 50 })
      .set(".floating-card", { opacity: 0, scale: 0.8 })
      .to(".hero-left > *", { 
        opacity: 1, 
        x: 0, 
        duration: 0.8, 
        stagger: 0.1,
        ease: "power3.out" 
      })
      .to(".hero-right > *", { 
        opacity: 1, 
        x: 0, 
        duration: 0.6, 
        stagger: 0.1,
        ease: "power3.out" 
      }, "-=0.4")
      .to(".floating-card", { 
        opacity: 1, 
        scale: 1, 
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }, "-=0.6");

    // Resources section animation
    if (resourcesRef.current) {
      // Animate heading
      gsap.fromTo(
        ".resources-header",
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".resources-header",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );

      // Animate resource cards with stagger
      gsap.fromTo(
        ".resource-card",
        {
          opacity: 0,
          y: 30,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".resources-grid",
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10">
        {/* City Background */}
        <div className="absolute inset-0">
          <Image
            src="/bg-pattern.png"
            alt="Background"
            fill
            className="object-cover opacity-15"
            style={{ filter: 'grayscale(100%) contrast(1.2)' }}
            priority
          />
        </div>
        
        {/* Multiple Gradient Layers */}
        <div className="absolute inset-0 bg-linear-to-br from-background via-background/95 to-background/90" />
        <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-accent/5" />
        
        {/* Animated Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-conic from-primary/20 via-transparent to-accent/20 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-conic from-accent/15 via-transparent to-primary/15 rounded-full blur-3xl animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Main Content */}
            <div className="hero-left space-y-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl md:text-2xl text-primary font-semibold mb-4">
                    Serial Entrepreneur & Software Engineer
                  </h1>
                </div>

                <div className="space-y-4">
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    Welcome to my corner of the internet where I share everything I&apos;ve learned 
                    building companies, writing code, and helping developers level up their careers.
                  </p>
                  
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    <strong>What you&apos;ll find here:</strong> In-depth tutorials, startup case studies, 
                    open-source tools, development guides, and the real stories behind building 
                    successful tech companies from the ground up.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-sm font-bold uppercase px-8">
                  <Link href="/portfolio" className="flex items-center gap-2">
                    <IoRocketOutline className="h-5 w-5" />
                    Explore Resources
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-sm">
                  <Link href="/about" className="flex items-center gap-2">
                    <IoArrowForwardOutline className="h-4 w-4" />
                    My Story
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Image Carousel */}
            <div className="hero-right relative hero-carousel">
              <div className="relative">
                {/* Main Carousel Container */}
                <div className="relative w-96 h-96 lg:w-[500px] lg:h-[500px] mx-auto bg-background/90 backdrop-blur border-2 border-primary/20 rounded-sm overflow-hidden shadow-2xl">
                  <div className="relative w-full h-full">
                    {carouselImages.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent" />
                      </div>
                    ))}
                  </div>

                  {/* Carousel Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentImageIndex((prev: number) => 
                        prev === 0 ? carouselImages.length - 1 : prev - 1
                      )}
                      className="h-8 w-8 rounded-sm bg-background/80 backdrop-blur border hover:bg-background transition-colors flex items-center justify-center"
                    >
                      <IoChevronBackOutline className="h-4 w-4" />
                    </button>

                    <div className="flex gap-2">
                      {carouselImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 w-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/50'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentImageIndex((prev: number) => 
                        (prev + 1) % carouselImages.length
                      )}
                      className="h-8 w-8 rounded-sm bg-background/80 backdrop-blur border hover:bg-background transition-colors flex items-center justify-center"
                    >
                      <IoChevronForwardOutline className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Image Caption */}
                  <div className="absolute top-4 left-4 right-4">
                    <span className="px-2 py-1 text-xs font-medium bg-background/90 text-foreground rounded-sm">
                      {carouselImages[currentImageIndex]?.alt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Resources - 4x4 Grid */}
          <div ref={resourcesRef} className="mt-20 pt-20">
            <div className="resources-header text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Resources for Developers</h2>
              <p className="text-muted-foreground text-base">
                Everything you need to level up your development skills and build better products
              </p>
            </div>
            
            <div className="resources-grid grid grid-cols-2 md:grid-cols-4 gap-3">
              {resourceButtons.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Link
                    key={index}
                    href={resource.href}
                    className="resource-card group relative flex flex-col gap-2 p-4 bg-background/60 backdrop-blur border rounded-sm hover:bg-background/80 hover:border-primary/40 transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="shrink-0">
                        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight">
                          {resource.label}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {resource.description}
              </div>
              </div>
              </div>
                </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
