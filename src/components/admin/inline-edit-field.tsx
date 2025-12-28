"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { IoCheckmarkOutline, IoCloseOutline, IoCreateOutline } from "react-icons/io5";
import { ContentStatus } from "@/src/lib/admin/types";

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
}

interface InlineEditStatusProps {
  value: ContentStatus;
  onSave: (value: ContentStatus) => void;
}

interface InlineEditBadgeProps {
  value: boolean;
  label: string;
  onSave: (value: boolean) => void;
}

// Text field inline edit
export function InlineEditField({
  value,
  onSave,
  className,
  placeholder = "Enter value...",
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = useCallback(() => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className="h-7 text-sm px-2"
        />
        <button
          onClick={handleSave}
          className="p-1 rounded hover:bg-green-500/10 text-green-600"
        >
          <IoCheckmarkOutline className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 rounded hover:bg-red-500/10 text-red-600"
        >
          <IoCloseOutline className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "group/inline cursor-text hover:bg-muted/50 rounded px-1 -mx-1 inline-flex items-center gap-1",
        className
      )}
      onDoubleClick={handleDoubleClick}
      title="Double-click to edit"
    >
      {value || <span className="text-muted-foreground italic">{placeholder}</span>}
      <IoCreateOutline className="h-3 w-3 text-muted-foreground opacity-0 group-hover/inline:opacity-100 transition-opacity" />
    </span>
  );
}

// Status inline edit
export function InlineEditStatus({ value, onSave }: InlineEditStatusProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20";
      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20";
      case "ARCHIVED":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20";
    }
  };

  if (isEditing) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Select
          value={value}
          onValueChange={(newValue) => {
            onSave(newValue as ContentStatus);
            setIsEditing(false);
          }}
          onOpenChange={(open) => {
            if (!open) setIsEditing(false);
          }}
          defaultOpen
        >
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-pointer transition-colors",
        getStatusColor(value)
      )}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Click to change status"
    >
      {value.toLowerCase()}
    </Badge>
  );
}

// Boolean badge inline edit (for featured, published, etc.)
export function InlineEditBadge({ value, label, onSave }: InlineEditBadgeProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSave(!value);
    },
    [value, onSave]
  );

  return (
    <Badge
      variant={value ? "default" : "outline"}
      className={cn(
        "cursor-pointer transition-all",
        value
          ? "bg-primary text-primary-foreground hover:bg-primary/80"
          : "text-muted-foreground hover:bg-muted"
      )}
      onClick={handleClick}
      title={`Click to ${value ? "disable" : "enable"} ${label.toLowerCase()}`}
    >
      {label}
    </Badge>
  );
}

// Tags inline edit
interface InlineEditTagsProps {
  tags: { id: string; name: string }[];
  onSave: (tags: string[]) => void;
  availableTags?: { id: string; name: string }[];
}

export function InlineEditTags({
  tags,
  onSave,
  availableTags = [],
}: InlineEditTagsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddTag = useCallback(() => {
    if (inputValue.trim()) {
      const newTags = [...tags.map((t) => t.name), inputValue.trim()];
      onSave(newTags);
      setInputValue("");
    }
  }, [inputValue, tags, onSave]);

  const handleRemoveTag = useCallback(
    (tagName: string) => {
      const newTags = tags.filter((t) => t.name !== tagName).map((t) => t.name);
      onSave(newTags);
    },
    [tags, onSave]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTag();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsEditing(false);
        setInputValue("");
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        handleRemoveTag(tags[tags.length - 1].name);
      }
    },
    [handleAddTag, inputValue, tags, handleRemoveTag]
  );

  return (
    <div
      className="flex flex-wrap items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="gap-1 text-xs cursor-default"
        >
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.name)}
            className="hover:text-destructive"
          >
            <IoCloseOutline className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              handleAddTag();
            }
            setIsEditing(false);
          }}
          placeholder="Add tag..."
          className="h-6 w-24 text-xs px-2"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded hover:bg-muted"
        >
          + Add tag
        </button>
      )}
    </div>
  );
}
