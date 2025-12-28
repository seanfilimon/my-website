import { MetadataRoute } from "next";
import { db } from "@/src/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://seanfilimon.com";

  // 1. Base Static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/portfolio",
    "/resources",
    "/articles",
    "/blogs",
    "/github",
    "/templates",
    // Resource sub-pages
    "/resources/articles",
    "/resources/blogs",
    "/resources/browse",
    "/resources/series",
    "/resources/tutorials",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.9,
  }));

  // 2. Hardcoded Content (Content not yet in DB or hybrid)
  const hardcodedRoutes = [
    // Portfolio Projects
    "/portfolio/project/react-ui-pro",
    // Courses
    "/courses/nextjs-masterclass",
    // Videos
    "/videos/building-saas-from-scratch",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  try {
    // 3. Dynamic Content from Database

    // Articles
    const articles = await db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const articleRoutes = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Blogs
    const blogs = await db.blog.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Resources (Frameworks, Libraries, etc.)
    // We include ALL resources regardless of content count
    const resources = await db.resource.findMany({
      select: { slug: true, updatedAt: true },
    });

    const resourceRoutes = resources.map((resource) => ({
      url: `${baseUrl}/resources/${resource.slug}`,
      lastModified: resource.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Dynamic Courses (if any exist in DB)
    const courses = await db.course.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const courseRoutes = courses
      .filter((c) => c.slug !== "nextjs-masterclass") // Avoid duplicate with hardcoded
      .map((course) => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    // Dynamic Videos (if any exist in DB)
    const videos = await db.video.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const videoRoutes = videos
      .filter((v) => v.slug !== "building-saas-from-scratch") // Avoid duplicate with hardcoded
      .map((video) => ({
        url: `${baseUrl}/videos/${video.slug}`,
        lastModified: video.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [
      ...staticRoutes,
      ...hardcodedRoutes,
      ...articleRoutes,
      ...blogRoutes,
      ...resourceRoutes,
      ...courseRoutes,
      ...videoRoutes,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static and hardcoded routes if DB fails
    return [...staticRoutes, ...hardcodedRoutes];
  }
}
