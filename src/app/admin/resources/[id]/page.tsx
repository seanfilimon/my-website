"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IoArrowBackOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoLinkOutline,
  IoLogoGithub,
  IoDocumentTextOutline,
  IoNewspaperOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoTrendingUpOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoEllipsisHorizontal,
  IoAddOutline,
  IoFilterOutline,
  IoDownloadOutline,
  IoShareOutline,
  IoCopyOutline,
  IoArchiveOutline,
  IoRefreshOutline
} from "react-icons/io5";

// Mock data for a specific resource
const mockResource = {
  id: "1",
  name: "Next.js",
  slug: "nextjs",
  icon: "▲",
  color: "#000000",
  description: "The React Framework for the Web. Used by some of the world's largest companies, Next.js enables you to create full-stack web applications by extending the latest React features.",
  type: "Framework",
  category: "Frontend",
  officialUrl: "https://nextjs.org",
  docsUrl: "https://nextjs.org/docs",
  githubUrl: "https://github.com/vercel/next.js",
  stats: {
    articles: 45,
    blogs: 28,
    courses: 18,
    videos: 24,
    totalViews: "125.4K",
    avgRating: 4.8,
    activeUsers: "2.3K",
    monthlyGrowth: 12.5
  },
  tags: ["React", "SSR", "SSG", "Full-stack", "Vercel"],
  lastUpdated: "2 hours ago",
  createdAt: "Jan 15, 2024"
};

// Mock related content
const mockArticles = [
  { id: 1, title: "Getting Started with Next.js 16", status: "published", views: "5.2K", author: "John Doe", publishedAt: "2 days ago", readTime: "8 min" },
  { id: 2, title: "Next.js App Router Deep Dive", status: "published", views: "3.8K", author: "Jane Smith", publishedAt: "5 days ago", readTime: "12 min" },
  { id: 3, title: "Server Components Explained", status: "draft", views: "0", author: "Mike Johnson", publishedAt: "-", readTime: "10 min" },
];

const mockBlogs = [
  { id: 1, title: "Why I Migrated to Next.js 16", status: "published", views: "1.2K", likes: 89, comments: 12, publishedAt: "1 day ago" },
  { id: 2, title: "Next.js at Scale: Lessons Learned", status: "published", views: "890", likes: 67, comments: 8, publishedAt: "4 days ago" },
];

const mockCourses = [
  { id: 1, title: "Next.js 16 Complete Masterclass", level: "Beginner", students: "2,450", rating: 4.9, price: "$49.99", duration: "12h 30m" },
  { id: 2, title: "Advanced Next.js Patterns", level: "Advanced", students: "1,230", rating: 4.7, price: "$79.99", duration: "8h 15m" },
];

