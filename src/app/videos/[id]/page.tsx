"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoPlayCircleOutline,
  IoEyeOutline,
  IoThumbsUpOutline,
  IoShareSocialOutline,
  IoBookmarkOutline,
  IoPersonOutline,
  IoCalendarOutline
} from "react-icons/io5";

// Mock video data
const getVideoData = (id: string) => {
  const videos: Record<string, any> = {
    "building-saas-from-scratch": {
      id: "building-saas-from-scratch",
      title: "Building a SaaS from Scratch",
      description: "Complete walkthrough of building a production-ready SaaS application with Next.js, Prisma, and Stripe",
      framework: "nextjs",
      frameworkName: "Next.js",
      thumbnail: "/bg-pattern.png",
      videoUrl: "https://youtube.com/watch?v=example",
      duration: "24:15",
      views: "12.5K",
      likes: "1.2K",
      publishedAt: "October 26, 2024",
      author: "Sean Filimon",
      authorTitle: "Founder & CEO at LegionEdge",
      tags: ["Next.js", "SaaS", "Full Stack", "Stripe", "Prisma"],
      chapters: [
        { title: "Introduction", time: "0:00" },
        { title: "Project Setup", time: "2:30" },
        { title: "Database Schema", time: "6:45" },
        { title: "Authentication", time: "11:20" },
        { title: "Stripe Integration", time: "16:40" },
        { title: "Deployment", time: "21:00" }
      ],
      resources: [
        { name: "GitHub Repository", url: "https://github.com/example/saas" },
        { name: "Starter Template", url: "https://example.com/template" },
        { name: "Documentation", url: "https://docs.example.com" }
      ],
      relatedVideos: [
        {
          id: "nextjs-16-features",
          title: "Next.js 16 New Features",
          thumbnail: "/bg-pattern.png",
          duration: "18:42",
          views: "8.2K",
          href: "/videos/nextjs-16-features"
        },
        {
          id: "advanced-gsap",
          title: "Advanced GSAP Animations",
          thumbnail: "/bg-pattern.png",
          duration: "32:08",
          views: "15.3K",
          href: "/videos/advanced-gsap-animations"
        }
      ]
    }
  };

  return videos[id] || null;
};

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;
  const video = getVideoData(videoId);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".video-hero",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      }
    );

    gsap.fromTo(
      ".content-section",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".content-section",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Video Not Found</h1>
          <p className="text-muted-foreground mb-6">The video you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/resources">Back to Resources</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main ref={sectionRef} className="min-h-screen bg-background">
      {/* Compact Header */}
      <section className="border-b bg-muted/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button asChild variant="ghost" size="sm" className="rounded-sm -ml-2">
              <Link href={`/resources/${video.framework}`} className="flex items-center gap-2">
                <IoArrowForwardOutline className="h-4 w-4 rotate-180" />
                <span className="hidden sm:inline">Back to Resources</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href={`/resources/${video.framework}`} className="hover:text-foreground transition-colors">{video.frameworkName}</Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {video.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded-sm bg-primary/10 text-primary">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Video Player Section - YouTube Style */}
      <section className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-6 items-start">
          {/* Main Video Area - 70% */}
          <div className="flex-1 min-w-0">
            <div className="video-hero">
              {/* Video Player */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black mb-4">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="bg-white/90 rounded-full p-5 cursor-pointer hover:scale-110 transition-transform">
                    <IoPlayCircleOutline className="h-14 w-14 text-black" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <h1 className="text-xl font-bold mb-2">
                {video.title}
              </h1>

              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IoEyeOutline className="h-4 w-4" />
                    {video.views} views
                  </span>
                  <span>•</span>
                  <span>{video.publishedAt}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="rounded-full gap-2">
                    <IoThumbsUpOutline className="h-4 w-4" />
                    {video.likes}
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <IoShareSocialOutline className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <IoBookmarkOutline className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <IoPersonOutline className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{video.author}</p>
                    <p className="text-xs text-muted-foreground">{video.authorTitle}</p>
                  </div>
                </div>
                <Button size="sm" className="rounded-full">
                  Subscribe
                </Button>
              </div>

              {/* Description */}
              <div className="content-section p-4 rounded-lg bg-muted/30 mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {video.description}
                </p>
                
                {/* Chapters */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-bold mb-3">Chapters</h3>
                  <div className="space-y-1">
                    {video.chapters.map((chapter: any, index: number) => (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="text-sm text-primary hover:underline">{chapter.title}</span>
                        <span className="text-xs text-muted-foreground">{chapter.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="content-section p-4 rounded-lg bg-muted/30">
                <h3 className="text-sm font-bold mb-3">Resources</h3>
                <div className="space-y-2">
                  {video.resources.map((resource: any, index: number) => (
                    <Link
                      key={index}
                      href={resource.url}
                      target="_blank"
                      className="block text-sm text-primary hover:underline"
                    >
                      {resource.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Next Videos (YouTube Style) */}
          <div className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-4">
              <h2 className="text-sm font-bold mb-4">Next Videos</h2>
              <div className="space-y-3">
                {video.relatedVideos.map((related: any) => (
                  <Link
                    key={related.id}
                    href={related.href}
                    className="group flex gap-2 cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-40 aspect-video overflow-hidden rounded-lg bg-muted/20 flex-shrink-0">
                      <Image
                        src={related.thumbnail}
                        alt={related.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                        <IoPlayCircleOutline className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-1 right-1">
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-black/80 text-white rounded">
                          {related.duration}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {video.author}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{related.views} views</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Back to Resources Link */}
                <div className="pt-4 border-t mt-4">
                  <Button asChild variant="outline" className="w-full rounded-sm justify-start" size="sm">
                    <Link href={`/resources/${video.framework}`}>
                      <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                      All {video.frameworkName} Videos
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Related Videos */}
      {video.relatedVideos && video.relatedVideos.length > 0 && (
        <section className="lg:hidden py-8 px-4 sm:px-6 bg-muted/30 border-t">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold mb-4">Related Videos</h2>
            <div className="space-y-3">
              {video.relatedVideos.map((related: any) => (
                <Link
                  key={related.id}
                  href={related.href}
                  className="group flex gap-3 cursor-pointer"
                >
                  <div className="relative w-32 aspect-video overflow-hidden rounded-lg bg-muted/20 flex-shrink-0">
                    <Image
                      src={related.thumbnail}
                      alt={related.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-1 right-1">
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-black/80 text-white rounded">
                        {related.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:text-primary">
                      {related.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{related.views} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Want More {video.frameworkName} Content?</h2>
          <p className="text-muted-foreground mb-6">
            Explore more videos, courses, and tutorials
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-sm">
              <Link href={`/resources/${video.framework}`}>
                <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                Browse {video.frameworkName} Resources
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-sm">
              <Link href="/resources">View All Resources</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

