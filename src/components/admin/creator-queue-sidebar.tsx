"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  IoAddOutline,
  IoNewspaperOutline,
  IoDocumentTextOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoLibraryOutline,
  IoBriefcaseOutline,
  IoPersonOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoSyncOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { ContentType, CONTENT_TYPE_CONFIGS } from "@/src/lib/admin/types";
import { QueueItem, QueueItemStatus } from "@/src/lib/admin/use-creator-queue";
import { cn } from "@/src/lib/utils";

// Icon mapping for content types
const TYPE_ICONS: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  blogs: IoNewspaperOutline,
  articles: IoDocumentTextOutline,
  courses: IoBookOutline,
  videos: IoPlayCircleOutline,
  resources: IoLibraryOutline,
  experiences: IoBriefcaseOutline,
  authors: IoPersonOutline,
};

// Status indicator component
function StatusIndicator({ status }: { status: QueueItemStatus }) {
  switch (status) {
    case "saving":
      return <IoSyncOutline className="h-3 w-3 text-blue-500 animate-spin" />;
    case "saved":
      return <IoCheckmarkCircleOutline className="h-3 w-3 text-green-500" />;
    case "error":
      return <IoAlertCircleOutline className="h-3 w-3 text-red-500" />;
    default:
      return null;
  }
}

interface CreatorQueueSidebarProps {
  queue: QueueItem[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onAddItem: (type: ContentType) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  getItemTitle: (item: QueueItem) => string;
}

export function CreatorQueueSidebar({
  queue,
  activeItemId,
  onSelectItem,
  onAddItem,
  onRemoveItem,
  onClearAll,
  getItemTitle,
}: CreatorQueueSidebarProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const contentTypes: ContentType[] = [
    "blogs",
    "articles",
    "courses",
    "videos",
    "resources",
    "experiences",
  ];

  return (
    <div className="w-52 border-r bg-card/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-xs">Queue</h2>
          <Badge variant="secondary" className="text-[10px] h-4 px-1">
            {queue.length}
          </Badge>
        </div>

        {/* Add New Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full gap-1.5 h-8 text-xs" size="sm">
              <IoAddOutline className="h-3.5 w-3.5" />
              Add New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {contentTypes.map((type) => {
              const config = CONTENT_TYPE_CONFIGS[type];
              const Icon = TYPE_ICONS[type];
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onAddItem(type)}
                  className="gap-2 text-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{config.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Queue List */}
      <ScrollArea className="flex-1">
        <div className="p-1.5">
          {queue.length === 0 ? (
            <div className="text-center py-6 px-2">
              <p className="text-xs text-muted-foreground mb-1">
                No items in queue
              </p>
              <p className="text-[10px] text-muted-foreground">
                Click "Add New" to start
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {queue.map((item) => {
                const config = CONTENT_TYPE_CONFIGS[item.type];
                const Icon = TYPE_ICONS[item.type];
                const isActive = item.id === activeItemId;
                const title = getItemTitle(item);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => onSelectItem(item.id)}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{title}</p>
                      <p
                        className={cn(
                          "text-[10px] truncate",
                          isActive
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {config.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <StatusIndicator status={item.status} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity",
                          isActive && "hover:bg-primary-foreground/20"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.id);
                        }}
                      >
                        <IoCloseOutline className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {queue.length > 0 && (
        <div className="p-2 border-t">
          <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <IoTrashOutline className="h-3.5 w-3.5" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all items?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {queue.length} items from your creation queue.
                  Any unsaved changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onClearAll();
                    setClearDialogOpen(false);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
