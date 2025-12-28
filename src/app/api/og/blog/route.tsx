/**
 * Blog OG Image API Route
 * On-demand OG image generation for blog posts
 * 
 * Usage: /api/og/blog?title=My%20Blog%20Title&excerpt=Optional%20excerpt&series=Series%20Name&chapter=Chapter%201
 */
import { NextRequest } from "next/server";
import { generateBlogOGImage } from "@/src/lib/og/generate-blog-og";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get("title");
    const excerpt = searchParams.get("excerpt") || undefined;
    const authorName = searchParams.get("author") || undefined;
    const seriesName = searchParams.get("series") || undefined;
    const chapterNumber = searchParams.get("chapter") || undefined;
    const readTime = searchParams.get("readTime") || undefined;
    const publishDate = searchParams.get("date") || undefined;
    const resourceIcon = searchParams.get("resourceIcon") || undefined;
    const resourceEmoji = searchParams.get("resourceEmoji") || undefined;
    const resourceName = searchParams.get("resourceName") || undefined;

    // Extract OG style parameters
    const ogBackgroundColor = searchParams.get("ogBackgroundColor") || undefined;
    const ogBorderColor = searchParams.get("ogBorderColor") || undefined;
    const ogTextPrimary = searchParams.get("ogTextPrimary") || undefined;
    const ogTextSecondary = searchParams.get("ogTextSecondary") || undefined;
    const ogAccentStart = searchParams.get("ogAccentStart") || undefined;
    const ogAccentEnd = searchParams.get("ogAccentEnd") || undefined;
    const ogResourceBgColor = searchParams.get("ogResourceBgColor") || undefined;
    const ogFontWeight = searchParams.get("ogFontWeight") ? parseInt(searchParams.get("ogFontWeight")!) : undefined;
    const ogBorderWidth = searchParams.get("ogBorderWidth") ? parseInt(searchParams.get("ogBorderWidth")!) : undefined;

    if (!title) {
      return new Response("Missing required parameter: title", { status: 400 });
    }

    // Generate and return the OG image
    return generateBlogOGImage({
      title: decodeURIComponent(title),
      excerpt: excerpt ? decodeURIComponent(excerpt) : undefined,
      authorName: authorName ? decodeURIComponent(authorName) : undefined,
      seriesName: seriesName ? decodeURIComponent(seriesName) : undefined,
      chapterNumber: chapterNumber ? decodeURIComponent(chapterNumber) : undefined,
      readTime: readTime ? decodeURIComponent(readTime) : undefined,
      publishDate: publishDate ? decodeURIComponent(publishDate) : undefined,
      resourceIcon: resourceIcon ? decodeURIComponent(resourceIcon) : undefined,
      resourceEmoji: resourceEmoji ? decodeURIComponent(resourceEmoji) : undefined,
      resourceName: resourceName ? decodeURIComponent(resourceName) : undefined,
      ogStyles: ogBackgroundColor || ogBorderColor || ogTextPrimary || ogTextSecondary || ogAccentStart || ogAccentEnd || ogResourceBgColor || ogFontWeight || ogBorderWidth ? {
        backgroundColor: ogBackgroundColor,
        borderColor: ogBorderColor,
        textPrimary: ogTextPrimary,
        textSecondary: ogTextSecondary,
        accentStart: ogAccentStart,
        accentEnd: ogAccentEnd,
        resourceBgColor: ogResourceBgColor,
        fontWeight: ogFontWeight,
        borderWidth: ogBorderWidth,
      } : undefined,
    });
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}

