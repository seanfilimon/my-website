"use client";

import { ContentType, CONTENT_TYPE_CONFIGS } from "@/src/lib/admin/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/src/lib/utils";
import {
  IoNewspaperOutline,
  IoDocumentTextOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoLibraryOutline,
  IoBriefcaseOutline,
} from "react-icons/io5";

interface ContentTypeSelectorProps {
  activeType: ContentType;
  onTypeChange: (type: ContentType) => void;
  counts: Record<ContentType, number>;
}

const CONTENT_TYPE_ICONS: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  blogs: IoNewspaperOutline,
  articles: IoDocumentTextOutline,
  courses: IoBookOutline,
  videos: IoPlayCircleOutline,
  resources: IoLibraryOutline,
  experiences: IoBriefcaseOutline,
};

const CONTENT_TYPES: ContentType[] = [
  "blogs",
  "articles",
  "courses",
  "videos",
  "resources",
  "experiences",
];

export function ContentTypeSelector({
  activeType,
  onTypeChange,
  counts,
}: ContentTypeSelectorProps) {
  return (
    <div className="border-b bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {CONTENT_TYPES.map((type) => {
          const config = CONTENT_TYPE_CONFIGS[type];
          const Icon = CONTENT_TYPE_ICONS[type];
          const isActive = activeType === type;
          const count = counts[type];

          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                "hover:bg-muted/50",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{config.labelPlural}</span>
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className={cn(
                  "h-5 px-1.5 text-xs font-medium",
                  isActive && "bg-primary-foreground/20 text-primary-foreground"
                )}
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
