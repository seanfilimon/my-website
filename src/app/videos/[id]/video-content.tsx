"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  IoArrowForwardOutline,
  IoChevronForwardOutline,
  IoPlayCircleOutline,
  IoEyeOutline,
  IoThumbsUpOutline,
  IoShareSocialOutline,
  IoBookmarkOutline,
  IoPersonOutline,
} from "react-icons/io5";

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  publishedAt: Date | string | null;
  author: {
    name: string | null;
    title: string | null;
    image?: string | null;
  } | null;
  resource: {
    name: string;
    slug: string;
  };
  tags: { name: string }[] | string[];
  chapters: any;
  resources: any;
  relatedVideos?: {
    id: string;
    title: string;
    thumbnail: string | null;
    duration: string;
    views: number;
    slug: string;
    author?: { name: string | null } | null;
  }[];
}

interface VideoContentProps {
  video: VideoData;
}

export function VideoContent({ video }: VideoContentProps) {
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

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Unknown date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Safe access for tags since they might be object arrays or string arrays depending on source
  const renderTags = () => {
    if (!video.tags) return null;
    return video.tags.map((tag: any, index: number) => {
      const tagName = typeof tag === 'string' ? tag : tag.name;
      return (
        <span key={index} className="px-2 py-0.5 text-xs font-medium rounded-sm bg-primary/10 text-primary">
          {tagName}
        </span>
      );
    });
  };

  // Helper to parse JSON fields safely
  const getArrayFromJson = (json: any) => {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    return [];
  };

  const chapters = getArrayFromJson(video.chapters);
  const resourceLinks = getArrayFromJson(video.resources);

  return (
    <main ref={sectionRef} className="min-h-screen bg-background">
      {/* Compact Header */}
      <section className="border-b bg-muted/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button asChild variant="ghost" size="sm" className="rounded-sm -ml-2">
              <Link href={`/resources/${video.resource.slug}`} className="flex items-center gap-2">
                <IoArrowForwardOutline className="h-4 w-4 rotate-180" />
                <span className="hidden sm:inline">Back to Resources</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href={`/resources/${video.resource.slug}`} className="hover:text-foreground transition-colors">{video.resource.name}</Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {renderTags()}
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
                  src={video.thumbnail || "/bg-pattern.png"}
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
                    {video.views.toLocaleString()} views
                  </span>
                  <span>•</span>
                  <span>{formatDate(video.publishedAt)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="rounded-full gap-2">
                    <IoThumbsUpOutline className="h-4 w-4" />
                    {video.likes.toLocaleString()}
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
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {video.author?.image ? (
                        <Image src={video.author.image} alt={video.author.name || "Author"} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                        <IoPersonOutline className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{video.author?.name || "Unknown Author"}</p>
                    {video.author?.title && <p className="text-xs text-muted-foreground">{video.author.title}</p>}
                  </div>
                </div>
                <Button size="sm" className="rounded-full">
                  Subscribe
                </Button>
              </div>

              {/* Description */}
              <div className="content-section p-4 rounded-lg bg-muted/30 mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                  {video.description}
                </p>

                {/* Chapters */}
                {chapters.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-bold mb-3">Chapters</h3>
                    <div className="space-y-1">
                      {chapters.map((chapter: any, index: number) => (
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
                )}
              </div>

              {/* Resources */}
              {resourceLinks.length > 0 && (
                <div className="content-section p-4 rounded-lg bg-muted/30">
                  <h3 className="text-sm font-bold mb-3">Resources</h3>
                  <div className="space-y-2">
                    {resourceLinks.map((resource: any, index: number) => (
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
              )}
            </div>
          </div>

          {/* Sidebar - Next Videos (YouTube Style) */}
          <div className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-4">
              <h2 className="text-sm font-bold mb-4">Next Videos</h2>
              <div className="space-y-3">
                {video.relatedVideos && video.relatedVideos.length > 0 ? (
                  video.relatedVideos.map((related: any) => (
                    <Link
                      key={related.id}
                      href={`/videos/${related.slug}`}
                      className="group flex gap-2 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-40 aspect-video overflow-hidden rounded-lg bg-muted/20 flex-shrink-0">
                        <Image
                          src={related.thumbnail || "/bg-pattern.png"}
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
                          {related.author?.name || video.author?.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{related.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No related videos found.</p>
                )}

                {/* Back to Resources Link */}
                <div className="pt-4 border-t mt-4">
                  <Button asChild variant="outline" className="w-full rounded-sm justify-start" size="sm">
                    <Link href={`/resources/${video.resource.slug}`}>
                      <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                      All {video.resource.name} Videos
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
                  href={`/videos/${related.slug}`}
                  className="group flex gap-3 cursor-pointer"
                >
                  <div className="relative w-32 aspect-video overflow-hidden rounded-lg bg-muted/20 flex-shrink-0">
                    <Image
                      src={related.thumbnail || "/bg-pattern.png"}
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
                      <span>{related.views.toLocaleString()} views</span>
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
          <h2 className="text-3xl font-bold mb-4">Want More {video.resource.name} Content?</h2>
          <p className="text-muted-foreground mb-6">
            Explore more videos, courses, and tutorials
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-sm">
              <Link href={`/resources/${video.resource.slug}`}>
                <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                Browse {video.resource.name} Resources
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
