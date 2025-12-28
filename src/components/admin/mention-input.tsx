"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import {
  Package,
  FolderOpen,
  FileText,
  BookOpen,
  Loader2,
  X,
} from "lucide-react";

export interface Mention {
  id: string;
  type: "resource" | "category" | "blog" | "article";
  name: string;
  startIndex: number;
  endIndex: number;
  icon?: string;
  iconUrl?: string;
  color?: string;
}

export interface MentionItem {
  id: string;
  type: "resource" | "category" | "blog" | "article";
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  color?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange?: (mentions: Mention[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  rows?: number;
}

// Store mention metadata globally to persist across re-renders
const mentionDataCache = new Map<string, MentionItem>();

/**
 * Rich textarea with # mention support and visual mention chips
 */
export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  disabled,
  className,
  onKeyDown,
  rows = 2,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MentionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse mentions from value
  const parseMentions = useCallback((text: string): Mention[] => {
    const mentions: Mention[] = [];
    const regex = /#\[([^\]]+)\]\((\w+):([^)]+)\)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const id = match[3];
      const type = match[2] as Mention["type"];
      const data = mentionDataCache.get(`${type}:${id}`);
      mentions.push({
        id,
        type,
        name: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        icon: data?.icon,
        iconUrl: data?.iconUrl,
        color: data?.color,
      });
    }
    return mentions;
  }, []);

  // Notify parent of mention changes
  useEffect(() => {
    const mentions = parseMentions(value);
    onMentionsChange?.(mentions);
  }, [value, parseMentions, onMentionsChange]);

  // Search for mentions
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    const searchMentions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/mentions?q=${encodeURIComponent(searchQuery)}&limit=6`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.items || []);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Failed to search mentions:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchMentions, 150);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Check if we're typing after a #
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const hashIndex = textBeforeCursor.lastIndexOf("#");

    if (hashIndex !== -1) {
      const textAfterHash = textBeforeCursor.slice(hashIndex + 1);
      // Check if there's no space after # (still typing the mention)
      if (!textAfterHash.includes(" ") && !textAfterHash.includes("\n")) {
        // Check if this # is not part of an existing mention
        const beforeHash = textBeforeCursor.slice(0, hashIndex);
        if (!beforeHash.endsWith("[") && !textAfterHash.startsWith("[")) {
          setMentionStartIndex(hashIndex);
          setSearchQuery(textAfterHash);
          setShowDropdown(true);
          return;
        }
      }
    }

    setShowDropdown(false);
    setSearchQuery("");
    setMentionStartIndex(null);
  };

  // Find if cursor is inside a mention and return the end position
  const getMentionBoundary = useCallback((cursorPos: number, text: string): number | null => {
    const regex = /#\[([^\]]+)\]\((\w+):([^)]+)\)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      // If cursor is inside this mention, return the end position
      if (cursorPos > start && cursorPos < end) {
        return end;
      }
    }
    return null;
  }, []);

  // Normalize cursor position - move it outside of any mention
  const normalizeCursorPosition = useCallback(() => {
    if (!hiddenInputRef.current) return;
    
    const cursorPos = hiddenInputRef.current.selectionStart;
    const selectionEnd = hiddenInputRef.current.selectionEnd;
    
    // Only normalize if it's a cursor (not a selection)
    if (cursorPos !== selectionEnd) return;
    
    const boundary = getMentionBoundary(cursorPos, value);
    if (boundary !== null) {
      // Move cursor to after the mention
      hiddenInputRef.current.setSelectionRange(boundary, boundary);
    }
  }, [value, getMentionBoundary]);

  // Insert a mention
  const insertMention = useCallback((item: MentionItem) => {
    if (mentionStartIndex === null || !hiddenInputRef.current) return;

    // Store mention data for rendering
    mentionDataCache.set(`${item.type}:${item.id}`, item);

    const cursorPos = hiddenInputRef.current.selectionStart;
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(cursorPos).trimStart(); // Trim any leading space
    const mentionText = `#[${item.name}](${item.type}:${item.id})`;

    // Add spacing after the mention to clearly separate it from following text
    // Using a visible separator that makes it clear the user is typing outside the mention
    const separator = "  "; // Double space for clear separation
    const newValue = beforeMention + mentionText + separator + afterMention;
    onChange(newValue);

