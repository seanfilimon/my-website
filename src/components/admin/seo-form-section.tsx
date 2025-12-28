"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IoChevronDownOutline,
  IoSparklesOutline,
  IoGlobeOutline,
  IoLogoTwitter,
  IoSettingsOutline,
  IoSearchOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { cn } from "@/src/lib/utils";

// SEO data interface for form state
export interface SEOFormData {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  twitterCard?: string | null;
  robots?: string | null;
  keywords?: string | null;
  author?: string | null;
  schemaType?: string | null;
}

interface SEOFormSectionProps {
  value: SEOFormData;
  onChange: (data: SEOFormData) => void;
  contentTitle?: string;
  contentDescription?: string;
  contentImage?: string;
  contentType?: "blog" | "article" | "resource" | "course" | "video";
}

// Character limit indicators
function CharacterCount({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  const isOver = current > max;
  const isNearLimit = percentage >= 80 && !isOver;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={cn(
        "font-medium",
        isOver && "text-destructive",
        isNearLimit && "text-yellow-600",
        !isOver && !isNearLimit && "text-muted-foreground"
      )}>
        {current}/{max}
      </span>
      {isOver && <IoWarningOutline className="h-3 w-3 text-destructive" />}
      {!isOver && current > 0 && <IoCheckmarkCircleOutline className="h-3 w-3 text-green-500" />}
    </div>
  );
}

// Google Search Preview
function GooglePreview({ title, description, url }: { title: string; description: string; url?: string }) {
  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border">
      <p className="text-xs text-muted-foreground mb-1">Search Preview</p>
      <div className="space-y-1">
        <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
          {title || "Page Title"}
        </p>
        <p className="text-xs text-green-700 dark:text-green-500 truncate">
          {url || "https://seanfilimon.com/page"}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description || "Meta description will appear here..."}
        </p>
      </div>
    </div>
  );
}

