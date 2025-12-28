import { Metadata } from "next";
import { caller } from "@/src/lib/trpc/server";
import { VideosContent } from "./videos-content";

export const metadata: Metadata = {
  title: "Videos | Sean Filimon",
  description:
    "Video tutorials, walkthroughs, and deep dives into software engineering concepts, Next.js, and modern web development.",
  openGraph: {
    title: "Videos | Sean Filimon",
    description:
      "Video tutorials, walkthroughs, and deep dives into software engineering concepts, Next.js, and modern web development.",
  },
};

async function getVideosData() {
  try {
    const videosResult = await caller.video.list({
      status: "PUBLISHED",
      limit: 100,
    });

    return {
      videos: videosResult.videos,
    };
  } catch (error) {
    console.error("Error fetching videos data:", error);
    return {
      videos: [],
    };
  }
}

export default async function VideosPage() {
  const { videos } = await getVideosData();

  return <VideosContent videos={videos} />;
}
