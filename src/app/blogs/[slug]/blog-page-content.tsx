"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { InlineBlogEditor } from "@/components/blog/inline-blog-editor";
import { BlogEnhanceDrawer } from "@/components/blog/blog-enhance-drawer";
import { useIsAdmin } from "@/src/lib/hooks/use-is-admin";
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoChevronForwardOutline,
  IoCalendarOutline,
  IoEyeOutline,
  IoShareSocialOutline,
  IoPencilOutline,
  IoSparklesOutline,
} from "react-icons/io5";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string | null;
  coverImage: string | null;
  readTime: string;
  views: number;
  likes: number;
  publishedAt: Date | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
  } | null;
  resource: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{ id: string; name: string; slug: string }>;
}

interface BlogPageContentProps {
  blog: Blog;
}

export function BlogPageContent({ blog }: BlogPageContentProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentContent, setCurrentContent] = useState(blog.content);

  // Handle save from inline editor
  const handleSave = useCallback((newContent: string) => {
    setCurrentContent(newContent);
    setIsEditing(false);
    // Refresh the page to show updated content
    router.refresh();
  }, [router]);

  // Handle content update from enhancement
  const handleEnhanceUpdate = useCallback((newContent: string) => {
    setCurrentContent(newContent);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".blog-hero",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
        delay: 0.2,
      }
    );

    gsap.fromTo(
      ".blog-content",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".blog-content",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main ref={sectionRef} className="min-h-screen">
      {/* Header Section */}
      <section className="relative py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/50 via-background to-muted/30 border-b">
        <div className="max-w-4xl mx-auto">
          {/* Back Button & Breadcrumb */}
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="ghost" size="sm" className="rounded-sm -ml-2">
              <Link
                href={blog.resource ? `/resources/${blog.resource.slug}` : "/blogs"}
                className="flex items-center gap-2"
              >
                <IoArrowForwardOutline className="h-4 w-4 rotate-180" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              {/* Admin Buttons */}
              {isAdmin && !isEditing && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm gap-2"
                    onClick={() => setIsEnhancing(true)}
                  >
                    <IoSparklesOutline className="h-4 w-4" />
                    Enhance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <IoPencilOutline className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href="/blogs" className="hover:text-foreground transition-colors">
                Blogs
              </Link>
              {blog.resource && (
                <>
                  <IoChevronForwardOutline className="h-3 w-3" />
                  <Link
                    href={`/resources/${blog.resource.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {blog.resource.name}
                  </Link>
                </>
              )}
              </div>
            </div>
          </div>

          {/* Blog Header */}
          <div className="blog-hero">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {blog.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs font-medium rounded-sm bg-primary/10 text-primary"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">{blog.title}</h1>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {blog.author && (
                <span className="font-medium text-foreground">{blog.author.name}</span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoCalendarOutline className="h-3.5 w-3.5" />
                {formatDate(blog.publishedAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoTimeOutline className="h-3.5 w-3.5" />
                {blog.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoEyeOutline className="h-3.5 w-3.5" />
                {blog.views.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <article className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {(blog.coverImage || blog.thumbnail) && !isEditing && (
            <div className="blog-content relative aspect-video w-full overflow-hidden rounded-lg border mb-8">
              <Image
                src={blog.coverImage || blog.thumbnail || ""}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Blog Content - Show editor or markdown */}
          {isEditing ? (
            <InlineBlogEditor
              blogId={blog.id}
              initialContent={currentContent}
              onClose={() => setIsEditing(false)}
              onSave={handleSave}
            />
          ) : (
            <div className="blog-content">
              <Markdown content={currentContent} />
            </div>
          )}

          {/* Tags & Share - Hide when editing */}
          {!isEditing && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="px-2 py-1 text-xs border rounded-sm hover:bg-accent transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="rounded-sm">
                  <IoShareSocialOutline className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Bottom CTA - Hide when editing */}
      {blog.resource && !isEditing && (
        <section className="border-t bg-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Explore More {blog.resource.name} Content
            </h2>
            <p className="text-muted-foreground mb-6">
              Discover more blogs, articles, and courses about {blog.resource.name}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-sm">
                <Link href={`/resources/${blog.resource.slug}`}>
                  <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                  Browse {blog.resource.name} Resources
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Blog Enhancement Drawer */}
      {isAdmin && (
        <BlogEnhanceDrawer
          open={isEnhancing}
          onOpenChange={setIsEnhancing}
          blogId={blog.id}
          currentContent={currentContent}
          onContentUpdate={handleEnhanceUpdate}
        />
      )}
    </main>
  );
}
