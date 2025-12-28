"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IoAddOutline,
  IoEyeOutline,
  IoHeartOutline,
  IoChatbubbleOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoArchiveOutline,
  IoReorderThreeOutline,
  IoStarOutline,
} from "react-icons/io5";
import {
  ContentType,
  ContentItem,
  CONTENT_TYPE_CONFIGS,
  ContentStatus,
} from "@/src/lib/admin/types";
import { InlineEditField } from "./inline-edit-field";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";

interface ContentListProps {
  items: ContentItem[];
  activeType: ContentType;
  selectedIds: Set<string>;
  onItemClick: (item: ContentItem) => void;
  onSelectionChange: (id: string, shiftKey?: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onCreateNew: () => void;
  onReorder: (items: ContentItem[]) => void;
  onInlineEdit: (id: string, field: string, value: any) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
}

interface SortableItemProps {
  item: ContentItem;
  activeType: ContentType;
  isSelected: boolean;
  onItemClick: (item: ContentItem) => void;
  onSelectionChange: (id: string, shiftKey?: boolean) => void;
  onInlineEdit: (id: string, field: string, value: any) => void;
}

function getStatusIcon(status: ContentStatus) {
  switch (status) {
    case "PUBLISHED":
      return <IoCheckmarkCircleOutline className="h-3 w-3" />;
    case "DRAFT":
      return <IoTimeOutline className="h-3 w-3" />;
    case "ARCHIVED":
      return <IoArchiveOutline className="h-3 w-3" />;
  }
}

function getStatusColor(status: ContentStatus) {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-500/10 text-green-700 border-green-500/20";
    case "DRAFT":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    case "ARCHIVED":
      return "bg-gray-500/10 text-gray-700 border-gray-500/20";
  }
}

function getItemTitle(item: ContentItem): string {
  if ("title" in item) return item.title;
  if ("name" in item) return (item as any).name;
  return "Untitled";
}

function getItemSubtitle(item: ContentItem, activeType: ContentType): string {
  switch (activeType) {
    case "blogs":
    case "articles":
      return (item as any).excerpt?.slice(0, 80) + "..." || "";
    case "courses":
      return (item as any).subtitle || (item as any).description?.slice(0, 80) + "...";
    case "videos":
      return (item as any).description?.slice(0, 80) + "..." || "";
    case "resources":
      return (item as any).description?.slice(0, 80) + "..." || "";
    case "experiences":
      return (item as any).subtitle || (item as any).organization || "";
    default:
      return "";
  }
}

