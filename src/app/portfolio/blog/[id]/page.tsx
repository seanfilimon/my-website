import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoArrowBackOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoShareOutline,
  IoHeartOutline
} from "react-icons/io5";

const getBlogData = async (id: string) => {
  const blogs = {
    "building-nextjs-16": {
      id: "building-nextjs-16",
      title: "Building with Next.js 16: A Complete Guide",
      excerpt: "Everything you need to know about Next.js 16's new features, performance improvements, and migration strategies.",
      content: `
        <h2>What's New in Next.js 16</h2>
        <p>Next.js 16 brings significant improvements to performance, developer experience, and deployment capabilities.</p>
        
        <h3>Key Features</h3>
        <ul>
          <li>Improved App Router performance</li>
          <li>Enhanced Image Optimization</li>
          <li>Better TypeScript support</li>
          <li>New caching strategies</li>
        </ul>
        
        <h3>Migration Guide</h3>
        <p>Migrating from Next.js 15 to 16 is straightforward, but there are a few breaking changes to be aware of.</p>
        
        <h3>Performance Benchmarks</h3>
        <p>Our tests show significant improvements in build times and runtime performance compared to previous versions.</p>
      `,
      publishedAt: "December 10, 2024",
      readTime: "12 min read",
      tags: ["Next.js", "React", "Performance", "Migration"],
      category: "Tutorial",
      author: {
        name: "Sean Filimon",
        avatar: "/face_grayscale_nobg.png"
      }
    }
  };

  return blogs[id as keyof typeof blogs] || null;
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const blog = await getBlogData(params.id);
  
  return {
    title: blog ? `${blog.title} | Blog` : "Blog Post Not Found",
    description: blog?.excerpt || "Blog post not found."
  };
}

export default async function BlogPage({ params }: { params: { id: string } }) {
  const blog = await getBlogData(params.id);

  if (!blog) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
          <Button asChild variant="outline" className="rounded-sm">
            <Link href="/portfolio">Back to Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button asChild variant="ghost" className="rounded-sm gap-2">
            <Link href="/portfolio">
              <IoArrowBackOutline className="h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>

        {/* Blog Header */}
        <div className="text-center mb-12 space-y-6">
          <div>
            <span className="px-3 py-1 text-sm font-medium border rounded-sm bg-accent text-accent-foreground">
              {blog.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {blog.title}
          </h1>
          
          <p className="text-xl text-muted-foreground">
            {blog.excerpt}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <IoCalendarOutline className="h-4 w-4" />
              <span>{blog.publishedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <IoTimeOutline className="h-4 w-4" />
              <span>{blog.readTime}</span>
            </div>
            <Button size="sm" variant="outline" className="rounded-sm">
              <IoHeartOutline className="h-3 w-3 mr-2" />
              Like
            </Button>
            <Button size="sm" variant="outline" className="rounded-sm">
              <IoShareOutline className="h-3 w-3 mr-2" />
              Share
            </Button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm font-medium border rounded-sm bg-accent text-accent-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {/* Author Bio */}
        <div className="border-t pt-8">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src={blog.author.avatar}
                alt={blog.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-semibold">{blog.author.name}</div>
              <div className="text-sm text-muted-foreground">
                Serial Entrepreneur & Software Engineer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
