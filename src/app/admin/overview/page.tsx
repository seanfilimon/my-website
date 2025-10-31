"use client";

import {
  IoTrendingUpOutline,
  IoEyeOutline,
  IoHeartOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoNewspaperOutline,
  IoBookOutline,
  IoPlayCircleOutline
} from "react-icons/io5";

export default function AdminOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Overview</h1>
        <p className="text-muted-foreground">Analytics and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-2">
            <IoEyeOutline className="h-6 w-6 text-primary" />
            <span className="text-xs text-green-600 font-medium">+18%</span>
          </div>
          <p className="text-3xl font-bold mb-1">125.4K</p>
          <p className="text-sm text-muted-foreground">Total Views</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-2">
            <IoHeartOutline className="h-6 w-6 text-primary" />
            <span className="text-xs text-green-600 font-medium">+24%</span>
          </div>
          <p className="text-3xl font-bold mb-1">8.2K</p>
          <p className="text-sm text-muted-foreground">Engagements</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-2">
            <IoTimeOutline className="h-6 w-6 text-primary" />
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-3xl font-bold mb-1">4.5min</p>
          <p className="text-sm text-muted-foreground">Avg. Read Time</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-2">
            <IoTrendingUpOutline className="h-6 w-6 text-primary" />
            <span className="text-xs text-green-600 font-medium">+32%</span>
          </div>
          <p className="text-3xl font-bold mb-1">2.1K</p>
          <p className="text-sm text-muted-foreground">New Subscribers</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      {/* Content Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performing Content */}
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Top Performing Content</h2>
          </div>
          <div className="divide-y">
            <div className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <IoDocumentTextOutline className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Understanding Next.js App Router</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>8.4K views</span>
                    <span>•</span>
                    <span>12 min read</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <IoPlayCircleOutline className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Building a SaaS from Scratch</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>12.5K views</span>
                    <span>•</span>
                    <span>24:15</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <IoBookOutline className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Next.js 16 Complete Masterclass</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>2.4K enrollments</span>
                    <span>•</span>
                    <span>12 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="divide-y">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <IoDocumentTextOutline className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Article published</p>
                  <p className="text-xs text-muted-foreground">Next.js Middleware Patterns</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <IoNewspaperOutline className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Blog updated</p>
                  <p className="text-xs text-muted-foreground">Why I Migrated to Next.js 16</p>
                  <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <IoBookOutline className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Course lesson added</p>
                  <p className="text-xs text-muted-foreground">Advanced Next.js Patterns</p>
                  <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content by Type */}
      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Content Distribution</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <IoDocumentTextOutline className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">45</p>
              <p className="text-sm text-muted-foreground">Articles</p>
            </div>
            <div className="text-center">
              <IoNewspaperOutline className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">28</p>
              <p className="text-sm text-muted-foreground">Blogs</p>
            </div>
            <div className="text-center">
              <IoBookOutline className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">18</p>
              <p className="text-sm text-muted-foreground">Courses</p>
            </div>
            <div className="text-center">
              <IoPlayCircleOutline className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">65</p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

