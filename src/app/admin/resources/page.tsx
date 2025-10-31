"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoAddOutline,
  IoSearchOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoEyeOutline
} from "react-icons/io5";

const mockResources = [
  { id: 1, name: "Next.js", slug: "nextjs", category: "Framework", articles: 45, blogs: 28, courses: 18, icon: "▲" },
  { id: 2, name: "React", slug: "react", category: "Framework", articles: 38, blogs: 22, courses: 15, icon: "⚛" },
  { id: 3, name: "TypeScript", slug: "typescript", category: "Language", articles: 32, blogs: 18, courses: 12, icon: "TS" },
];

export default function AdminResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground">Manage frameworks and technologies</p>
        </div>
        <Button className="rounded-sm gap-2">
          <IoAddOutline className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Resources Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Resource</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Articles</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Blogs</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Courses</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockResources.map((resource) => (
              <tr key={resource.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-bold">
                      {resource.icon}
                    </div>
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">/{resource.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-sm bg-muted">
                    {resource.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{resource.articles}</td>
                <td className="px-4 py-3 text-sm">{resource.blogs}</td>
                <td className="px-4 py-3 text-sm">{resource.courses}</td>
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