const mockVideos = [
  { id: 1, title: "Next.js 16 - What's New?", views: "12.5K", duration: "15:30", thumbnail: "📹", publishedAt: "3 days ago" },
  { id: 2, title: "Building a SaaS with Next.js", views: "8.2K", duration: "45:20", thumbnail: "📹", publishedAt: "1 week ago" },
];

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [contentFilter, setContentFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-sm"
          >
            <IoArrowBackOutline className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-black text-white flex items-center justify-center text-2xl font-bold">
              {mockResource.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{mockResource.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{mockResource.type}</Badge>
                <Badge variant="outline">{mockResource.category}</Badge>
                <span className="text-sm text-muted-foreground">/{mockResource.slug}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <IoRefreshOutline className="h-4 w-4" />
            Sync
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <IoShareOutline className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <IoDownloadOutline className="h-4 w-4" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <IoEllipsisHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <IoCreateOutline className="mr-2 h-4 w-4" />
                Edit Resource
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IoCopyOutline className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IoArchiveOutline className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <IoTrashOutline className="mr-2 h-4 w-4" />
                Delete Resource
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="gap-2">
            <IoCreateOutline className="h-4 w-4" />
            Edit Resource
          </Button>
        </div>
      </div>

      {/* Resource Info */}
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-4">{mockResource.description}</p>
          
          <div className="flex items-center gap-6 flex-wrap">
            {mockResource.officialUrl && (
              <a href={mockResource.officialUrl} target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-2 text-sm hover:underline">
                <IoLinkOutline className="h-4 w-4" />
                Official Website
              </a>
            )}
            {mockResource.docsUrl && (
              <a href={mockResource.docsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:underline">
                <IoDocumentTextOutline className="h-4 w-4" />
                Documentation
              </a>
            )}
            {mockResource.githubUrl && (
              <a href={mockResource.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:underline">
                <IoLogoGithub className="h-4 w-4" />
                GitHub
              </a>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IoCalendarOutline className="h-4 w-4" />
              Created {mockResource.createdAt}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IoTimeOutline className="h-4 w-4" />
              Updated {mockResource.lastUpdated}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {mockResource.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockResource.stats.articles + mockResource.stats.blogs + mockResource.stats.courses + mockResource.stats.videos}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <IoTrendingUpOutline className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500">+{mockResource.stats.monthlyGrowth}%</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResource.stats.totalViews}</div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResource.stats.activeUsers}</div>
            <div className="flex items-center gap-1 mt-2">
              <IoPersonOutline className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Currently learning</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResource.stats.avgRating}/5.0</div>
            <div className="flex gap-1 mt-2">
              {"★★★★★".split("").map((star, i) => (
                <span key={i} className={i < Math.floor(mockResource.stats.avgRating) ? "text-yellow-500" : "text-gray-300"}>
                  {star}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="articles">
              Articles ({mockResource.stats.articles})
            </TabsTrigger>
            <TabsTrigger value="blogs">
              Blogs ({mockResource.stats.blogs})
            </TabsTrigger>
            <TabsTrigger value="courses">
              Courses ({mockResource.stats.courses})
            </TabsTrigger>
            <TabsTrigger value="videos">
              Videos ({mockResource.stats.videos})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contentFilter} onValueChange={setContentFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <IoFilterOutline className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Articles</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/articles?resource=${mockResource.slug}`}>View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockArticles.slice(0, 3).map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{article.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{article.author}</span>
                          <span>•</span>
                          <span>{article.readTime} read</span>
                          <span>•</span>
                          <span>{article.views} views</span>
                        </div>
                      </div>
                      <Badge variant={article.status === "published" ? "default" : "secondary"}>
                        {article.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Blogs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Blogs</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/blogs?resource=${mockResource.slug}`}>View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockBlogs.map((blog) => (
                    <div key={blog.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{blog.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{blog.views} views</span>
                          <span>•</span>
                          <span>{blog.likes} likes</span>
                          <span>•</span>
                          <span>{blog.comments} comments</span>
                        </div>
                      </div>
                      <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                        {blog.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Popular Courses</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/courses?resource=${mockResource.slug}`}>View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCourses.map((course) => (
                    <div key={course.id} className="p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{course.title}</p>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span>{course.students} students</span>
                          <span>•</span>
                          <span>★ {course.rating}</span>
                        </div>
                        <span className="font-semibold text-foreground">{course.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Videos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Videos</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/videos?resource=${mockResource.slug}`}>View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVideos.map((video) => (
                    <div key={video.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                      <div className="h-12 w-16 bg-muted rounded flex items-center justify-center text-2xl">
                        {video.thumbnail}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{video.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{video.views} views</span>
                          <span>•</span>
                          <span>{video.duration}</span>
                          <span>•</span>
                          <span>{video.publishedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Articles</CardTitle>
                <Button className="gap-2">
                  <IoAddOutline className="h-4 w-4" />
                  New Article
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium">Title</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Author</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Views</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Published</th>
                      <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-medium">{article.title}</p>
                          <p className="text-xs text-muted-foreground">{article.readTime} read</p>
                        </td>
                        <td className="px-4 py-3 text-sm">{article.author}</td>
                        <td className="px-4 py-3">
                          <Badge variant={article.status === "published" ? "default" : "secondary"}>
                            {article.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{article.views}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{article.publishedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <IoEyeOutline className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IoCreateOutline className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <IoTrashOutline className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar structure for Blogs, Courses, Videos tabs... */}
        <TabsContent value="blogs">
          <Card>
            <CardHeader>
              <CardTitle>Blogs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Blog content management for {mockResource.name}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Course content management for {mockResource.name}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Video content management for {mockResource.name}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Detailed metrics for {mockResource.name} content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <IoStatsChartOutline className="h-12 w-12" />
                  <span className="ml-2">Analytics charts would go here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
