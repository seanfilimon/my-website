"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoAddOutline, IoSearchOutline, IoCreateOutline, IoTrashOutline, IoEyeOutline } from "react-icons/io5";

const mockBlogs = [
  { id: 1, title: "Why I Migrated to Next.js 16", framework: "Next.js", status: "Published", views: "1.2K", publishedAt: "1 day ago" },
  { id: 2, title: "Next.js at Scale", framework: "Next.js", status: "Published", views: "890", publishedAt: "4 days ago" },
];

export default function AdminBlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blogs</h1>
          <p className="text-muted-foreground">Manage blog posts</p>
        </div>
        <Button asChild className="rounded-sm gap-2">
          <Link href="/admin/blogs/new"><IoAddOutline className="h-4 w-4" />New Blog</Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search blogs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Framework</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Views</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Published</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockBlogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><p className="font-medium">{blog.title}</p></td>
                <td className="px-4 py-3 text-sm">{blog.framework}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium rounded-sm bg-green-500/10 text-green-700">{blog.status}</span></td>
                <td className="px-4 py-3 text-sm">{blog.views}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{blog.publishedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-sm"><IoEyeOutline className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="rounded-sm"><IoCreateOutline className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="rounded-sm text-destructive"><IoTrashOutline className="h-4 w-4" /></Button>
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

