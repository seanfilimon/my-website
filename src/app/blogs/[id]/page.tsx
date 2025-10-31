"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoEyeOutline,
  IoChatbubbleOutline,
  IoShareSocialOutline
} from "react-icons/io5";

// Mock blog data - in production, fetch from API/database
const getBlogData = (id: string) => {
  const blogs: Record<string, any> = {
    "migrated-to-nextjs-16": {
      id: "migrated-to-nextjs-16",
      title: "Why I Migrated to Next.js 16",
      excerpt: "My experience migrating a large production app to the latest Next.js",
      framework: "nextjs",
      frameworkName: "Next.js",
      thumbnail: "/bg-pattern.png",
      author: "Sean Filimon",
      authorTitle: "Founder & CEO at LegionEdge",
      publishedAt: "October 28, 2024",
      readTime: "6 min read",
      views: "1,234",
      tags: ["Next.js", "Migration", "React", "Web Development"],
      content: (
        <>
          <p>After months of deliberation, I finally decided to migrate our production application to Next.js 16. Here's why and what I learned along the way.</p>

          <h2>The Decision</h2>
          <p>Our application was running on Next.js 14, and while it worked well, the new features in Next.js 16 were too compelling to ignore. Server Components, the improved App Router, and better performance were the main drivers.</p>

          <h2>The Migration Process</h2>
          <p>The migration wasn't without challenges. We had to refactor several components, update our data fetching patterns, and rethink how we structured our application. But the results were worth it.</p>

          <h2>Key Benefits</h2>
          <ul>
            <li>40% faster page loads with Server Components</li>
            <li>Better SEO with improved metadata handling</li>
            <li>Cleaner code with the new routing patterns</li>
            <li>Reduced bundle size by 25%</li>
          </ul>

          <h2>Lessons Learned</h2>
          <p>Start small, test thoroughly, and don't rush the migration. Having a solid testing strategy saved us from several potential production issues.</p>

          <h2>Conclusion</h2>
          <p>Would I do it again? Absolutely. Next.js 16 has made our codebase more maintainable and our application faster. If you're considering the upgrade, I highly recommend it.</p>
        </>
      ),
      relatedPosts: [
        {
          id: "nextjs-at-scale",
          title: "Next.js at Scale: Lessons Learned",
          excerpt: "What I learned building and scaling Next.js apps for 100K+ users",
          readTime: "8 min read",
          href: "/blogs/nextjs-at-scale"
        },
        {
          id: "nextjs-starter",
          title: "My Next.js Starter Template",
          excerpt: "The boilerplate I use to start every new Next.js project",
          readTime: "5 min read",
          href: "/blogs/nextjs-starter-template"
        }
      ]
    }
  };

  return blogs[id] || null;
};

export default function BlogPage() {
  const params = useParams();
  const blogId = params.id as string;
  const blog = getBlogData(blogId);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero animation
    gsap.fromTo(
      ".blog-hero",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      }
    );

    // Content animation
    gsap.fromTo(
      ".blog-content",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".blog-content",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/resources">Back to Resources</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main ref={sectionRef} className="min-h-screen">
      {/* Compact Header Section */}
      <section className="relative py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/50 via-background to-muted/30 border-b">
        <div className="max-w-4xl mx-auto">
          {/* Back Button & Breadcrumb in one line */}
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="ghost" size="sm" className="rounded-sm -ml-2">
              <Link href={`/resources/${blog.framework}`} className="flex items-center gap-2">
                <IoArrowForwardOutline className="h-4 w-4 rotate-180" />
                <span className="hidden sm:inline">Back to Resources</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href={`/resources/${blog.framework}`} className="hover:text-foreground transition-colors">{blog.frameworkName}</Link>
            </div>
          </div>

          {/* Compact Blog Header */}
          <div className="blog-hero">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {blog.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded-sm bg-primary/10 text-primary">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {blog.title}
            </h1>

            {/* Author & Meta - Single Line */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{blog.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoCalendarOutline className="h-3.5 w-3.5" />
                {blog.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoTimeOutline className="h-3.5 w-3.5" />
                {blog.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoEyeOutline className="h-3.5 w-3.5" />
                {blog.views}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <article className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          <div className="blog-content relative aspect-video w-full overflow-hidden rounded-lg border mb-8">
            <Image
              src={blog.thumbnail}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Blog Content */}
          <div className="blog-content prose prose-gray dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-base prose-p:leading-7 prose-p:mb-4
            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-li:text-base prose-li:leading-7 prose-li:mb-2
            prose-strong:font-semibold prose-strong:text-foreground
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto">
            {blog.content}
          </div>

          {/* Tags & Share */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string) => (
                  <Link 
                    key={tag}
                    href={`/tags/${tag.toLowerCase()}`}
                    className="px-2 py-1 text-xs border rounded-sm hover:bg-accent transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-sm">
                  <IoShareSocialOutline className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="rounded-sm">
                  <IoChatbubbleOutline className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {blog.relatedPosts && blog.relatedPosts.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Related Posts</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {blog.relatedPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={post.href}
                  className="group flex flex-col p-6 rounded-lg border bg-card hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                    <IoTimeOutline className="h-3.5 w-3.5" />
                    {post.readTime}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="border-t bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Explore More {blog.frameworkName} Content</h2>
          <p className="text-muted-foreground mb-6">
            Discover more blogs, articles, and courses about {blog.frameworkName}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-sm">
              <Link href={`/resources/${blog.framework}`}>
                <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                Browse {blog.frameworkName} Resources
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-sm">
              <Link href={`/resources/${blog.framework}#blogs`}>
                More {blog.frameworkName} Blogs
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

