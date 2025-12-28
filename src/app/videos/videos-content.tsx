"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  IoSearchOutline,
  IoPlayCircleOutline,
  IoVideocamOutline,
} from "react-icons/io5";
import { Badge } from "@/components/ui/badge";

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  duration: string | null;
  views: number;
  likes: number;
  publishedAt: Date | null;
  createdAt: Date;
  resource: { id: string; name: string; slug: string; icon: string; color: string } | null;
  tags: { id: string; name: string }[];
  author: { id: string; name: string | null; image: string | null } | null;
}

interface VideosContentProps {
  videos: Video[];
}

function formatDate(date: Date | null): string {
  if (!date) return "Unknown date";
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

export function VideosContent({ videos }: VideosContentProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      searchTerm === "" ||
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      video.tags.some((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".video-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".videos-container",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [searchTerm]);

  return (
    <div className="min-h-screen py-12 px-4" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Videos</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Video tutorials, walkthroughs, and deep dives into software engineering concepts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative max-w-xl">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        {/* Videos Count */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Videos</h2>
          <span className="text-sm text-muted-foreground">
            {filteredVideos.length} {filteredVideos.length === 1 ? "video" : "videos"}
          </span>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <IoVideocamOutline className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {videos.length === 0
                ? "No videos published yet. Check back soon!"
                : "No videos found matching your criteria."}
            </p>
          </div>
        ) : (
          <div className="videos-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.slug}`}
                className="video-card group flex flex-col gap-3 cursor-pointer select-none"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <IoPlayCircleOutline className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 z-20">
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-black/80 text-white rounded-[2px]">
                        {video.duration}
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[1px]">
                    <div className="bg-primary rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <IoPlayCircleOutline className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatViews(video.views)} views</span>
                    <span>•</span>
                    <span>{formatDate(video.publishedAt || video.createdAt)}</span>
                  </div>

                  {video.resource && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs font-normal">
                        {video.resource.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
