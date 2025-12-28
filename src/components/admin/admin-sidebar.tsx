"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  IoSearchOutline,
  IoAddOutline,
  IoNewspaperOutline,
  IoDocumentTextOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoLibraryOutline,
  IoBriefcaseOutline,
  IoCloseOutline,
  IoStarOutline,
  IoTimeOutline,
  IoImagesOutline,
} from "react-icons/io5";
import Link from "next/link";
import { ContentType, CONTENT_TYPE_CONFIGS } from "@/src/lib/admin/types";
import { cn } from "@/src/lib/utils";

interface AdminSidebarProps {
  activeType: ContentType;
  onTypeChange: (type: ContentType) => void;
  counts: Record<ContentType, number>;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
}

const CONTENT_TYPE_ICONS: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  blogs: IoNewspaperOutline,
  articles: IoDocumentTextOutline,
  courses: IoBookOutline,
  videos: IoPlayCircleOutline,
  resources: IoLibraryOutline,
  experiences: IoBriefcaseOutline,
  authors: IoDocumentTextOutline,
  assets: IoImagesOutline,
};

const CONTENT_TYPES: ContentType[] = [
  "blogs",
  "articles",
  "courses",
  "videos",
  "resources",
  "experiences",
];

export function AdminSidebar({
  activeType,
  onTypeChange,
  counts,
  searchValue,
  onSearchChange,
  onCreateNew,
}: AdminSidebarProps) {
  const config = CONTENT_TYPE_CONFIGS[activeType];

  return (
    <div className="w-52 h-full border-r bg-card/30 flex flex-col shrink-0">
      {/* Search */}
      <div className="p-2 border-b">
        <div className="relative">
          <IoSearchOutline className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IoCloseOutline className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b">
        <Button
          onClick={onCreateNew}
          className="w-full gap-1.5 h-8 text-xs"
          size="sm"
        >
          <IoAddOutline className="h-3.5 w-3.5" />
          New {config.label}
        </Button>
      </div>

      {/* Content Types */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 px-2 uppercase tracking-wide">
            Content
          </p>
          <nav className="space-y-0.5">
            {CONTENT_TYPES.map((type) => {
              const typeConfig = CONTENT_TYPE_CONFIGS[type];
              const Icon = CONTENT_TYPE_ICONS[type];
              const isActive = activeType === type;
              const count = counts[type];

              return (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="font-medium text-xs">{typeConfig.labelPlural}</span>
                  </div>
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className={cn(
                      "h-4 px-1 text-[10px] font-medium",
                      isActive && "bg-primary-foreground/20 text-primary-foreground"
                    )}
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </nav>
        </div>

        <Separator className="my-1" />

        {/* Media Library */}
        <div className="p-2">
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 px-2 uppercase tracking-wide">
            Media
          </p>
          <nav className="space-y-0.5">
            <Link
              href="/admin/assets"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              <IoImagesOutline className="h-3.5 w-3.5" />
              <span>Asset Library</span>
            </Link>
          </nav>
        </div>

        <Separator className="my-1" />

        {/* Quick Filters */}
        <div className="p-2">
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 px-2 uppercase tracking-wide">
            Filters
          </p>
          <nav className="space-y-0.5">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors">
              <IoStarOutline className="h-3.5 w-3.5" />
              <span>Featured</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors">
              <IoTimeOutline className="h-3.5 w-3.5" />
              <span>Drafts</span>
            </button>
          </nav>
        </div>
      </ScrollArea>
    </div>
  );
}
