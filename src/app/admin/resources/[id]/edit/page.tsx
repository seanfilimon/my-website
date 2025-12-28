"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IoArrowBackOutline,
  IoSaveOutline,
  IoTrashOutline,
  IoAddOutline,
  IoCloseOutline,
  IoColorPaletteOutline,
  IoLinkOutline,
  IoDocumentTextOutline,
  IoNewspaperOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCreateOutline,
  IoEyeOutline,
  IoArchiveOutline,
  IoRefreshOutline,
  IoCopyOutline
} from "react-icons/io5";

// Mock data
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
  tags: ["React", "SSR", "SSG", "Full-stack", "Vercel"],
  seoTitle: "Next.js Framework - Learn Next.js Development",
  seoDescription: "Master Next.js with our comprehensive tutorials, courses, and articles.",
  featured: true,
  status: "active",
  // OG Image Styling
  ogBackgroundColor: "#000000",
  ogBorderColor: "#262626",
  ogTextPrimary: "#ffffff",
  ogTextSecondary: "#a3a3a3",
  ogAccentStart: "#3b82f6",
  ogAccentEnd: "#8b5cf6",
  ogResourceBgColor: "#000000",
  ogFontWeight: 500,
  ogBorderWidth: 2,
};

// Mock related content
const mockRelatedContent = {
  articles: [
    { id: 1, title: "Getting Started with Next.js 16", status: "published", author: "John Doe", linked: true },
    { id: 2, title: "Next.js App Router Deep Dive", status: "published", author: "Jane Smith", linked: true },
    { id: 3, title: "React Fundamentals", status: "published", author: "Mike Johnson", linked: false },
  ],
  blogs: [
    { id: 1, title: "Why I Migrated to Next.js 16", status: "published", author: "Admin", linked: true },
    { id: 2, title: "Next.js at Scale", status: "published", author: "Admin", linked: true },
  ],
  courses: [
    { id: 1, title: "Next.js 16 Complete Masterclass", level: "Beginner", instructor: "John Doe", linked: true },
    { id: 2, title: "Advanced Next.js Patterns", level: "Advanced", instructor: "Jane Smith", linked: true },
  ],
  videos: [
    { id: 1, title: "Next.js 16 - What's New?", duration: "15:30", views: "12.5K", linked: true },
    { id: 2, title: "Building a SaaS with Next.js", duration: "45:20", views: "8.2K", linked: true },
  ]
};

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  
  // Redirect to the real editor
  const resourceId = params.id as string;
  if (typeof window !== "undefined") {
    router.replace(`/admin/edit/resources/${resourceId}`);
  }
  
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Redirecting to editor...</p>
      </div>
    </div>
  );
}