// Social Card Preview
function SocialPreview({ 
  title, 
  description, 
  image, 
  platform 
}: { 
  title: string; 
  description: string; 
  image?: string; 
  platform: "og" | "twitter";
}) {
  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <p className="text-xs text-muted-foreground p-2 border-b">
        {platform === "og" ? "Facebook/LinkedIn Preview" : "Twitter Preview"}
      </p>
      {image && (
        <div className="aspect-video bg-muted relative">
          <img src={image} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium line-clamp-2">{title || "Title"}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description || "Description"}
        </p>
      </div>
    </div>
  );
}

// Get default schema type based on content type
function getDefaultSchemaType(contentType?: string): string {
  switch (contentType) {
    case "blog":
      return "BlogPosting";
    case "article":
      return "Article";
    case "resource":
      return "SoftwareApplication";
    case "course":
      return "Course";
    case "video":
      return "VideoObject";
    default:
      return "WebPage";
  }
}

// Get default OG type based on content type
function getDefaultOgType(contentType?: string): string {
  switch (contentType) {
    case "video":
      return "video.other";
    default:
      return "article";
  }
}

export function SEOFormSection({
  value,
  onChange,
  contentTitle = "",
  contentDescription = "",
  contentImage = "",
  contentType,
}: SEOFormSectionProps) {
  const [openSections, setOpenSections] = useState<string[]>(["basic"]);

  const updateField = useCallback((field: keyof SEOFormData, fieldValue: string | null) => {
    onChange({ ...value, [field]: fieldValue || null });
  }, [value, onChange]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // Auto-generate SEO defaults from content
  const handleAutoGenerate = useCallback(() => {
    const title = contentTitle || "";
    const description = contentDescription || "";
    const image = contentImage || "";

    const generated: SEOFormData = {
      metaTitle: title.slice(0, 60) || null,
      metaDescription: description.slice(0, 155) || null,
      ogTitle: title.slice(0, 90) || null,
      ogDescription: description.slice(0, 295) || null,
      ogImage: image || null,
      ogType: getDefaultOgType(contentType),
      twitterTitle: title.slice(0, 65) || null,
      twitterDescription: description.slice(0, 195) || null,
      twitterImage: image || null,
      twitterCard: "summary_large_image",
      robots: "index,follow",
      schemaType: getDefaultSchemaType(contentType),
    };

    onChange(generated);
  }, [contentTitle, contentDescription, contentImage, contentType, onChange]);

  // Use content values as fallbacks for preview
  const previewTitle = value.metaTitle || contentTitle;
  const previewDescription = value.metaDescription || contentDescription;
  const previewImage = value.ogImage || contentImage;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IoSearchOutline className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">SEO Settings</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoGenerate}
          disabled={!contentTitle && !contentDescription}
          className="gap-2"
        >
          <IoSparklesOutline className="h-4 w-4" />
          Auto-Generate
        </Button>
      </div>

      {/* Basic SEO */}
      <Collapsible open={openSections.includes("basic")} onOpenChange={() => toggleSection("basic")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <IoSearchOutline className="h-4 w-4" />
            <span className="font-medium text-sm">Basic SEO</span>
          </div>
          <IoChevronDownOutline className={cn("h-4 w-4 transition-transform", openSections.includes("basic") && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-metaTitle">Meta Title</Label>
              <CharacterCount current={value.metaTitle?.length || 0} max={60} />
            </div>
            <Input
              id="seo-metaTitle"
              value={value.metaTitle || ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              placeholder={contentTitle || "Enter meta title..."}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-metaDescription">Meta Description</Label>
              <CharacterCount current={value.metaDescription?.length || 0} max={160} />
            </div>
            <Textarea
              id="seo-metaDescription"
              value={value.metaDescription || ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              placeholder={contentDescription?.slice(0, 160) || "Enter meta description..."}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-canonicalUrl">Canonical URL</Label>
            <Input
              id="seo-canonicalUrl"
              value={value.canonicalUrl || ""}
              onChange={(e) => updateField("canonicalUrl", e.target.value)}
              placeholder="https://seanfilimon.com/page"
            />
          </div>

          <GooglePreview
            title={previewTitle}
            description={previewDescription}
            url={value.canonicalUrl || undefined}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Open Graph */}
      <Collapsible open={openSections.includes("og")} onOpenChange={() => toggleSection("og")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <IoGlobeOutline className="h-4 w-4" />
            <span className="font-medium text-sm">Open Graph (Facebook/LinkedIn)</span>
          </div>
          <IoChevronDownOutline className={cn("h-4 w-4 transition-transform", openSections.includes("og") && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-ogTitle">OG Title</Label>
              <CharacterCount current={value.ogTitle?.length || 0} max={95} />
            </div>
            <Input
              id="seo-ogTitle"
              value={value.ogTitle || ""}
              onChange={(e) => updateField("ogTitle", e.target.value)}
              placeholder={contentTitle || "Enter OG title..."}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-ogDescription">OG Description</Label>
              <CharacterCount current={value.ogDescription?.length || 0} max={300} />
            </div>
            <Textarea
              id="seo-ogDescription"
              value={value.ogDescription || ""}
              onChange={(e) => updateField("ogDescription", e.target.value)}
              placeholder={contentDescription || "Enter OG description..."}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-ogImage">OG Image URL</Label>
            <Input
              id="seo-ogImage"
              value={value.ogImage || ""}
              onChange={(e) => updateField("ogImage", e.target.value)}
              placeholder={contentImage || "https://example.com/image.jpg"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-ogType">OG Type</Label>
            <Select value={value.ogType || getDefaultOgType(contentType)} onValueChange={(v) => updateField("ogType", v)}>
              <SelectTrigger id="seo-ogType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="video.other">Video</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SocialPreview
            title={value.ogTitle || previewTitle}
            description={value.ogDescription || previewDescription}
            image={value.ogImage || previewImage}
            platform="og"
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Twitter Cards */}
      <Collapsible open={openSections.includes("twitter")} onOpenChange={() => toggleSection("twitter")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <IoLogoTwitter className="h-4 w-4" />
            <span className="font-medium text-sm">Twitter Card</span>
          </div>
          <IoChevronDownOutline className={cn("h-4 w-4 transition-transform", openSections.includes("twitter") && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-twitterTitle">Twitter Title</Label>
              <CharacterCount current={value.twitterTitle?.length || 0} max={70} />
            </div>
            <Input
              id="seo-twitterTitle"
              value={value.twitterTitle || ""}
              onChange={(e) => updateField("twitterTitle", e.target.value)}
              placeholder={contentTitle || "Enter Twitter title..."}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-twitterDescription">Twitter Description</Label>
              <CharacterCount current={value.twitterDescription?.length || 0} max={200} />
            </div>
            <Textarea
              id="seo-twitterDescription"
              value={value.twitterDescription || ""}
              onChange={(e) => updateField("twitterDescription", e.target.value)}
              placeholder={contentDescription || "Enter Twitter description..."}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-twitterImage">Twitter Image URL</Label>
            <Input
              id="seo-twitterImage"
              value={value.twitterImage || ""}
              onChange={(e) => updateField("twitterImage", e.target.value)}
              placeholder={contentImage || "https://example.com/image.jpg"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-twitterCard">Card Type</Label>
            <Select value={value.twitterCard || "summary_large_image"} onValueChange={(v) => updateField("twitterCard", v)}>
              <SelectTrigger id="seo-twitterCard">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                <SelectItem value="player">Player</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SocialPreview
            title={value.twitterTitle || previewTitle}
            description={value.twitterDescription || previewDescription}
            image={value.twitterImage || previewImage}
            platform="twitter"
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Advanced */}
      <Collapsible open={openSections.includes("advanced")} onOpenChange={() => toggleSection("advanced")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <IoSettingsOutline className="h-4 w-4" />
            <span className="font-medium text-sm">Advanced Settings</span>
          </div>
          <IoChevronDownOutline className={cn("h-4 w-4 transition-transform", openSections.includes("advanced") && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-robots">Robots Directive</Label>
            <Select value={value.robots || "index,follow"} onValueChange={(v) => updateField("robots", v)}>
              <SelectTrigger id="seo-robots">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index,follow">Index, Follow (Default)</SelectItem>
                <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                <SelectItem value="index,nofollow">Index, No Follow</SelectItem>
                <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Keywords</Label>
            <Input
              id="seo-keywords"
              value={value.keywords || ""}
              onChange={(e) => updateField("keywords", e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">Comma-separated keywords (less important for modern SEO)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-author">Author</Label>
            <Input
              id="seo-author"
              value={value.author || ""}
              onChange={(e) => updateField("author", e.target.value)}
              placeholder="Author name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-schemaType">Schema.org Type</Label>
            <Select value={value.schemaType || getDefaultSchemaType(contentType)} onValueChange={(v) => updateField("schemaType", v)}>
              <SelectTrigger id="seo-schemaType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Article">Article</SelectItem>
                <SelectItem value="BlogPosting">Blog Posting</SelectItem>
                <SelectItem value="NewsArticle">News Article</SelectItem>
                <SelectItem value="TechArticle">Tech Article</SelectItem>
                <SelectItem value="Course">Course</SelectItem>
                <SelectItem value="VideoObject">Video</SelectItem>
                <SelectItem value="SoftwareApplication">Software/App</SelectItem>
                <SelectItem value="WebPage">Web Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
