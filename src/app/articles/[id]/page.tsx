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
  IoBookmarkOutline,
  IoShareSocialOutline
} from "react-icons/io5";

// Mock article data
const getArticleData = (id: string) => {
  const articles: Record<string, any> = {
    "nextjs-app-router": {
      id: "nextjs-app-router",
      title: "Understanding Next.js App Router",
      excerpt: "Deep dive into the new App Router and how it changes the way we build Next.js applications",
      framework: "nextjs",
      frameworkName: "Next.js",
      category: "Tutorial",
      thumbnail: "/bg-pattern.png",
      author: "Sean Filimon",
      publishedAt: "October 27, 2024",
      readTime: "8 min read",
      views: "3,456",
      difficulty: "Intermediate",
      tags: ["Next.js", "App Router", "React", "Routing"],
      content: (
        <>
          <p>The App Router is one of the most significant changes in Next.js 13+ and has been refined in Next.js 16. Let's explore how it works and why it matters.</p>

          <h2>What is the App Router?</h2>
          <p>The App Router is a new paradigm for building Next.js applications. It introduces Server Components by default, nested layouts, and a more intuitive file system routing structure.</p>

          <h2>Key Concepts</h2>
          <h3>File-based Routing</h3>
          <p>Every folder in the app directory becomes a route. The page.tsx file defines the UI for that route.</p>

          <h3>Layouts</h3>
          <p>Layouts are shared UI that wrap pages. They persist across navigation and don't re-render.</p>

          <h3>Server Components</h3>
          <p>By default, all components are Server Components. This means they render on the server and stream to the client.</p>

          <h2>Migration from Pages Router</h2>
          <p>Migrating from the Pages Router requires understanding the new patterns. Start with simple pages and gradually move complex features.</p>

          <h2>Best Practices</h2>
          <ul>
            <li>Use Server Components by default</li>
            <li>Only use "use client" when necessary</li>
            <li>Leverage parallel and intercepting routes</li>
            <li>Implement proper error boundaries</li>
          </ul>

          <h2>Conclusion</h2>
          <p>The App Router represents the future of Next.js. While there's a learning curve, the benefits in performance and developer experience are worth it.</p>
        </>
      ),
      tableOfContents: [
        { title: "What is the App Router?", id: "what-is-app-router" },
        { title: "Key Concepts", id: "key-concepts" },
        { title: "Migration from Pages Router", id: "migration" },
        { title: "Best Practices", id: "best-practices" },
        { title: "Conclusion", id: "conclusion" }
      ],
      relatedArticles: [
        {
          id: "server-vs-client",
          title: "Server Components vs Client Components",
          excerpt: "Learn when to use each type of component",
          readTime: "10 min read",
          category: "Guide",
          href: "/articles/server-vs-client-components"
        },
        {
          id: "nextjs-performance",
          title: "Optimizing Next.js Performance",
          excerpt: "Best practices for fast applications",
          readTime: "12 min read",
          category: "Performance",
          href: "/articles/nextjs-performance"
        }
      ]
    }
  };

  return articles[id] || null;
};

export default function ArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  const article = getArticleData(articleId);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".article-hero",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="ghost" size="sm" className="rounded-sm -ml-2">
              <Link href={`/resources/${article.framework}`} className="flex items-center gap-2">
                <IoArrowForwardOutline className="h-4 w-4 rotate-180" />
                <span className="hidden sm:inline">Back to Resources</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link href={`/resources/${article.framework}`} className="hover:text-foreground transition-colors">{article.frameworkName}</Link>
            </div>
          </div>

          <div className="article-hero">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-xs font-medium rounded-sm bg-primary/10 text-primary">
                {article.category}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${
                article.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                article.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                'bg-purple-500/10 text-purple-700 dark:text-purple-400'
              }`}>
                {article.difficulty}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{article.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoCalendarOutline className="h-3.5 w-3.5" />
                {article.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoTimeOutline className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoEyeOutline className="h-3.5 w-3.5" />
                {article.views}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content with Sidebar */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="border rounded-lg p-6 bg-card">
                  <h3 className="font-bold mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {article.tableOfContents.map((item: any) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Article Content */}
            <article className="lg:col-span-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border mb-8">
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="prose prose-gray dark:prose-invert max-w-none
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
                {article.content}
              </div>

              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 text-xs border rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="rounded-sm gap-2">
                  <IoBookmarkOutline className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {article.relatedArticles.map((related: any) => (
                <Link
                  key={related.id}
                  href={related.href}
                  className="group flex flex-col rounded-lg border bg-card hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-sm bg-muted">
                      {related.category}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {related.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IoTimeOutline className="h-3.5 w-3.5" />
                    {related.readTime}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Continue Learning {article.frameworkName}</h2>
          <p className="text-muted-foreground mb-6">
            Explore more articles, courses, and resources
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-sm">
              <Link href={`/resources/${article.framework}`}>
                <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                Browse {article.frameworkName} Resources
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-sm">
              <Link href={`/resources/${article.framework}#articles`}>
                More {article.frameworkName} Articles
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

