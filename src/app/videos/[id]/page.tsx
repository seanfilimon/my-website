import { notFound } from "next/navigation";
import { caller } from "@/src/lib/trpc/server";
import { VideoContent } from "./video-content";

// Hardcoded fallback data for specific videos
const HARDCODED_VIDEOS: Record<string, any> = {
  "building-saas-from-scratch": {
    id: "building-saas-from-scratch",
    title: "Building a SaaS from Scratch",
    description:
      "Complete walkthrough of building a production-ready SaaS application with Next.js, Prisma, and Stripe",
    thumbnail: "/bg-pattern.png",
    videoUrl: "https://youtube.com/watch?v=example",
    duration: "24:15",
    views: 12500,
    likes: 1200,
    publishedAt: new Date("2024-10-26"),
    author: {
      name: "Sean Filimon",
      title: "Founder & CEO at LegionEdge",
      image: null,
    },
    resource: {
      name: "Next.js",
      slug: "nextjs",
    },
    tags: ["Next.js", "SaaS", "Full Stack", "Stripe", "Prisma"],
    chapters: [
      { title: "Introduction", time: "0:00" },
      { title: "Project Setup", time: "2:30" },
      { title: "Database Schema", time: "6:45" },
      { title: "Authentication", time: "11:20" },
      { title: "Stripe Integration", time: "16:40" },
      { title: "Deployment", time: "21:00" },
    ],
    resources: [
      { name: "GitHub Repository", url: "https://github.com/example/saas" },
      { name: "Starter Template", url: "https://example.com/template" },
      { name: "Documentation", url: "https://docs.example.com" },
    ],
    relatedVideos: [
      {
        id: "nextjs-16-features",
        title: "Next.js 16 New Features",
        thumbnail: "/bg-pattern.png",
        duration: "18:42",
        views: 8200,
        slug: "nextjs-16-features",
        author: { name: "Sean Filimon" },
      },
      {
        id: "advanced-gsap",
        title: "Advanced GSAP Animations",
        thumbnail: "/bg-pattern.png",
        duration: "32:08",
        views: 15300,
        slug: "advanced-gsap-animations",
        author: { name: "Sean Filimon" },
      },
    ],
  },
};

async function getVideoData(idOrSlug: string) {
  // 1. Try fetching from Database
  try {
    let video: any = null;

    // Try fetching by slug first
    try {
      video = await caller.video.bySlug({ slug: idOrSlug });
    } catch {
      // If slug fails, try fetching by ID
      try {
        video = await caller.video.byId({ id: idOrSlug });
      } catch {
        // Both failed
      }
    }

    if (video) {
      // Map DB response to expected VideoData format
      return {
        ...video,
        author: video.author
          ? {
              name: video.author.name,
              title: video.author.title || video.author.bio || "Author",
              image: video.author.image,
            }
          : null,
        // Ensure tags are in expected format (DB returns object array)
        tags: video.tags || [],
        // Default related videos if not present in DB response
        relatedVideos: [],
      };
    }
  } catch (error) {
    console.error("Error fetching video from DB:", error);
  }

  // 2. Fallback to Hardcoded Data
  return HARDCODED_VIDEOS[idOrSlug] || null;
}

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  const video = await getVideoData(id);

  if (!video) {
    notFound();
  }

  return <VideoContent video={video} />;
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = await params;
  const video = await getVideoData(id);

  if (!video) {
    return {
      title: "Video Not Found",
    };
  }

  return {
    title: `${video.title} | Sean Filimon`,
    description: video.description,
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      images: video.thumbnail ? [{ url: video.thumbnail }] : [],
    },
  };
}
