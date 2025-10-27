"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { scrollStaggerReveal, scrollFadeIn, parallax } from "@/src/lib/gsap/scroll";
import { 
  IoCodeSlashOutline, 
  IoBookOutline, 
  IoRocketOutline,
  IoConstructOutline,
  IoLayersOutline,
  IoFlashOutline,
  IoArrowForwardOutline
} from "react-icons/io5";

const resources = [
  {
    title: "Templates",
    description: "Production-ready starter templates",
    icon: IoLayersOutline,
    href: "/templates",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Guides",
    description: "Step-by-step development guides",
    icon: IoBookOutline,
    href: "/guides",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Projects",
    description: "Open source projects & demos",
    icon: IoRocketOutline,
    href: "/projects",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Snippets",
    description: "Reusable code examples",
    icon: IoCodeSlashOutline,
    href: "/snippets",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Tools",
    description: "Developer utilities & helpers",
    icon: IoConstructOutline,
    href: "/tools",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    title: "Resources",
    description: "Curated learning materials",
    icon: IoFlashOutline,
    href: "/resources",
    gradient: "from-yellow-500 to-amber-500",
  },
];

export function ResourcesGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    // Add subtle parallax to section
    parallax(gridRef.current, {
      speed: 0.1,
      start: "top bottom",
      end: "bottom top",
    });

    // Animate section header with delay to ensure visibility
    setTimeout(() => {
      scrollFadeIn(".resources-header", {
        start: "top 85%",
        y: 60,
      });

      // Animate resource cards with stagger
      scrollStaggerReveal(".resource-card", {
        start: "top 80%",
        stagger: 0.1,
        y: 80,
      });

      // Animate bottom CTA
      scrollFadeIn(".resources-cta", {
        start: "top 90%",
        y: 40,
      });
    }, 100);
  }, []);

  return (
    <section ref={gridRef} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="resources-header text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Here you will find a set of tools from Templates to Guides to Projects
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Link
                key={resource.title}
                href={resource.href}
                className="resource-card group relative overflow-hidden rounded-sm border-2 border-border bg-background p-8 transition-all duration-300 hover:border-transparent hover:-translate-y-1"
              >
                {/* Gradient Background on Hover */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${resource.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                {/* Icon with Gradient */}
                <div className="relative mb-6">
                  <div className={`inline-flex p-3 rounded-sm bg-gradient-to-br ${resource.gradient} text-white`}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {resource.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {resource.description}
                  </p>
                  
                  {/* Arrow on Hover */}
                  <div className="flex items-center gap-2 text-sm font-medium pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Explore</span>
                    <IoArrowForwardOutline className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Border Gradient on Hover */}
                <div 
                  className={`absolute inset-0 rounded-sm bg-gradient-to-br ${resource.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                  style={{ padding: '2px' }}
                >
                  <div className="absolute inset-[2px] rounded-sm bg-background" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="resources-cta mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 text-lg font-medium hover:underline"
          >
            Get in touch
            <IoArrowForwardOutline className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

