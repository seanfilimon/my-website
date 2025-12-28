import { Metadata } from "next";
import { caller } from "@/src/lib/trpc/server";
import { BlogsContent } from "@/src/app/resources/blogs/blogs-content";

export const metadata: Metadata = {
  title: "Blogs | Sean Filimon",
  description:
    "Personal insights, opinions, and thoughts on web development, software engineering, and technology.",
  openGraph: {
    title: "Blogs | Sean Filimon",
    description:
      "Personal insights, opinions, and thoughts on web development, software engineering, and technology.",
  },
};

async function getBlogsData() {
  try {
    const [blogsResult, categories] = await Promise.all([
      caller.blog.list({ status: "PUBLISHED", limit: 100 }),
      caller.resource.listContentCategories(),
    ]);

    return {
      blogs: blogsResult.blogs,
      categories,
    };
  } catch (error) {
    console.error("Error fetching blogs data:", error);
    return {
      blogs: [],
      categories: [],
    };
  }
}

export default async function BlogsPage() {
  const { blogs, categories } = await getBlogsData();

  return <BlogsContent blogs={blogs} categories={categories} />;
}