    setShowDropdown(false);
    setSearchQuery("");
    setMentionStartIndex(null);

    // Focus and set cursor position after the mention + separator
    requestAnimationFrame(() => {
      if (hiddenInputRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length + separator.length;
        hiddenInputRef.current.focus();
        hiddenInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  }, [mentionStartIndex, value, onChange]);

  // Handle keyboard navigation
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown && searchResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(searchResults[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowDropdown(false);
        return;
      }
    }

    // Handle left/right arrow keys to skip over mentions
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !e.shiftKey && hiddenInputRef.current) {
      const cursorPos = hiddenInputRef.current.selectionStart;
      const selectionEnd = hiddenInputRef.current.selectionEnd;
      
      // Only handle if it's a cursor (not a selection)
      if (cursorPos === selectionEnd) {
        const regex = /#\[([^\]]+)\]\((\w+):([^)]+)\)/g;
        let match;
        
        while ((match = regex.exec(value)) !== null) {
          const start = match.index;
          const end = match.index + match[0].length;
          
          if (e.key === "ArrowRight") {
            // If cursor is at or just before a mention, skip to end
            if (cursorPos >= start && cursorPos < end) {
              e.preventDefault();
              hiddenInputRef.current.setSelectionRange(end, end);
              return;
            }
          } else if (e.key === "ArrowLeft") {
            // If cursor is at or just after a mention, skip to start
            if (cursorPos > start && cursorPos <= end) {
              e.preventDefault();
              hiddenInputRef.current.setSelectionRange(start, start);
              return;
            }
          }
        }
      }
    }

    // Handle backspace to delete entire mention
    if (e.key === "Backspace" && hiddenInputRef.current) {
      const cursorPos = hiddenInputRef.current.selectionStart;
      const selectionEnd = hiddenInputRef.current.selectionEnd;
      
      // Only handle if it's a cursor (not a selection)
      if (cursorPos === selectionEnd && cursorPos > 0) {
        const regex = /#\[([^\]]+)\]\((\w+):([^)]+)\)/g;
        let match;
        
        while ((match = regex.exec(value)) !== null) {
          const start = match.index;
          const end = match.index + match[0].length;
          
          // If cursor is right after a mention, delete the whole mention
          if (cursorPos === end) {
            e.preventDefault();
            const newValue = value.slice(0, start) + value.slice(end);
            onChange(newValue);
            // Set cursor to where the mention started
            requestAnimationFrame(() => {
              if (hiddenInputRef.current) {
                hiddenInputRef.current.setSelectionRange(start, start);
              }
            });
            return;
          }
        }
      }
    }

