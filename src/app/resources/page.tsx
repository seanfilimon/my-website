import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caller } from "@/src/lib/trpc/server";
import {
  IoStarOutline,
  IoArrowForwardOutline,
  IoBookOutline,
  IoDocumentTextOutline,
  IoPlayCircleOutline,
  IoCodeSlashOutline,
  IoTimeOutline,
  IoEyeOutline,
  IoLayersOutline,
  IoRocketOutline,
  IoServerOutline,
  IoCloudOutline,
  IoBriefcaseOutline,
  IoConstructOutline,
  IoFlashOutline,
} from "react-icons/io5";

// Map category slugs to icons
const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  frontend: IoRocketOutline,
  backend: IoServerOutline,
  database: IoServerOutline,
  devops: IoCloudOutline,
  languages: IoFlashOutline,
  tools: IoConstructOutline,
  companies: IoBriefcaseOutline,
  default: IoLayersOutline,
};

function getCategoryIcon(
  categorySlug: string,
): React.ComponentType<{ className?: string }> {
  const slug = categorySlug.toLowerCase();
  if (categoryIcons[slug]) return categoryIcons[slug];
  if (slug.includes("front")) return IoRocketOutline;
  if (slug.includes("back")) return IoServerOutline;
  if (slug.includes("data")) return IoServerOutline;
  if (slug.includes("cloud") || slug.includes("devops")) return IoCloudOutline;
  if (slug.includes("lang")) return IoFlashOutline;
  if (slug.includes("tool") || slug.includes("lib")) return IoConstructOutline;
  if (slug.includes("compan") || slug.includes("business"))
    return IoBriefcaseOutline;
  return categoryIcons.default;
}

async function getResourcesHomeData() {
  try {
    const [
      resources,
      categories,
      featuredBlogs,
      featuredArticles,
      featuredCourses,
      featuredVideos,
    ] = await Promise.all([
      caller.resource.getAllWithCounts(),
      caller.resource.listCategories(),
      caller.blog.list({ limit: 6, featured: true, status: "PUBLISHED" }),
      caller.article.list({ limit: 6, featured: true, status: "PUBLISHED" }),
      caller.course.list({ limit: 4, featured: true, status: "PUBLISHED" }),
      caller.video.list({ limit: 6, featured: true, status: "PUBLISHED" }),
    ]);

    // Group featured resources by category
    const featuredResources = resources.filter((r) => r.featured);
    const resourcesByCategory = new Map<
      string,
      {
        category: {
          id: string;
          name: string;
          slug: string;
          color: string | null;
          order: number;
        };
        resources: typeof featuredResources;
      }
    >();

    // Create category map with order
    const categoryOrderMap = new Map<string, number>();
    categories.forEach((cat, index) => {
      categoryOrderMap.set(cat.id, cat.order ?? index);
    });

    for (const resource of featuredResources) {
      const catId = resource.category.id;
      if (!resourcesByCategory.has(catId)) {
        const cat = categories.find((c) => c.id === catId);
        resourcesByCategory.set(catId, {
          category: {
            id: resource.category.id,
            name: resource.category.name,
            slug: resource.category.slug,
            color: cat?.color || null,
            order: categoryOrderMap.get(catId) ?? 999,
          },
          resources: [],
        });
      }
      resourcesByCategory.get(catId)!.resources.push(resource);
    }

    // Sort categories by order
    const sortedCategories = Array.from(resourcesByCategory.values()).sort(
      (a, b) => a.category.order - b.category.order,
    );

    return {
      featuredByCategory: sortedCategories,
      totalFeaturedResources: featuredResources.length,
      featuredBlogs: featuredBlogs.blogs || [],
      featuredArticles: featuredArticles.articles || [],
      featuredCourses: featuredCourses.courses || [],
      featuredVideos: featuredVideos.videos || [],
    };
  } catch (error) {
    console.error("Error fetching resources home data:", error);
    return {
      featuredByCategory: [],
      totalFeaturedResources: 0,
      featuredBlogs: [],
      featuredArticles: [],
      featuredCourses: [],
      featuredVideos: [],
    };
  }
}

