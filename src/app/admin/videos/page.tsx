"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoAddOutline, IoSearchOutline, IoCreateOutline, IoTrashOutline, IoEyeOutline } from "react-icons/io5";

const mockVideos = [
  { id: 1, title: "Building a SaaS from Scratch", framework: "Next.js", duration: "24:15", views: "12.5K", status: "Published", publishedAt: "2 days ago" },
  { id: 2, title: "Advanced GSAP Animations", framework: "GSAP", duration: "32:08", views: "15.3K", status: "Published", publishedAt: "1 week ago" },
];

export default function AdminVideosPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Videos</h1>
          <p className="text-muted-foreground">Manage video content</p>
        </div>
        <Button asChild className="rounded-sm gap-2">
          <Link href="/admin/videos/new"><IoAddOutline className="h-4 w-4" />New Video</Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search videos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Framework</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Duration</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Views</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Published</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockVideos.map((video) => (
              <tr key={video.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><p className="font-medium">{video.title}</p></td>
                <td className="px-4 py-3 text-sm">{video.framework}</td>
                <td className="px-4 py-3 text-sm">{video.duration}</td>
                <td className="px-4 py-3 text-sm">{video.views}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-sm bg-green-500/10 text-green-700">{video.status}</span></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{video.publishedAt}</td>
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