function SortableItem({
  item,
  activeType,
  isSelected,
  onItemClick,
  onSelectionChange,
  onInlineEdit,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = CONTENT_TYPE_CONFIGS[activeType];
  const title = getItemTitle(item);
  const subtitle = getItemSubtitle(item, activeType);
  const status = "status" in item ? (item as any).status as ContentStatus : null;
  const featured = "featured" in item ? (item as any).featured : false;
  const views = "views" in item ? (item as any).views : null;
  const likes = "likes" in item ? (item as any).likes : null;
  const comments = "_count" in item ? (item as any)._count?.comments : null;
  const resource = "resource" in item ? (item as any).resource : null;
  const createdAt = "createdAt" in item ? new Date((item as any).createdAt) : null;
  
  // Get thumbnail/image for preview
  const thumbnail = "thumbnail" in item ? (item as any).thumbnail : null;
  const coverImage = "coverImage" in item ? (item as any).coverImage : null;
  const itemImage = "image" in item ? (item as any).image : null;
  const previewImage = thumbnail || coverImage || itemImage;
  
  // For resources, get icon info
  const icon = "icon" in item ? (item as any).icon : null;
  const iconUrl = "iconUrl" in item ? (item as any).iconUrl : null;
  const color = "color" in item ? (item as any).color : null;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(item.id, e.shiftKey);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-3 p-3 border-b cursor-pointer transition-colors",
        "hover:bg-muted/50",
        isSelected && "bg-primary/5",
        isDragging && "opacity-50 bg-muted"
      )}
      onClick={() => onItemClick(item)}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <IoReorderThreeOutline className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Checkbox */}
      <div className="mt-1" onClick={handleCheckboxClick}>
        <Checkbox checked={isSelected} />
      </div>

      {/* Thumbnail/Icon Preview */}
      <div className="shrink-0">
        {previewImage ? (
          <div className="relative h-12 w-16 rounded overflow-hidden bg-muted">
            <Image
              src={previewImage}
              alt={title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : iconUrl ? (
          <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
            <Image
              src={iconUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        ) : icon && color ? (
          <div
            className="h-10 w-10 rounded flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {icon}
          </div>
        ) : activeType === "resources" ? (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-lg">
            📦
          </div>
        ) : ["blogs", "articles", "courses", "videos"].includes(activeType) ? (
          <div className="h-12 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground">
            <IoEyeOutline className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title Row */}
        <div className="flex items-center gap-2 mb-1">
          <InlineEditField
            value={title}
            onSave={(value) => onInlineEdit(item.id, "title", value)}
            className="font-medium text-sm truncate"
          />
          {featured && (
            <Badge variant="secondary" className="gap-1 h-5 text-xs">
              <IoStarOutline className="h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {subtitle}
          </p>
        )}

        {/* Meta Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Status Badge */}
          {status && (
            <Badge
              variant="outline"
              className={cn("gap-1 h-5 text-xs", getStatusColor(status))}
            >
              {getStatusIcon(status)}
              {status.toLowerCase()}
            </Badge>
          )}

          {/* Resource Badge */}
          {resource && (
            <Badge variant="outline" className="h-5 text-xs gap-1">
              {resource.iconUrl ? (
                <span className="w-3 h-3 rounded overflow-hidden relative flex-shrink-0">
                  <Image
                    src={resource.iconUrl}
                    alt={resource.name}
                    fill
                    className="object-contain"
                    sizes="12px"
                  />
                </span>
              ) : (
                <span
                  className="w-3 h-3 rounded flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                  style={{ backgroundColor: resource.color, color: "#fff" }}
                >
                  {resource.icon}
                </span>
              )}
              {resource.name}
            </Badge>
          )}

          {/* Stats */}
          {views !== null && (
            <span className="flex items-center gap-1">
              <IoEyeOutline className="h-3 w-3" />
              {views.toLocaleString()}
            </span>
          )}
          {likes !== null && (
            <span className="flex items-center gap-1">
              <IoHeartOutline className="h-3 w-3" />
              {likes}
            </span>
          )}
          {comments !== null && (
            <span className="flex items-center gap-1">
              <IoChatbubbleOutline className="h-3 w-3" />
              {comments}
            </span>
          )}

          {/* Date */}
          {createdAt && (
            <span className="ml-auto">
              {format(createdAt, "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemOverlay({ item, activeType }: { item: ContentItem; activeType: ContentType }) {
  const title = getItemTitle(item);
  const status = "status" in item ? (item as any).status as ContentStatus : null;

  return (
    <div className="flex items-center gap-3 p-3 bg-card border rounded-lg shadow-lg">
      <IoReorderThreeOutline className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-sm">{title}</span>
      {status && (
        <Badge
          variant="outline"
          className={cn("gap-1 h-5 text-xs", getStatusColor(status))}
        >
          {status.toLowerCase()}
        </Badge>
      )}
    </div>
  );
}

export function ContentList({
  items,
  activeType,
  selectedIds,
  onItemClick,
  onSelectionChange,
  onSelectAll,
  onClearSelection,
  onCreateNew,
  onReorder,
  onInlineEdit,
  isAllSelected,
  isSomeSelected,
}: ContentListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const config = CONTENT_TYPE_CONFIGS[activeType];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
      }
    },
    [items, onReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

  return (
    <div className="h-full flex flex-col bg-card/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll();
              } else {
                onClearSelection();
              }
            }}
            className={cn(isSomeSelected && "data-[state=checked]:bg-muted")}
          />
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? config.label.toLowerCase() : config.labelPlural.toLowerCase()}
          </span>
        </div>
        <Button size="sm" className="gap-2" onClick={onCreateNew}>
          <IoAddOutline className="h-4 w-4" />
          New {config.label}
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <p className="text-muted-foreground mb-4">
              No {config.labelPlural.toLowerCase()} found
            </p>
            <Button size="sm" variant="outline" onClick={onCreateNew}>
              <IoAddOutline className="h-4 w-4 mr-2" />
              Create your first {config.label.toLowerCase()}
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  activeType={activeType}
                  isSelected={selectedIds.has(item.id)}
                  onItemClick={onItemClick}
                  onSelectionChange={onSelectionChange}
                  onInlineEdit={onInlineEdit}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeItem && (
                <ItemOverlay item={activeItem} activeType={activeType} />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </ScrollArea>
    </div>
  );
}
