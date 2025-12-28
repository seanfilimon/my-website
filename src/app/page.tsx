import HeroSlideshowWithData from "@/src/components/home/hero-slideshow-with-data";
import {
  ServicesSection,
  LatestVideos,
  FeaturedWork,
  QuickAbout,
} from "@/src/components/pages/landing";
import { db } from "@/src/lib/db";
import type { Metadata } from "next";

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  description:
    "Full-stack developer, founder, and content creator helping build the future of software engineers. Specialized in Next.js, React, and modern web technologies.",
  alternates: {
    canonical: "/",
  },
};

// ============================================================================
// Server-side data fetching functions
// ============================================================================

/**
 * Format view count for display
 */
function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

/**
 * Format date period for display
 */
function formatPeriod(startDate: Date | null, endDate: Date | null): string {
  if (!startDate) return "Present";

  const start = new Date(startDate);
  const startYear = start.getFullYear();

  if (!endDate) {
    return `${startYear} - Present`;
  }

  const end = new Date(endDate);
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    return startYear.toString();
  }

  return `${startYear} - ${endYear}`;
}

/**
 * Get hero data for the slideshow
 */
async function getHeroData() {
  // Fetch latest blog
  const latestBlog = await db.blog.findFirst({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      resource: {
        select: {
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
    },
  });

  // Fetch latest/featured course
  const featuredCourse = await db.course.findFirst({
    where: {
      status: "PUBLISHED",
      featured: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      instructor: {
        select: {
          name: true,
          image: true,
        },
      },
      resource: {
        select: {
          name: true,
          slug: true,
        },
      },
      enrolledUsers: {
        select: {
          id: true,
        },
      },
    },
  });

  // Fetch featured project (experience)
  const featuredProject = await db.experience.findFirst({
    where: {
      type: "PROJECT",
      featured: true,
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      technologies: {
        select: {
          name: true,
        },
      },
      metrics: {
        select: {
          label: true,
          value: true,
        },
      },
    },
  });

  // Fetch latest video
  const latestVideo = await db.video.findFirst({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      resource: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  // Get statistics
  const stats = await Promise.all([
    db.experience.count({ where: { type: "PROJECT", published: true } }),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.blog.count({ where: { status: "PUBLISHED" } }),
    db.courseEnrollment.count(),
  ]);

  // Get user profile
  const profile = await db.user.findFirst({
    where: {
      role: "ADMIN",
    },
    select: {
      name: true,
      title: true,
      bio: true,
      image: true,
    },
  });

  return {
    profile,
    latestBlog,
    featuredCourse,
    featuredProject,
    latestVideo,
    stats: {
      projects: stats[0],
      articles: stats[1] + stats[2],
      students: stats[3],
      githubStars: "5K+",
    },
  };
}

/**
 * Get featured experiences for the Featured Work section
 */
async function getFeaturedExperiences(limit = 4) {
  const experiences = await db.experience.findMany({
    where: {
      published: true,
      type: {
        in: ["WORK", "PROJECT"],
      },
    },
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      subtitle: true,
      description: true,
      organization: true,
      organizationUrl: true,
      thumbnail: true,
      coverImage: true,
      startDate: true,
      endDate: true,
      status: true,
      type: true,
      projectUrl: true,
      tags: {
        select: {
          name: true,
        },
      },
    },
  });

  return experiences.map((exp) => ({
    id: exp.id,
    company: exp.organization || exp.title,
    position: exp.subtitle || exp.title,
    description: exp.description,
    websiteUrl: exp.organizationUrl || exp.projectUrl,
    image: exp.thumbnail || exp.coverImage,
    isIframe: !!exp.organizationUrl,
    period: formatPeriod(exp.startDate, exp.endDate),
    type:
      exp.status === "CURRENT"
        ? "Current"
        : exp.type === "PROJECT"
          ? "Project"
          : "Past",
    tags: exp.tags.map((t) => t.name),
    links: {
      live: exp.organizationUrl || exp.projectUrl,
      case_study: "/about",
    },
  }));
}

/**
 * Get latest videos for the Latest Videos section
 */
async function getLatestVideos(limit = 5) {
  const videos = await db.video.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      duration: true,
      views: true,
      publishedAt: true,
    },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    thumbnail: v.thumbnail || "/bg-pattern.png",
    duration: v.duration || "0:00",
    views: formatViews(v.views),
    publishedAt: v.publishedAt,
    href: `/videos/${v.slug}`,
  }));
}

/**
 * Normalize image path - strip localhost URLs and ensure valid path
 */
function normalizeImagePath(
  imagePath: string | null | undefined,
  defaultPath: string,
): string {
  if (!imagePath) return defaultPath;

  // Strip localhost URLs (e.g., http://localhost:3000/me.jpg -> /me.jpg)
  if (imagePath.includes("localhost")) {
    try {
      const url = new URL(imagePath);
      return url.pathname;
    } catch {
      return defaultPath;
    }
  }

  // If it's a relative path starting with /, use it directly
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  // If it's an external URL (https://), use it as-is
  if (imagePath.startsWith("https://")) {
    return imagePath;
  }

  return defaultPath;
}

/**
 * Get recent articles for the Services section
 */
async function getRecentArticles(limit = 6) {
  const articles = await db.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      readTime: true,
      publishedAt: true,
      resource: {
        select: {
          name: true,
        },
      },
    },
  });

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    category: article.resource?.name || "Article",
    thumbnail: article.thumbnail || "/bg-pattern.png",
    readTime: article.readTime ? `${article.readTime} min read` : "5 min read",
    publishedAt: article.publishedAt,
    href: `/articles/${article.slug}`,
  }));
}

/**
 * Get profile data for the Quick About section
 */
async function getProfile() {
  const profile = await db.user.findFirst({
    where: {
      role: "ADMIN",
    },
    select: {
      name: true,
      title: true,
      bio: true,
      image: true,
    },
  });

  return {
    name: profile?.name || "Sean Filimon",
    title: profile?.title || "Full Stack Developer",
    bio:
      profile?.bio ||
      "Building tools and sharing knowledge that helps developers create better software, faster.",
    image: normalizeImagePath(profile?.image, "/me.jpg"),
    location: "I travel a lot", // Default location since User model doesn't have location field
  };
}

// ============================================================================
// Page Component (Server Component)
// ============================================================================

export default async function Home() {
  // Fetch all data in parallel for optimal performance
  const [heroData, experiences, videos, profile, articles] = await Promise.all([
    getHeroData(),
    getFeaturedExperiences(),
    getLatestVideos(),
    getProfile(),
    getRecentArticles(),
  ]);

  return (
    <>
      <HeroSlideshowWithData data={heroData} />
      <ServicesSection articles={articles} />
      <LatestVideos videos={videos} />
      <FeaturedWork experiences={experiences} />
      <QuickAbout profile={profile} />
    </>
  );
}
