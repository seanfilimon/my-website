"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { trpc } from "@/src/lib/trpc/client";

type EntityType = "blog" | "article" | "resource" | "course" | "video";

interface SEOData {
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

interface SEOEditorProps {
  entityType: EntityType;
  entityId: string;
  contentTitle?: string;
  contentDescription?: string;
  contentImage?: string;
  onChange?: (data: SEOData) => void;
}

// Character limit indicators
function CharacterCount({ current, max, label }: { current: number; max: number; label: string }) {
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
          {url || "https://example.com/page"}
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

export function SEOEditor({
  entityType,
  entityId,
  contentTitle = "",
  contentDescription = "",
  contentImage = "",
  onChange,
}: SEOEditorProps) {
  const [seoData, setSeoData] = useState<SEOData>({});
  const [openSections, setOpenSections] = useState<string[]>(["basic"]);

  // Fetch existing SEO data
  const { data: existingSeo, isLoading } = trpc.seo.getByEntity.useQuery(
    { entityType, entityId },
    { enabled: !!entityId }
  );

  // Mutations
  const generateDefaults = trpc.seo.generateDefaults.useMutation();

  // Load existing data
  useEffect(() => {
    if (existingSeo) {
      setSeoData(existingSeo);
    }
  }, [existingSeo]);

  // Notify parent of changes
  useEffect(() => {
    onChange?.(seoData);
  }, [seoData, onChange]);

  const updateField = (field: keyof SEOData, value: string | null) => {
    setSeoData((prev) => ({ ...prev, [field]: value || null }));
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleGenerateDefaults = async () => {
    try {
      const generated = await generateDefaults.mutateAsync({ entityType, entityId });
      setSeoData(generated);
    } catch (error) {
      console.error("Failed to generate SEO defaults:", error);
    }
  };

  // Use content values as fallbacks for preview
  const previewTitle = seoData.metaTitle || contentTitle;
  const previewDescription = seoData.metaDescription || contentDescription;
  const previewImage = seoData.ogImage || contentImage;

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading SEO data...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IoSearchOutline className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">SEO Settings</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateDefaults}
          disabled={generateDefaults.isPending || !entityId}
          className="gap-2"
        >
          <IoSparklesOutline className="h-4 w-4" />
          {generateDefaults.isPending ? "Generating..." : "Auto-Generate"}
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
              <Label htmlFor="metaTitle">Meta Title</Label>
              <CharacterCount current={seoData.metaTitle?.length || 0} max={60} label="chars" />
            </div>
            <Input
              id="metaTitle"
              value={seoData.metaTitle || ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              placeholder={contentTitle || "Enter meta title..."}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <CharacterCount current={seoData.metaDescription?.length || 0} max={160} label="chars" />
            </div>
            <Textarea
              id="metaDescription"
              value={seoData.metaDescription || ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              placeholder={contentDescription?.slice(0, 160) || "Enter meta description..."}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input
              id="canonicalUrl"
              value={seoData.canonicalUrl || ""}
              onChange={(e) => updateField("canonicalUrl", e.target.value)}
              placeholder="https://example.com/page"
            />
          </div>

          <GooglePreview
            title={previewTitle}
            description={previewDescription}
            url={seoData.canonicalUrl || undefined}
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
              <Label htmlFor="ogTitle">OG Title</Label>
              <CharacterCount current={seoData.ogTitle?.length || 0} max={95} label="chars" />
            </div>
            <Input
              id="ogTitle"
              value={seoData.ogTitle || ""}
              onChange={(e) => updateField("ogTitle", e.target.value)}
              placeholder={contentTitle || "Enter OG title..."}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ogDescription">OG Description</Label>
              <CharacterCount current={seoData.ogDescription?.length || 0} max={300} label="chars" />
            </div>
            <Textarea
              id="ogDescription"
              value={seoData.ogDescription || ""}
              onChange={(e) => updateField("ogDescription", e.target.value)}
              placeholder={contentDescription || "Enter OG description..."}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogImage">OG Image URL</Label>
            <Input
              id="ogImage"
              value={seoData.ogImage || ""}
              onChange={(e) => updateField("ogImage", e.target.value)}
              placeholder={contentImage || "https://example.com/image.jpg"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogType">OG Type</Label>
            <Select value={seoData.ogType || "article"} onValueChange={(v) => updateField("ogType", v)}>
              <SelectTrigger>
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
            title={seoData.ogTitle || previewTitle}
            description={seoData.ogDescription || previewDescription}
            image={seoData.ogImage || previewImage}
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
              <Label htmlFor="twitterTitle">Twitter Title</Label>
              <CharacterCount current={seoData.twitterTitle?.length || 0} max={70} label="chars" />
            </div>
            <Input
              id="twitterTitle"
              value={seoData.twitterTitle || ""}
              onChange={(e) => updateField("twitterTitle", e.target.value)}
              placeholder={contentTitle || "Enter Twitter title..."}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="twitterDescription">Twitter Description</Label>
              <CharacterCount current={seoData.twitterDescription?.length || 0} max={200} label="chars" />
            </div>
            <Textarea
              id="twitterDescription"
              value={seoData.twitterDescription || ""}
              onChange={(e) => updateField("twitterDescription", e.target.value)}
              placeholder={contentDescription || "Enter Twitter description..."}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterImage">Twitter Image URL</Label>
            <Input
              id="twitterImage"
              value={seoData.twitterImage || ""}
              onChange={(e) => updateField("twitterImage", e.target.value)}
              placeholder={contentImage || "https://example.com/image.jpg"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterCard">Card Type</Label>
            <Select value={seoData.twitterCard || "summary_large_image"} onValueChange={(v) => updateField("twitterCard", v)}>
              <SelectTrigger>
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
            title={seoData.twitterTitle || previewTitle}
            description={seoData.twitterDescription || previewDescription}
            image={seoData.twitterImage || previewImage}
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
            <Label htmlFor="robots">Robots Directive</Label>
            <Select value={seoData.robots || "index,follow"} onValueChange={(v) => updateField("robots", v)}>
              <SelectTrigger>
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
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              value={seoData.keywords || ""}
              onChange={(e) => updateField("keywords", e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">Comma-separated keywords (less important for modern SEO)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={seoData.author || ""}
              onChange={(e) => updateField("author", e.target.value)}
              placeholder="Author name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schemaType">Schema.org Type</Label>
            <Select value={seoData.schemaType || "Article"} onValueChange={(v) => updateField("schemaType", v)}>
              <SelectTrigger>
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
