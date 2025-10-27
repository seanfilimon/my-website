"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { 
  IoPlayCircleOutline,
  IoTimeOutline,
  IoEyeOutline
} from "react-icons/io5";

const latestVideos = [
  {
    id: 1,
    title: "Building a SaaS from Scratch",
    thumbnail: "/bg-pattern.png",
    duration: "24:15",
    views: "12.5K",
    publishedAt: "2 days ago",
    href: "/tutorials/building-saas-from-scratch"
  },
  {
    id: 2,
    title: "Next.js 16 New Features",
    thumbnail: "/bg-pattern.png",
    duration: "18:42",
    views: "8.2K",
    publishedAt: "5 days ago",
    href: "/tutorials/nextjs-16-features"
  },
  {
    id: 3,
    title: "Advanced GSAP Animations",
    thumbnail: "/bg-pattern.png",
    duration: "32:08",
    views: "15.3K",
    publishedAt: "1 week ago",
    href: "/tutorials/advanced-gsap-animations"
  },
  {
    id: 4,
    title: "Building AI Features with OpenAI",
    thumbnail: "/bg-pattern.png",
    duration: "28:30",
    views: "21.8K",
    publishedAt: "1 week ago",
    href: "/tutorials/ai-features-openai"
  },
  {
    id: 5,
    title: "TypeScript Best Practices 2025",
    thumbnail: "/bg-pattern.png",
    duration: "19:45",
    views: "9.7K",
    publishedAt: "2 weeks ago",
    href: "/tutorials/typescript-best-practices"
  }
];

export function LatestVideos() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Header animation
    gsap.fromTo(
      ".videos-header",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".videos-header",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    // Video cards stagger animation
    gsap.fromTo(
      ".video-card",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".videos-grid",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-12 px-4 border-t">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="videos-header flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Latest Videos
            </h2>
            <p className="text-sm text-muted-foreground">
              In-depth tutorials and insights
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-sm">
            <Link href="/tutorials" className="flex items-center gap-2">
              View All
              <IoPlayCircleOutline className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Videos Grid - Single Row */}
        <div className="videos-grid grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {latestVideos.map((video) => (
            <Link
              key={video.id}
              href={video.href}
              className="video-card group"
            >
              <div className="relative aspect-video rounded-md overflow-hidden bg-muted/20 border mb-2">
                {/* Thumbnail */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${video.thumbnail})` }}
                />
                
                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground transform transition-transform group-hover:scale-110">
                    <IoPlayCircleOutline className="h-6 w-6" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-semibold bg-black/80 text-white rounded">
                  {video.duration}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <IoEyeOutline className="h-3 w-3" />
                    <span>{video.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IoTimeOutline className="h-3 w-3" />
                    <span>{video.publishedAt}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

