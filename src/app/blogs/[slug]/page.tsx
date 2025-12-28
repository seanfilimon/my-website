import { notFound } from "next/navigation";
import { caller } from "@/src/lib/trpc/server";
import { BlogPageContent } from "./blog-page-content";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogData(idOrSlug: string) {
  try {
    const blog = await caller.blog.bySlug({ slug: idOrSlug });
    return blog;
  } catch (error) {
    try {
      const blog = await caller.blog.byId({ id: idOrSlug });
      return blog;
    } catch {
      return null;
    }
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogData(slug);

  if (!blog) {
    notFound();
  }

  return <BlogPageContent blog={blog} />;
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogData(slug);

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  // Build OG image URL with all available params
  const buildOgUrl = () => {
    const params = new URLSearchParams();
    params.set("title", blog.title);
    if (blog.excerpt) params.set("excerpt", blog.excerpt);
    if (blog.readTime) params.set("readTime", blog.readTime);
    if (blog.publishedAt) {
      params.set(
        "date",
        new Date(blog.publishedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      );
    }
    // Include resource info if blog is attached to a resource
    if (blog.resource) {
      // Use iconUrl (image URL) if available, otherwise use icon (emoji)
      if (blog.resource.iconUrl)
        params.set("resourceIcon", blog.resource.iconUrl);
      else if (blog.resource.icon)
        params.set("resourceEmoji", blog.resource.icon);
      if (blog.resource.name) params.set("resourceName", blog.resource.name);

      // Add resource OG styles if customized
      if (blog.resource.ogBackgroundColor)
        params.set("ogBackgroundColor", blog.resource.ogBackgroundColor);
      if (blog.resource.ogBorderColor)
        params.set("ogBorderColor", blog.resource.ogBorderColor);
      if (blog.resource.ogTextPrimary)
        params.set("ogTextPrimary", blog.resource.ogTextPrimary);
      if (blog.resource.ogTextSecondary)
        params.set("ogTextSecondary", blog.resource.ogTextSecondary);
      if (blog.resource.ogAccentStart)
        params.set("ogAccentStart", blog.resource.ogAccentStart);
      if (blog.resource.ogAccentEnd)
        params.set("ogAccentEnd", blog.resource.ogAccentEnd);
      if (blog.resource.ogResourceBgColor)
        params.set("ogResourceBgColor", blog.resource.ogResourceBgColor);
      if (blog.resource.ogFontWeight)
        params.set("ogFontWeight", blog.resource.ogFontWeight.toString());
      if (blog.resource.ogBorderWidth)
        params.set("ogBorderWidth", blog.resource.ogBorderWidth.toString());
    }
    return `/api/og/blog?${params.toString()}`;
  };

  // Use uploaded thumbnail or fall back to on-demand OG generation
  const ogImage = blog.thumbnail || buildOgUrl();

  return {
    title: `${blog.title} | Sean Filimon`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [ogImage],
    },
  };
}
