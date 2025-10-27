"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  IoArrowForwardOutline,
  IoCalendarOutline
} from "react-icons/io5";

const experience = [
  {
    company: "LegionEdge",
    position: "Founder & CEO",
    description: "Leading a next-generation AI-powered development platform. Building collaborative tools that help teams ship faster and smarter.",
    websiteUrl: "https://beta.legionedge.ai",
    isIframe: true,
    period: "2023 - Present",
    type: "Current",
    tags: ["AI", "SaaS", "Developer Tools"],
    links: {
      live: "https://legionedge.ai",
      case_study: "/case-studies/legionedge",
    }
  },
  {
    company: "Cezium Software Inc",
    position: "Founder & CEO",
    description: "Built enterprise software solutions for Fortune 500 companies. Specialized in scalable web applications and cloud infrastructure.",
    websiteUrl: "https://cezium.software",
    isIframe: true,
    period: "2019 - 2023",
    type: "Past",
    tags: ["Enterprise", "Cloud", "Consulting"],
    links: {
      live: "https://cezium.software",
      case_study: "/case-studies/cezium",
    }
  },
  {
    company: "OpticEngine Inc",
    position: "Founder & CEO",
    description: "Created computer vision and AI solutions for autonomous systems. Built advanced image processing technology for robotics applications.",
    websiteUrl: "https://opticengine.net",
    isIframe: true,
    period: "2018 - 2022",
    type: "Past",
    tags: ["AI", "Computer Vision", "Hardware"],
    links: {
      live: "https://opticengine.net",
      case_study: "/case-studies/opticengine",
    }
  },
  {
    company: "Self-Employed",
    position: "Independent Developer & Consultant",
    description: "7 years building products, consulting for startups, and helping companies scale their development teams and infrastructure.",
    image: "/bg-pattern.png",
    isIframe: false,
    period: "2016 - 2023",
    type: "Freelance",
    tags: ["Full-Stack", "Consulting", "Mentorship"],
    links: {
      case_study: "/about",
    }
  }
];

export function FeaturedWork() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Header animation
    gsap.fromTo(
      ".experience-header",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".experience-header",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    // Timeline line animation - draws from top to bottom
    gsap.fromTo(
      ".timeline-line",
      { scaleY: 0, transformOrigin: "top" },
      {
        scaleY: 1,
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".experience-list",
          start: "top 75%",
          toggleActions: "play none none none"
        }
      }
    );

    // Timeline dots animation - appear in sequence
    gsap.fromTo(
      ".timeline-dot",
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.15,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".experience-list",
          start: "top 75%",
          toggleActions: "play none none none"
        },
        delay: 0.3 // Start after timeline line begins
      }
    );

    // Items stagger animation
    gsap.fromTo(
      ".experience-item",
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".experience-list",
          start: "top 75%",
          toggleActions: "play none none none"
        },
        delay: 0.3 // Start with dots
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-12 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="experience-header text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Experience
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Building companies and leading teams for over a decade
          </p>
        </div>

        {/* Timeline List */}
        <div className="experience-list relative space-y-8 max-w-6xl mx-auto">
          {/* Vertical Timeline Line */}
          <div className="timeline-line absolute left-0 top-0 bottom-0 w-px bg-border/30" />

          {experience.map((exp) => (
            <div
              key={exp.company}
              className="experience-item relative pl-8 group"
            >
              {/* Timeline Dot */}
              <div className="timeline-dot absolute left-0 top-2 w-2 h-2 rounded-full bg-primary border-2 border-background -translate-x-[3.5px]" />

              <div className="grid md:grid-cols-[200px_1fr] gap-4 items-start">
                {/* Left: Website Preview */}
                <div className="relative h-32 rounded-md overflow-hidden border bg-muted/20">
                  {exp.isIframe ? (
                    <iframe
                      src={exp.websiteUrl}
                      title={`${exp.company} website preview`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      loading="lazy"
                      sandbox="allow-same-origin"
                    />
                  ) : exp.image ? (
                    <Image
                      src={exp.image}
                      alt={exp.company}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                {/* Right: Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        {exp.company}
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        {exp.position}
                      </p>
                    </div>
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium border rounded bg-accent text-accent-foreground shrink-0">
                      {exp.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IoCalendarOutline className="h-3.5 w-3.5" />
                    <span>{exp.period}</span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs font-medium border rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {exp.links.live && (
                      <Button asChild size="sm" className="rounded-sm font-bold">
                        <Link href={exp.links.live} target="_blank">
                          Visit Website
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="rounded-sm">
                      <Link href={exp.links.case_study} className="flex items-center gap-1.5">
                        <span>Learn More</span>
                        <IoArrowForwardOutline className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline" size="sm" className="rounded-sm">
            <Link href="/about" className="flex items-center gap-2">
              View Full Resume
              <IoArrowForwardOutline className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
