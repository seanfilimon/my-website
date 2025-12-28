import { Metadata } from "next";
import { caller } from "@/src/lib/trpc/server";
import { ArticlesContent } from "./articles-content";

export const metadata: Metadata = {
  title: "Articles | Resources | Sean Filimon",
  description:
    "Browse all technical articles, tutorials, and guides available in the resources section.",
  openGraph: {
    title: "Articles | Resources | Sean Filimon",
    description:
      "Browse all technical articles, tutorials, and guides available in the resources section.",
  },
};

async function getArticlesData() {
  try {
    const [articlesResult, categories] = await Promise.all([
      caller.article.list({ status: "PUBLISHED", limit: 100 }),
      caller.resource.listContentCategories(),
    ]);

    return {
      articles: articlesResult.articles,
      categories,
    };
  } catch (error) {
    console.error("Error fetching articles data:", error);
    return {
      articles: [],
      categories: [],
    };
  }
}

export default async function ArticlesPage() {
  const { articles, categories } = await getArticlesData();

  return <ArticlesContent articles={articles} categories={categories} />;
}
