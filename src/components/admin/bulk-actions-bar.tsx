"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  IoCheckmarkCircleOutline,
  IoArchiveOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoSwapHorizontalOutline,
  IoStarOutline,
  IoRemoveCircleOutline,
} from "react-icons/io5";
import { ContentType, CONTENT_TYPE_CONFIGS } from "@/src/lib/admin/types";
import { cn } from "@/src/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  activeType: ContentType;
  onChangeResource?: (resourceId: string) => void;
  onToggleFeatured?: (featured: boolean) => void;
  isPublishing?: boolean;
  isArchiving?: boolean;
}

// Mock resources for bulk change
const RESOURCES = [
  { id: "nextjs", name: "Next.js" },
  { id: "react", name: "React" },
  { id: "typescript", name: "TypeScript" },
  { id: "nodejs", name: "Node.js" },
];

export function BulkActionsBar({
  selectedCount,
  onPublish,
  onArchive,
  onDelete,
  onClearSelection,
  activeType,
  onChangeResource,
  onToggleFeatured,
  isPublishing = false,
  isArchiving = false,
}: BulkActionsBarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const config = CONTENT_TYPE_CONFIGS[activeType];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border",
          "bg-card/95 backdrop-blur-sm",
          "animate-in slide-in-from-bottom-4 fade-in duration-200"
        )}
      >
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r">
          <Badge variant="secondary" className="h-6 px-2">
            {selectedCount}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {selectedCount === 1 ? config.label : config.labelPlural} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Publish (only for types with status) */}
          {config.hasStatus && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={onPublish}
              disabled={isPublishing}
            >
              <IoCheckmarkCircleOutline className="h-4 w-4" />
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          )}

          {/* Archive (only for types with status) */}
          {config.hasStatus && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onArchive}
              disabled={isArchiving}
            >
              <IoArchiveOutline className="h-4 w-4" />
              {isArchiving ? "Archiving..." : "Archive"}
            </Button>
          )}

          {/* Change Resource (only for types with resource) */}
          {config.hasResource && onChangeResource && (
            <Select onValueChange={onChangeResource}>
              <SelectTrigger className="w-40 h-8">
                <div className="flex items-center gap-2">
                  <IoSwapHorizontalOutline className="h-4 w-4" />
                  <span className="text-sm">Change Resource</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {RESOURCES.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Toggle Featured */}
          {onToggleFeatured && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onToggleFeatured(true)}
              >
                <IoStarOutline className="h-4 w-4" />
                Feature
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onToggleFeatured(false)}
              >
                <IoRemoveCircleOutline className="h-4 w-4" />
                Unfeature
              </Button>
            </>
          )}

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <IoTrashOutline className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {selectedCount} {selectedCount === 1 ? config.label : config.labelPlural}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the selected{" "}
                  {config.labelPlural.toLowerCase()} and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : `Delete ${selectedCount} items`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Clear selection */}
        <div className="pl-3 border-l">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={onClearSelection}
          >
            <IoCloseOutline className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
