"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoAddOutline,
  IoSearchOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoFilterOutline
} from "react-icons/io5";

const mockArticles = [
  { 
    id: 1, 
    title: "Understanding Next.js App Router", 
    framework: "Next.js",
    category: "Tutorial", 
    status: "Published", 
    views: "3.4K",
    publishedAt: "2 days ago"
  },
  { 
    id: 2, 
    title: "Server Components vs Client Components", 
    framework: "Next.js",
    category: "Guide", 
    status: "Published", 
    views: "2.1K",
    publishedAt: "5 days ago"
  },
  { 
    id: 3, 
    title: "TypeScript Advanced Patterns", 
    framework: "TypeScript",
    category: "Advanced", 
    status: "Draft", 
    views: "0",
    publishedAt: "Not published"
  },
];

export default function AdminArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Articles</h1>
          <p className="text-muted-foreground">Manage all articles</p>
        </div>
        <Button asChild className="rounded-sm gap-2">
          <Link href="/admin/articles/new">
            <IoAddOutline className="h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="outline" size="sm" className="rounded-sm gap-2">
          <IoFilterOutline className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Framework</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Views</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Published</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockArticles.map((article) => (
              <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{article.title}</p>
                </td>
                <td className="px-4 py-3 text-sm">{article.framework}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-sm bg-muted">
                    {article.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-sm ${
                    article.status === 'Published' 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{article.views}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{article.publishedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-sm">
                      <IoEyeOutline className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-sm">
                      <IoCreateOutline className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-sm text-destructive">
                      <IoTrashOutline className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

