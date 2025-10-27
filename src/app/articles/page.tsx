"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IoNewspaperOutline,
  IoSearchOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoPersonOutline
} from "react-icons/io5";

// Sample articles data
const articles = [
  {
    id: 1,
    title: "Building with Next.js 16",
    description: "A comprehensive guide to the new features in Next.js 16 and how to use them effectively in your projects.",
    author: "Sean Filimon",
    publishedAt: "2 days ago",
    readTime: "8 min read",
    image: "/bg-pattern.png",
    category: "Framework",
    href: "/articles/building-with-nextjs-16"
  },
  {
    id: 2,
    title: "The Future of Web Development",
    description: "Exploring emerging trends and technologies that will shape the future of web development.",
    author: "Sean Filimon",
    publishedAt: "1 week ago",
    readTime: "12 min read",
    image: "/bg-pattern.png",
    category: "Industry",
    href: "/articles/future-of-web-dev"
  },
  {
    id: 3,
    title: "State of JavaScript 2024",
    description: "Analysis of the current JavaScript ecosystem and what developers should focus on.",
    author: "Sean Filimon",
    publishedAt: "3 days ago",
    readTime: "10 min read",
    image: "/bg-pattern.png",
    category: "Language",
    href: "/articles/state-of-javascript-2024"
  },
  {
    id: 4,
    title: "AI in Web Development",
    description: "How artificial intelligence is transforming the way we build for the web.",
    author: "Sean Filimon",
    publishedAt: "1 week ago",
    readTime: "14 min read",
    image: "/bg-pattern.png",
    category: "AI",
    href: "/articles/ai-in-web-dev"
  },
];

const categories = ["All", "Framework", "Industry", "Language", "AI", "Tools"];

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Articles
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            In-depth articles, insights, and analysis on web development, 
            technology trends, and building better software.
          </p>
        </div>

        {/* Search & Categories */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link
              key={article.id}
              href={article.href}
              className="group border rounded-lg overflow-hidden hover:border-primary hover:shadow-lg transition-all bg-card"
            >
              {/* Article Image */}
              <div className="relative aspect-video bg-muted">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-sm">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <IoPersonOutline className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IoTimeOutline className="h-4 w-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IoCalendarOutline className="h-4 w-4" />
                  <span>{article.publishedAt}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <IoSearchOutline className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