/*
// Old mock implementation - now redirects to real editor
function OldEditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState(mockResource);
  const [activeTab, setActiveTab] = useState("general");
  const [tags, setTags] = useState(mockResource.tags);
  const [newTag, setNewTag] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentFilter, setContentFilter] = useState("all");

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
      setUnsavedChanges(true);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    // Save logic here
    console.log("Saving resource:", { ...formData, tags });
    setUnsavedChanges(false);
  };

  const handleToggleContent = (type: string, id: number) => {
    // Toggle content association logic
    setUnsavedChanges(true);
  };

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
          
          <div>
            <h1 className="text-3xl font-bold">Edit Resource</h1>
            <p className="text-muted-foreground">Modify {formData.name} settings and content</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <Badge variant="outline" className="gap-1">
              <IoAlertCircleOutline className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
          
          <Button variant="outline" className="gap-2">
            <IoRefreshOutline className="h-4 w-4" />
            Reset
          </Button>
          
          <Button variant="outline" className="gap-2">
            <IoEyeOutline className="h-4 w-4" />
            Preview
          </Button>
          
          <Button className="gap-2" onClick={handleSave}>
            <IoSaveOutline className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="og-styling">OG Styling</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about the resource</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Resource Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Next.js"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="e.g., nextjs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <div className="flex gap-2">
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => handleInputChange("icon", e.target.value)}
                      placeholder="e.g., ▲"
                      className="flex-1"
                    />
                    <div className="h-10 w-10 border rounded flex items-center justify-center text-xl">
                      {formData.icon}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">Brand Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Detailed description of the resource..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Framework">Framework</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Language">Language</SelectItem>
                      <SelectItem value="Tool">Tool</SelectItem>
                      <SelectItem value="Platform">Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="Full-stack">Full-stack</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Links</CardTitle>
              <CardDescription>Official resource links and documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="officialUrl">Official Website</Label>
                <div className="flex gap-2">
                  <IoLinkOutline className="h-5 w-5 mt-2.5 text-muted-foreground" />
                  <Input
                    id="officialUrl"
                    value={formData.officialUrl}
                    onChange={(e) => handleInputChange("officialUrl", e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="docsUrl">Documentation URL</Label>
                <div className="flex gap-2">
                  <IoDocumentTextOutline className="h-5 w-5 mt-2.5 text-muted-foreground" />
                  <Input
                    id="docsUrl"
                    value={formData.docsUrl}
                    onChange={(e) => handleInputChange("docsUrl", e.target.value)}
                    placeholder="https://example.com/docs"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub Repository</Label>
                <div className="flex gap-2">
                  <IoLinkOutline className="h-5 w-5 mt-2.5 text-muted-foreground" />
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                    placeholder="https://github.com/..."
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add relevant tags for better categorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} variant="outline">
                  <IoAddOutline className="h-4 w-4" />
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <IoCloseOutline className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OG Styling Tab */}
        <TabsContent value="og-styling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IoColorPaletteOutline className="h-5 w-5" />
                Blog OG Image Styling
              </CardTitle>
              <CardDescription>
                Customize how blog posts for this resource appear in social media previews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Background & Borders</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ogBackgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ogBackgroundColor"
                        type="color"
                        value={formData.ogBackgroundColor}
                        onChange={(e) => handleInputChange("ogBackgroundColor", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.ogBackgroundColor}
                        onChange={(e) => handleInputChange("ogBackgroundColor", e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogBorderColor">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ogBorderColor"
                        type="color"
                        value={formData.ogBorderColor}
                        onChange={(e) => handleInputChange("ogBorderColor", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.ogBorderColor}
                        onChange={(e) => handleInputChange("ogBorderColor", e.target.value)}
                        placeholder="#262626"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogResourceBgColor">Resource Area Background</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ogResourceBgColor"
                        type="color"
                        value={formData.ogResourceBgColor}
                        onChange={(e) => handleInputChange("ogResourceBgColor", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.ogResourceBgColor}
                        onChange={(e) => handleInputChange("ogResourceBgColor", e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogBorderWidth">Border Width (px)</Label>
                    <Input
                      id="ogBorderWidth"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.ogBorderWidth}
                      onChange={(e) => handleInputChange("ogBorderWidth", parseInt(e.target.value))}
                      placeholder="2"
                    />
                  </div>
                </div>
              </div>

              {/* Text Colors */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Text Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ogTextPrimary">Primary Text (Title)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ogTextPrimary"
                        type="color"
                        value={formData.ogTextPrimary}
                        onChange={(e) => handleInputChange("ogTextPrimary", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.ogTextPrimary}
                        onChange={(e) => handleInputChange("ogTextPrimary", e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogTextSecondary">Secondary Text (Excerpt)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ogTextSecondary"
                        type="color"
                        value={formData.ogTextSecondary}
                        onChange={(e) => handleInputChange("ogTextSecondary", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.ogTextSecondary}
                        onChange={(e) => handleInputChange("ogTextSecondary", e.target.value)}
                        placeholder="#a3a3a3"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogFontWeight">Title Font Weight</Label>
                    <Select 
                      value={formData.ogFontWeight.toString()} 
                      onValueChange={(value) => handleInputChange("ogFontWeight", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">400 (Normal)</SelectItem>
                        <SelectItem value="500">500 (Medium)</SelectItem>
                        <SelectItem value="600">600 (Semibold)</SelectItem>
                        <SelectItem value="700">700 (Bold)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Accent Gradient */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Accent Gradient (Avatar & Decorations)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ogAccentStart">Gradient Start Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ogAccentStart"
                        type="color"
                        value={formData.ogAccentStart}
                        onChange={(e) => handleInputChange("ogAccentStart", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.ogAccentStart}
                        onChange={(e) => handleInputChange("ogAccentStart", e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogAccentEnd">Gradient End Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ogAccentEnd"
                        type="color"
                        value={formData.ogAccentEnd}
                        onChange={(e) => handleInputChange("ogAccentEnd", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.ogAccentEnd}
                        onChange={(e) => handleInputChange("ogAccentEnd", e.target.value)}
                        placeholder="#8b5cf6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Gradient Preview */}
                <div className="space-y-2">
                  <Label>Gradient Preview</Label>
                  <div 
                    className="h-20 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${formData.ogAccentStart} 0%, ${formData.ogAccentEnd} 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Preview Note */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex gap-2">
                  <IoInformationCircleOutline className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Preview OG Images</p>
                    <p>
                      To see how your styling looks, view any blog post associated with this resource.
                      The OG image will automatically use these custom colors.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Linked Content</CardTitle>
                  <CardDescription>Manage content associated with this resource</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search content..."
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={contentFilter} onValueChange={setContentFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="articles">Articles</SelectItem>
                      <SelectItem value="blogs">Blogs</SelectItem>
                      <SelectItem value="courses">Courses</SelectItem>
                      <SelectItem value="videos">Videos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="articles">
                <TabsList>
                  <TabsTrigger value="articles">
                    Articles ({mockRelatedContent.articles.filter(a => a.linked).length})
                  </TabsTrigger>
                  <TabsTrigger value="blogs">
                    Blogs ({mockRelatedContent.blogs.filter(b => b.linked).length})
                  </TabsTrigger>
                  <TabsTrigger value="courses">
                    Courses ({mockRelatedContent.courses.filter(c => c.linked).length})
                  </TabsTrigger>
                  <TabsTrigger value="videos">
                    Videos ({mockRelatedContent.videos.filter(v => v.linked).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="articles">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input type="checkbox" className="rounded" />
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Linked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRelatedContent.articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <input type="checkbox" className="rounded" />
                          </TableCell>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>{article.author}</TableCell>
                          <TableCell>
                            <Badge variant={article.status === "published" ? "default" : "secondary"}>
                              {article.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={article.linked}
                              onCheckedChange={() => handleToggleContent("article", article.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="blogs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input type="checkbox" className="rounded" />
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Linked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRelatedContent.blogs.map((blog) => (
                        <TableRow key={blog.id}>
                          <TableCell>
                            <input type="checkbox" className="rounded" />
                          </TableCell>
                          <TableCell className="font-medium">{blog.title}</TableCell>
                          <TableCell>{blog.author}</TableCell>
                          <TableCell>
                            <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                              {blog.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={blog.linked}
                              onCheckedChange={() => handleToggleContent("blog", blog.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Similar tables for courses and videos */}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize resource pages for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                  placeholder="Page title for search results"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.seoTitle?.length || 0}/60 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                  placeholder="Description for search results"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.seoDescription?.length || 0}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Additional configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured">Featured Resource</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this resource prominently on the homepage
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange("featured", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Resource Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Archive Resource</p>
                  <p className="text-sm text-muted-foreground">
                    Hide this resource from public view
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <IoArchiveOutline className="h-4 w-4" />
                  Archive
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Resource</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove this resource and all associations
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <IoTrashOutline className="h-4 w-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the resource
                        and remove all associated content links.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive">Delete Resource</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
*/
