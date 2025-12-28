import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { caller } from "@/src/lib/trpc/server";
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoChevronForwardOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoEyeOutline,
  IoBookmarkOutline,
} from "react-icons/io5";
import { Badge } from "@/components/ui/badge";

async function getArticle(idOrSlug: string) {
  try {
    // Try to fetch by slug first
    const article = await caller.article.bySlug({ slug: idOrSlug });
    await caller.article.incrementViews({ id: article.id });
    return article;
  } catch (error) {
    // If slug fetch fails, try fetching by ID
    try {
      const article = await caller.article.byId({ id: idOrSlug });
      await caller.article.incrementViews({ id: article.id });
      return article;
    } catch {
      return null;
    }
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* Compact Header Section */}
      <section className="relative py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/50 via-background to-muted/30 border-b">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-sm -ml-2"
            >
              <Link href="/articles" className="flex items-center gap-2">
                <IoArrowForwardOutline className="h-4 w-4 rotate-180" />
                <span className="hidden sm:inline">Back to Articles</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <IoChevronForwardOutline className="h-3 w-3" />
              <Link
                href="/articles"
                className="hover:text-foreground transition-colors"
              >
                Articles
              </Link>
            </div>
          </div>

          <div className="article-hero">
            <div className="flex items-center gap-2 mb-3">
              {article.category && (
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-sm border"
                  style={{
                    borderColor: article.category.color || undefined,
                    backgroundColor: article.category.color
                      ? `${article.category.color}20`
                      : undefined,
                  }}
                >
                  {article.category.name}
                </span>
              )}
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-sm ${
                  article.difficulty === "BEGINNER"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : article.difficulty === "INTERMEDIATE"
                      ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                      : "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                }`}
              >
                {article.difficulty}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-muted-foreground mb-4">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {article.author && (
                <>
                  <span className="font-medium text-foreground">
                    {article.author.name}
                  </span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <IoCalendarOutline className="h-3.5 w-3.5" />
                {formatDate(article.publishedAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoTimeOutline className="h-3.5 w-3.5" />
                {article.readTime || "5 min read"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoEyeOutline className="h-3.5 w-3.5" />
                {article.views.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Main Article Content */}
          <article>
            <div
              className="prose prose-gray dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-base prose-p:leading-7 prose-p:mb-4
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-li:text-base prose-li:leading-7 prose-li:mb-2
              prose-strong:font-semibold prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm gap-2"
                >
                  <IoBookmarkOutline className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </article>

          {/* Author Info */}
          {article.author && (
            <div className="mt-12 p-6 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-4">
                {article.author.image && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.author.image}
                      alt={article.author.name || "Author"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{article.author.name}</h3>
                  {article.author.bio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {article.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="border-t py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Continue Reading</h2>
          <p className="text-muted-foreground mb-6">
            Explore more articles and resources
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-sm">
              <Link href="/articles">
                <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                Browse All Articles
              </Link>
            </Button>
            {article.resource && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-sm"
              >
                <Link href={`/resources/${article.resource.slug}`}>
                  More {article.resource.name} Resources
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