    // Pass through to parent handler (cast to div event for compatibility)
    onKeyDown?.(e as unknown as React.KeyboardEvent<HTMLDivElement>);
  };

  // Remove a mention
  const removeMention = useCallback((startIndex: number, endIndex: number) => {
    const newValue = value.slice(0, startIndex) + value.slice(endIndex);
    onChange(newValue.trim() || "");
    
    // Refocus the input
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 0);
  }, [value, onChange]);

  // Render the display content with chips, cursor, and selection highlighting
  const renderDisplayContent = (showCursor = false, selStart = 0, selEnd = 0) => {
    const hasSelection = selStart !== selEnd;
    const cursorPos = selStart; // Cursor is at selection start
    
    if (!value) {
      // Show cursor even when empty
      if (showCursor && !hasSelection) {
        return <span className="inline-block w-[2px] h-[14px] bg-foreground animate-[blink_1s_infinite] align-middle" />;
      }
      return null;
    }

    const parts: React.ReactNode[] = [];
    const regex = /#\[([^\]]+)\]\((\w+):([^)]+)\)/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    let cursorInserted = false;

    // Helper to render text with selection highlighting and cursor
    const renderTextSegment = (text: string, textStartIndex: number) => {
      const textEndIndex = textStartIndex + text.length;
      const segments: React.ReactNode[] = [];
      let segmentKey = 0;
      
      // Calculate overlap with selection
      const overlapStart = Math.max(textStartIndex, selStart);
      const overlapEnd = Math.min(textEndIndex, selEnd);
      const hasOverlap = hasSelection && overlapStart < overlapEnd;
      
      if (hasOverlap) {
        // Text before selection
        if (overlapStart > textStartIndex) {
          const beforeText = text.slice(0, overlapStart - textStartIndex);
          segments.push(<span key={`seg-${segmentKey++}`}>{beforeText}</span>);
        }
        
        // Show cursor at selection start if it's in this segment
        if (showCursor && !cursorInserted && cursorPos >= textStartIndex && cursorPos <= textEndIndex && cursorPos === selStart) {
          segments.push(
            <span key={`cursor-${segmentKey++}`} className="inline-block w-[2px] h-[14px] bg-foreground animate-[blink_1s_infinite] align-middle" />
          );
          cursorInserted = true;
        }
        
        // Selected text
        const selectedText = text.slice(overlapStart - textStartIndex, overlapEnd - textStartIndex);
        segments.push(
          <span key={`sel-${segmentKey++}`} className="bg-primary/30 rounded-sm">
            {selectedText}
          </span>
        );
        
        // Text after selection
        if (overlapEnd < textEndIndex) {
          const afterText = text.slice(overlapEnd - textStartIndex);
          segments.push(<span key={`seg-${segmentKey++}`}>{afterText}</span>);
        }
      } else {
        // No selection overlap - check for cursor
        if (showCursor && !hasSelection && !cursorInserted && cursorPos >= textStartIndex && cursorPos <= textEndIndex) {
          const relativePos = cursorPos - textStartIndex;
          const beforeCursor = text.slice(0, relativePos);
          const afterCursor = text.slice(relativePos);
          cursorInserted = true;
          segments.push(<span key={`seg-${segmentKey++}`}>{beforeCursor}</span>);
          segments.push(
            <span key={`cursor-${segmentKey++}`} className="inline-block w-[2px] h-[14px] bg-foreground animate-[blink_1s_infinite] align-middle" />
          );
          segments.push(<span key={`seg-${segmentKey++}`}>{afterCursor}</span>);
        } else {
          segments.push(<span key={`seg-${segmentKey++}`}>{text}</span>);
        }
      }
      
      return (
        <span key={`text-${key++}`} className="whitespace-pre-wrap">
          {segments}
        </span>
      );
    };

    while ((match = regex.exec(value)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(renderTextSegment(value.slice(lastIndex, match.index), lastIndex));
      }

      const name = match[1];
      const type = match[2] as MentionItem["type"];
      const id = match[3];
      const data = mentionDataCache.get(`${type}:${id}`);
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;

      // If cursor is right before the mention (and no selection), show it
      if (showCursor && !hasSelection && !cursorInserted && cursorPos === matchStart) {
        parts.push(
          <span key={`cursor-${key++}`} className="inline-block w-[2px] h-[14px] bg-foreground animate-[blink_1s_infinite] align-middle" />
        );
        cursorInserted = true;
      }

      // Check if mention is within selection
      const mentionInSelection = hasSelection && matchStart < selEnd && matchEnd > selStart;

      parts.push(
        <MentionChip
          key={`mention-${key++}`}
          name={name}
          type={type}
          icon={data?.icon}
          iconUrl={data?.iconUrl}
          color={data?.color}
          selected={mentionInSelection}
          onRemove={() => removeMention(matchStart, matchEnd)}
        />
      );

      // If cursor is right after the mention (and no selection), show it
      if (showCursor && !hasSelection && !cursorInserted && cursorPos === matchEnd) {
        parts.push(
          <span key={`cursor-${key++}`} className="inline-block w-[2px] h-[14px] bg-foreground animate-[blink_1s_infinite] align-middle" />
        );
        cursorInserted = true;
      }

      lastIndex = matchEnd;
    }

    // Add remaining text
    if (lastIndex < value.length) {
      parts.push(renderTextSegment(value.slice(lastIndex), lastIndex));
    }

    // If cursor is at the very end and not yet inserted (and no selection)
    if (showCursor && !hasSelection && !cursorInserted && cursorPos >= value.length) {
      parts.push(
        <span key={`cursor-end`} className="inline-block w-[2px] h-[14px] bg-foreground animate-[blink_1s_infinite] align-middle" />
      );
    }

    return parts;
  };

  // Get icon for mention type
  const getTypeIcon = (type: MentionItem["type"]) => {
    switch (type) {
      case "resource":
        return <Package className="size-3.5" />;
      case "category":
        return <FolderOpen className="size-3.5" />;
      case "blog":
        return <FileText className="size-3.5" />;
      case "article":
        return <BookOpen className="size-3.5" />;
    }
  };

  // Get color for mention type
  const getTypeColor = (type: MentionItem["type"]) => {
    switch (type) {
      case "resource":
        return "text-violet-500 bg-violet-500/10";
      case "category":
        return "text-amber-500 bg-amber-500/10";
      case "blog":
        return "text-blue-500 bg-blue-500/10";
      case "article":
        return "text-green-500 bg-green-500/10";
    }
  };

  // Get label for mention type
  const getTypeLabel = (type: MentionItem["type"]) => {
    switch (type) {
      case "resource":
        return "Resource";
      case "category":
        return "Category";
      case "blog":
        return "Blog";
      case "article":
        return "Article";
    }
  };

  // Check if value has any mentions
  const hasMentions = value.includes("#[");

  // Track cursor/selection position for visual indicator
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // Update selection tracking
  const updateSelection = useCallback(() => {
    if (hiddenInputRef.current) {
      setSelectionStart(hiddenInputRef.current.selectionStart);
      setSelectionEnd(hiddenInputRef.current.selectionEnd);
    }
  }, []);

  return (
    <div className="relative flex flex-col" ref={containerRef}>
      {/* Resize handle at top */}
      <div 
        className="h-1.5 cursor-ns-resize bg-transparent hover:bg-muted/50 transition-colors group flex items-center justify-center"
        onMouseDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const textarea = hiddenInputRef.current;
          if (!textarea) return;
          
          const startHeight = textarea.offsetHeight;
          
          const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = startY - moveEvent.clientY; // Inverted because dragging up should increase height
            const newHeight = Math.max(48, Math.min(300, startHeight + deltaY));
            textarea.style.height = `${newHeight}px`;
          };
          
          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        }}
      >
        <div className="w-8 h-0.5 rounded-full bg-border group-hover:bg-muted-foreground/50 transition-colors" />
      </div>

      <div className="relative flex-1">
        {/* Actual textarea - handles input but visually hidden when mentions exist */}
        <textarea
          ref={hiddenInputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDownInternal}
          onFocus={() => {
            setIsFocused(true);
            // Normalize cursor on focus with a small delay to let the browser set position first
            setTimeout(normalizeCursorPosition, 0);
            updateSelection();
          }}
          onBlur={() => setIsFocused(false)}
          onClick={() => {
            // Normalize cursor position when clicking
            setTimeout(normalizeCursorPosition, 0);
            setTimeout(updateSelection, 10);
          }}
          onSelect={() => {
            // Update selection tracking (don't normalize if user is selecting)
            updateSelection();
          }}
          onKeyUp={updateSelection}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          // Disable browser grammar/spell checking
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          className={cn(
            "w-full resize-none bg-transparent outline-none",
            // When we have mentions, completely hide the textarea visually
            // but keep it functional for input handling
            hasMentions && "text-transparent caret-transparent selection:bg-transparent",
            className
          )}
          style={{ 
            minHeight: `${rows * 24}px`,
          }}
        />
        
        {/* Visual Display Layer - shows chips and handles all visual rendering when mentions exist */}
        {hasMentions && (
          <div
            className="absolute inset-0 px-3 py-2.5 text-xs leading-relaxed overflow-hidden whitespace-pre-wrap wrap-break-word pointer-events-none"
            style={{ minHeight: `${rows * 24}px` }}
            aria-hidden="true"
          >
            {renderDisplayContent(isFocused, selectionStart, selectionEnd)}
          </div>
        )}
      </div>

      {/* Mention Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 bottom-full mb-1 z-50 bg-popover border rounded-md shadow-lg overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-3 px-3 text-xs text-muted-foreground text-center">
              {searchQuery ? "No results found" : "Type to search..."}
            </div>
          ) : (
            <ScrollArea className="max-h-[200px]">
              <div className="py-1">
                {searchResults.map((item, index) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => insertMention(item)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-muted/50 transition-colors",
                      index === selectedIndex && "bg-muted"
                    )}
                  >
                    {/* Icon/Logo */}
                    {item.iconUrl ? (
                      <div className="size-6 rounded overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.iconUrl}
                          alt={item.name}
                          width={24}
                          height={24}
                          className="size-full object-contain"
                        />
                      </div>
                    ) : item.icon ? (
                      <span className="size-6 flex items-center justify-center text-sm shrink-0">
                        {item.icon}
                      </span>
                    ) : (
                      <span className={cn("p-1 rounded shrink-0", getTypeColor(item.type))}>
                        {getTypeIcon(item.type)}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{item.name}</div>
                      {item.description && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground shrink-0">
                      {getTypeLabel(item.type)}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
          <div className="px-3 py-1.5 border-t bg-muted/30 text-[9px] text-muted-foreground flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mention Chip Component - displays a mention with icon/logo
 */
interface MentionChipProps {
  name: string;
  type: MentionItem["type"];
  icon?: string;
  iconUrl?: string;
  color?: string;
  selected?: boolean;
  onRemove?: () => void;
}

function MentionChip({ name, type, icon, iconUrl, color, selected, onRemove }: MentionChipProps) {
  const getChipColor = () => {
    // If selected, use primary color for highlight
    if (selected) {
      return { backgroundColor: "rgb(var(--primary) / 0.3)", borderColor: "rgb(var(--primary) / 0.5)" };
    }
    if (color) {
      return { backgroundColor: `${color}20`, borderColor: `${color}40` };
    }
    switch (type) {
      case "resource":
        return { backgroundColor: "rgb(139 92 246 / 0.1)", borderColor: "rgb(139 92 246 / 0.3)" };
      case "category":
        return { backgroundColor: "rgb(245 158 11 / 0.1)", borderColor: "rgb(245 158 11 / 0.3)" };
      case "blog":
        return { backgroundColor: "rgb(59 130 246 / 0.1)", borderColor: "rgb(59 130 246 / 0.3)" };
      case "article":
        return { backgroundColor: "rgb(34 197 94 / 0.1)", borderColor: "rgb(34 197 94 / 0.3)" };
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case "resource":
        return <Package className="size-3" />;
      case "category":
        return <FolderOpen className="size-3" />;
      case "blog":
        return <FileText className="size-3" />;
      case "article":
        return <BookOpen className="size-3" />;
    }
  };

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md border text-xs font-medium cursor-default select-none align-middle pointer-events-auto"
      style={getChipColor()}
    >
      {/* Icon/Logo */}
      {iconUrl ? (
        <span className="size-4 rounded overflow-hidden shrink-0 inline-flex items-center justify-center bg-background/50">
          <Image
            src={iconUrl}
            alt={name}
            width={16}
            height={16}
            className="size-full object-contain"
          />
        </span>
      ) : icon ? (
        <span className="size-4 flex items-center justify-center text-[10px] shrink-0">
          {icon}
        </span>
      ) : (
        <span className="size-4 flex items-center justify-center shrink-0 opacity-70">
          {getDefaultIcon()}
        </span>
      )}
      <span className="truncate max-w-[120px]">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="size-3.5 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors -mr-0.5 pointer-events-auto"
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  );
}

/**
 * Extract mention IDs by type from a list of mentions
 */
export function extractMentionIds(mentions: Mention[]) {
  return {
    resources: mentions.filter((m) => m.type === "resource").map((m) => m.id),
    categories: mentions.filter((m) => m.type === "category").map((m) => m.id),
    blogs: mentions.filter((m) => m.type === "blog").map((m) => m.id),
    articles: mentions.filter((m) => m.type === "article").map((m) => m.id),
  };
}

/**
 * Strip mention syntax from text, leaving just the names
 */
export function stripMentionSyntax(text: string): string {
  return text.replace(/#\[([^\]]+)\]\(\w+:[^)]+\)/g, "$1");
}

export default MentionInput;
