"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoAddOutline,
  IoDocumentTextOutline,
  IoNewspaperOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoLibraryOutline,
  IoEyeOutline,
  IoArrowUpOutline
} from "react-icons/io5";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your content and resources</p>
        </div>
        <Button className="rounded-sm gap-2">
          <IoAddOutline className="h-4 w-4" />
          Create New
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <IoDocumentTextOutline className="h-8 w-8 text-primary" />
            <span className="flex items-center gap-1 text-xs text-green-600">
              <IoArrowUpOutline className="h-3 w-3" />
              12%
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">45</p>
          <p className="text-sm text-muted-foreground">Total Articles</p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <IoNewspaperOutline className="h-8 w-8 text-primary" />
            <span className="flex items-center gap-1 text-xs text-green-600">
              <IoArrowUpOutline className="h-3 w-3" />
              8%
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">28</p>
          <p className="text-sm text-muted-foreground">Total Blogs</p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <IoBookOutline className="h-8 w-8 text-primary" />
            <span className="flex items-center gap-1 text-xs text-green-600">
              <IoArrowUpOutline className="h-3 w-3" />
              15%
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">18</p>
          <p className="text-sm text-muted-foreground">Total Courses</p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <IoPlayCircleOutline className="h-8 w-8 text-primary" />
            <span className="flex items-center gap-1 text-xs text-green-600">
              <IoArrowUpOutline className="h-3 w-3" />
              20%
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">65</p>
          <p className="text-sm text-muted-foreground">Total Videos</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/articles/new"
          className="group border rounded-lg p-6 bg-card hover:shadow-md transition-all cursor-pointer"
        >
          <IoDocumentTextOutline className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">New Article</h3>
          <p className="text-sm text-muted-foreground">Create a new article</p>
        </Link>

        <Link
          href="/admin/blogs/new"
          className="group border rounded-lg p-6 bg-card hover:shadow-md transition-all cursor-pointer"
        >
          <IoNewspaperOutline className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">New Blog</h3>
          <p className="text-sm text-muted-foreground">Write a blog post</p>
        </Link>

        <Link
          href="/admin/courses/new"
          className="group border rounded-lg p-6 bg-card hover:shadow-md transition-all cursor-pointer"
        >
          <IoBookOutline className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">New Course</h3>
          <p className="text-sm text-muted-foreground">Create a course</p>
        </Link>

        <Link
          href="/admin/videos/new"
          className="group border rounded-lg p-6 bg-card hover:shadow-md transition-all cursor-pointer"
        >
          <IoPlayCircleOutline className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">New Video</h3>
          <p className="text-sm text-muted-foreground">Upload a video</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          <div className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IoDocumentTextOutline className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New article published</p>
                <p className="text-xs text-muted-foreground">Understanding Next.js App Router • 2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IoBookOutline className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Course updated</p>
                <p className="text-xs text-muted-foreground">Next.js 16 Masterclass • 5 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IoNewspaperOutline className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Blog post drafted</p>
                <p className="text-xs text-muted-foreground">Why I Migrated to Next.js 16 • Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

