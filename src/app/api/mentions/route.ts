/**
 * Mentions API Route
 * Searches for mentionable items (resources, categories, blogs, articles)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/lib/db";

export interface MentionItem {
  id: string;
  type: "resource" | "category" | "blog" | "article";
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  color?: string;
}

export interface MentionsResponse {
  items: MentionItem[];
}

/**
 * GET handler for searching mentionable items
 * Query params:
 * - q: search query (required)
 * - type: filter by type (optional, default: "all")
 * - limit: max results per type (optional, default: 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 10);

    if (!query || query.length < 1) {
      return NextResponse.json({ items: [] });
    }

    const items: MentionItem[] = [];

    // Search resources
    if (type === "all" || type === "resource") {
      const resources = await db.resource.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          iconUrl: true,
          color: true,
        },
      });

      items.push(
        ...resources.map((r) => ({
          id: r.id,
          type: "resource" as const,
          name: r.name,
          description: r.description || undefined,
          icon: r.icon || undefined,
          iconUrl: r.iconUrl || undefined,
          color: r.color || undefined,
        }))
      );
    }

    // Search categories
    if (type === "all" || type === "category") {
      const categories = await db.contentCategory.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
        },
      });

      items.push(
        ...categories.map((c) => ({
          id: c.id,
          type: "category" as const,
          name: c.name,
          description: c.description || undefined,
          color: c.color || undefined,
        }))
      );
    }

    // Search blogs
    if (type === "all" || type === "blog") {
      const blogs = await db.blog.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          title: true,
          excerpt: true,
          status: true,
        },
      });

      items.push(
        ...blogs.map((b) => ({
          id: b.id,
          type: "blog" as const,
          name: b.title,
          description: b.excerpt || undefined,
          icon: b.status === "PUBLISHED" ? "📝" : "📄",
        }))
      );
    }

    // Search articles
    if (type === "all" || type === "article") {
      const articles = await db.article.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          title: true,
          excerpt: true,
          status: true,
        },
      });

      items.push(
        ...articles.map((a) => ({
          id: a.id,
          type: "article" as const,
          name: a.title,
          description: a.excerpt || undefined,
          icon: a.status === "PUBLISHED" ? "📰" : "📋",
        }))
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Mentions API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
