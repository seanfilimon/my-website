import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "../init";
import { db } from "@/src/lib/db";

/**
 * Home Router
 * Provides aggregated data for the landing page components
 */
export const homeRouter = createTRPCRouter({
  /**
   * Get hero data for the slideshow
   * Aggregates latest blog, featured course, featured project, latest video, and stats
   */
  getHeroData: publicProcedure.query(async () => {
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
        articles: stats[1] + stats[2], // Combine articles and blogs
        students: stats[3],
        githubStars: "5K+", // This would come from GitHub API
      },
    };
  }),

  /**
   * Get recent articles for the Services Section
   * Returns the 6 most recent published articles/blogs
   */
  getRecentArticles: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(6),
    }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 6;

      // Fetch recent articles
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
          excerpt: true,
          thumbnail: true,
          readTime: true,
          publishedAt: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      // Fetch recent blogs
      const blogs = await db.blog.findMany({
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
          excerpt: true,
          thumbnail: true,
          readTime: true,
          publishedAt: true,
          resource: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      // Combine and sort by publishedAt
      const combined = [
        ...articles.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          thumbnail: a.thumbnail,
          readTime: a.readTime,
          publishedAt: a.publishedAt,
          category: a.category?.name || "Article",
          href: `/articles/${a.slug}`,
        })),
        ...blogs.map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          excerpt: b.excerpt,
          thumbnail: b.thumbnail,
          readTime: b.readTime,
          publishedAt: b.publishedAt,
          category: b.resource?.name || "Blog",
          href: `/blogs/${b.slug}`,
        })),
      ]
        .sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, limit);

      return combined;
    }),

  /**
   * Get latest videos for the Latest Videos section
   * Returns the 5 most recent published videos
   */
  getLatestVideos: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(5),
    }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 5;

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
    }),

  /**
   * Get featured experiences for the Featured Work section
   * Returns experiences ordered by date
   */
  getFeaturedExperiences: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(4),
    }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 4;

      const experiences = await db.experience.findMany({
        where: {
          published: true,
          type: {
            in: ["WORK", "PROJECT"],
          },
        },
        orderBy: [
          { status: "asc" }, // CURRENT first
          { startDate: "desc" },
        ],
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
        type: exp.status === "CURRENT" ? "Current" : exp.type === "PROJECT" ? "Project" : "Past",
        tags: exp.tags.map((t) => t.name),
        links: {
          live: exp.organizationUrl || exp.projectUrl,
          case_study: "/about",
        },
      }));
    }),

  /**
   * Get profile data for the Quick About section
   */
  getProfile: publicProcedure.query(async () => {
    const profile = await db.user.findFirst({
      where: {
        role: "ADMIN",
      },
      select: {
        name: true,
        title: true,
        bio: true,
        image: true,
        location: true,
      },
    });

    return {
      name: profile?.name || "Sean Filimon",
      title: profile?.title || "Full Stack Developer",
      bio: profile?.bio || "Building tools and sharing knowledge that helps developers create better software, faster.",
      image: profile?.image || "/me.jpg",
      location: profile?.location || "I travel a lot",
    };
  }),

  /**
   * Get site statistics
   */
  getStats: publicProcedure.query(async () => {
    const [projects, articles, blogs, students, videos] = await Promise.all([
      db.experience.count({ where: { type: "PROJECT", published: true } }),
      db.article.count({ where: { status: "PUBLISHED" } }),
      db.blog.count({ where: { status: "PUBLISHED" } }),
      db.courseEnrollment.count(),
      db.video.count({ where: { status: "PUBLISHED" } }),
    ]);

    return {
      projects,
      articles: articles + blogs,
      students,
      videos,
      githubStars: "5K+", // This would come from GitHub API
    };
  }),
});

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
 * Format relative time for display
 */
function formatRelativeTime(date: Date | null): string {
  if (!date) return "Recently";
  
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}



