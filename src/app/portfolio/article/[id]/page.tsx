import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoArrowBackOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoShareOutline
} from "react-icons/io5";

const getArticleData = async (id: string) => {
  const articles = {
    "future-of-web-dev": {
      id: "future-of-web-dev",
      title: "The Future of Web Development",
      excerpt: "Exploring emerging trends and technologies shaping the next decade of web development.",
      content: `
        <h2>The Evolution of Web Development</h2>
        <p>Web development has evolved dramatically over the past decade. From simple HTML pages to complex, interactive applications that rival native software.</p>
        
        <h2>Key Trends Shaping the Future</h2>
        <p>Several trends are converging to reshape how we build for the web:</p>
        
        <h3>1. AI-Powered Development</h3>
        <p>Artificial intelligence is becoming integral to the development process, from code completion to automated testing and deployment strategies.</p>
        
        <h3>2. Edge Computing</h3>
        <p>Moving computation closer to users for faster, more responsive applications. Edge functions and distributed architectures are becoming the norm.</p>
        
        <h3>3. Web Assembly (WASM)</h3>
        <p>Breaking the JavaScript monopoly by enabling high-performance languages like Rust and Go to run in browsers.</p>
        
        <h2>What This Means for Developers</h2>
        <p>The future belongs to developers who can adapt to these changes while maintaining focus on user experience and performance.</p>
      `,
      publishedAt: "December 15, 2024",
      readTime: "8 min read",
      tags: ["Web Development", "AI", "Edge Computing", "WebAssembly"],
      author: {
        name: "Sean Filimon",
        avatar: "/face_grayscale_nobg.png"
      }
    }
  };

  return articles[id as keyof typeof articles] || null;
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const article = await getArticleData(params.id);
  
  return {
    title: article ? `${article.title} | Article` : "Article Not Found",
    description: article?.excerpt || "Article not found."
  };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticleData(params.id);

  if (!article) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
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

        {/* Article Header */}
        <div className="text-center mb-12 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {article.excerpt}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <IoCalendarOutline className="h-4 w-4" />
              <span>{article.publishedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <IoTimeOutline className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
            <Button size="sm" variant="outline" className="rounded-sm">
              <IoShareOutline className="h-3 w-3 mr-2" />
              Share
            </Button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm font-medium border rounded-sm bg-accent text-accent-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Author Bio */}
        <div className="border-t pt-8">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-semibold">{article.author.name}</div>
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