function ResourceCard({ resource }: { resource: any }) {
  return (
    <Link
      href={`/resources/${resource.slug}`}
      className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
    >
      <div
        className="relative shrink-0 h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: resource.iconUrl
            ? "transparent"
            : `${resource.color}15`,
        }}
      >
        {resource.iconUrl ? (
          <Image
            src={resource.iconUrl}
            alt={resource.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <span className="text-xl" style={{ color: resource.color }}>
            {resource.icon}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
          {resource.name}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {resource.type?.name || "Resource"}
        </p>
      </div>
      {resource.totalContent > 0 && (
        <Badge variant="secondary" className="shrink-0 text-xs">
          {resource.totalContent}
        </Badge>
      )}
    </Link>
  );
}

function FeaturedBlogCard({ blog }: { blog: any }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-200"
    >
      <div className="relative h-32 bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            blog.thumbnail ||
            `/api/og/blog?title=${encodeURIComponent(blog.title)}&excerpt=${encodeURIComponent(blog.excerpt || "")}`
          }
          alt={blog.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-semibold text-sm text-white line-clamp-2">
            {blog.title}
          </h3>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {blog.excerpt}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IoTimeOutline className="h-3 w-3" />
            {blog.readTime || "5 min"}
          </span>
          {blog.resource && (
            <Badge variant="outline" className="text-xs h-5">
              {blog.resource.name}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeaturedArticleCard({ article }: { article: any }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
    >
      {article.thumbnail && (
        <div className="relative shrink-0 h-16 w-24 rounded-lg overflow-hidden bg-muted">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IoTimeOutline className="h-3 w-3" />
            {article.readTime || "5 min"}
          </span>
          {article.category && (
            <Badge variant="outline" className="text-xs h-5">
              {article.category.name}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeaturedCourseCard({ course }: { course: any }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-200"
    >
      {course.thumbnail && (
        <div className="relative h-32 bg-muted">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {course.level && (
            <Badge className="absolute top-2 left-2 text-xs">
              {course.level}
            </Badge>
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="font-semibold text-sm text-white line-clamp-2">
              {course.title}
            </h3>
          </div>
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {course.subtitle || course.description}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          {course.duration && (
            <span className="flex items-center gap-1">
              <IoTimeOutline className="h-3 w-3" />
              {course.duration}
            </span>
          )}
          {course.resource && (
            <Badge variant="outline" className="text-xs h-5">
              {course.resource.name}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeaturedVideoCard({ video }: { video: any }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
    >
      {video.thumbnail && (
        <div className="relative shrink-0 h-16 w-28 rounded-lg overflow-hidden bg-muted">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="112px"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <IoPlayCircleOutline className="h-6 w-6 text-white" />
          </div>
          {video.duration && (
            <span className="absolute bottom-1 right-1 px-1 py-0.5 text-[10px] bg-black/80 text-white rounded">
              {video.duration}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {video.views > 0 && (
            <span className="flex items-center gap-1">
              <IoEyeOutline className="h-3 w-3" />
              {video.views.toLocaleString()}
            </span>
          )}
          {video.resource && (
            <Badge variant="outline" className="text-xs h-5">
              {video.resource.name}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

function CategorySubsection({
  category,
  resources,
}: {
  category: { id: string; name: string; slug: string; color: string | null };
  resources: any[];
}) {
  const CategoryIcon = getCategoryIcon(category.slug);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-md"
            style={{
              backgroundColor: category.color
                ? `${category.color}15`
                : "hsl(var(--muted))",
            }}
          >
            <div
              style={{
                color: category.color || "hsl(var(--muted-foreground))",
              }}
            >
              <CategoryIcon className="h-4 w-4" />
            </div>
          </div>
          <h3 className="font-semibold text-base">{category.name}</h3>
          <Badge variant="outline" className="text-xs">
            {resources.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2">
          <Link href={`/resources/browse?category=${category.slug}`}>
            View all
            <IoArrowForwardOutline className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}

function ContentSectionHeader({
  icon: Icon,
  title,
  href,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        )}
      </div>
      <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2">
        <Link href={href}>
          View all
          <IoArrowForwardOutline className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  );
}

export default async function ResourcesPage() {
  const {
    featuredByCategory,
    totalFeaturedResources,
    featuredBlogs,
    featuredArticles,
    featuredCourses,
    featuredVideos,
  } = await getResourcesHomeData();

  const hasResources = featuredByCategory.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground max-w-2xl">
            Discover featured frameworks, tutorials, articles, and more to level
            up your development skills.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-lg text-muted-foreground">
                Loading resources...
              </div>
            </div>
          }
        >
          <div className="space-y-12">
            {/* Featured Resources Section */}
            {hasResources && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IoStarOutline className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Featured Resources</h2>
                      <p className="text-sm text-muted-foreground">
                        {totalFeaturedResources} featured across{" "}
                        {featuredByCategory.length} categories
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/resources/browse">
                      Browse All
                      <IoArrowForwardOutline className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                {/* Category Subsections */}
                <div className="space-y-8">
                  {featuredByCategory.map(({ category, resources }) => (
                    <CategorySubsection
                      key={category.id}
                      category={category}
                      resources={resources}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Blogs Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IoDocumentTextOutline className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Featured Blogs</h2>
                    {featuredBlogs.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {featuredBlogs.length} featured
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/blogs">
                    View All
                    <IoArrowForwardOutline className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              {featuredBlogs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {featuredBlogs.slice(0, 8).map((blog) => (
                    <FeaturedBlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-lg border border-dashed">
                  <IoDocumentTextOutline className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No featured blogs yet
                  </p>
                </div>
              )}
            </section>

            {/* Featured Articles Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IoCodeSlashOutline className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Featured Articles</h2>
                    {featuredArticles.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {featuredArticles.length} featured
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/articles">
                    View All
                    <IoArrowForwardOutline className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              {featuredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {featuredArticles.slice(0, 6).map((article) => (
                    <FeaturedArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-lg border border-dashed">
                  <IoCodeSlashOutline className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No featured articles yet
                  </p>
                </div>
              )}
            </section>

            {/* Featured Tutorials (Courses) Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IoBookOutline className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Featured Tutorials</h2>
                    {featuredCourses.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {featuredCourses.length} featured
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/courses">
                    View All
                    <IoArrowForwardOutline className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              {featuredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {featuredCourses.slice(0, 8).map((course) => (
                    <FeaturedCourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-lg border border-dashed">
                  <IoBookOutline className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No featured tutorials yet
                  </p>
                </div>
              )}
            </section>

            {/* Featured Videos Section */}
            {featuredVideos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IoPlayCircleOutline className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Featured Videos</h2>
                      <p className="text-sm text-muted-foreground">
                        {featuredVideos.length} featured
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/videos">
                      View All
                      <IoArrowForwardOutline className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {featuredVideos.slice(0, 6).map((video) => (
                    <FeaturedVideoCard key={video.id} video={video} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
