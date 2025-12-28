"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  IoCodeSlashOutline,
  IoEyeOutline,
  IoExpandOutline,
  IoContractOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoTextOutline,
  IoImageOutline,
  IoLinkOutline,
  IoListOutline,
  IoCodeOutline,
} from "react-icons/io5";
import { cn } from "@/src/lib/utils";

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-sm text-muted-foreground">Loading editor...</div>
      </div>
    ),
  }
);

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

// Simple MDX preview renderer
function MDXPreview({ content }: { content: string }) {
  // Basic markdown to HTML conversion for preview
  // In production, you'd use a proper MDX renderer
  const renderContent = useCallback((mdx: string) => {
    let html = mdx
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
      // Unordered lists
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Blockquotes
      .replace(/^>\s+(.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-8 border-t" />')
      // Paragraphs (simple approach)
      .replace(/\n\n/gim, '</p><p class="my-4">')
      // Line breaks
      .replace(/\n/gim, '<br />');

    return `<div class="prose prose-sm max-w-none"><p class="my-4">${html}</p></div>`;
  }, []);

  return (
    <div
      className="p-4 text-sm"
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
    />
  );
}

// Toolbar button component
function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 w-8 p-0", active && "bg-muted")}
      onClick={onClick}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

export function MDXEditor({
  value,
  onChange,
  placeholder = "Write your content in MDX...",
  minHeight = "400px",
  className,
}: MDXEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview" | "split">("write");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Update counts when value changes
  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    const chars = value.length;
    setWordCount(words);
    setCharCount(chars);
  }, [value]);

  // Insert text at cursor position (simplified - Monaco handles this better)
  const insertText = useCallback(
    (before: string, after: string = "") => {
      const newValue = value + before + after;
      onChange(newValue);
    },
    [value, onChange]
  );

  // Toolbar actions
  const handleBold = useCallback(() => insertText("**", "**"), [insertText]);
  const handleItalic = useCallback(() => insertText("*", "*"), [insertText]);
  const handleCode = useCallback(() => insertText("`", "`"), [insertText]);
  const handleCodeBlock = useCallback(
    () => insertText("\n```javascript\n", "\n```\n"),
    [insertText]
  );
  const handleLink = useCallback(
    () => insertText("[", "](url)"),
    [insertText]
  );
  const handleImage = useCallback(
    () => insertText("![alt text](", ")"),
    [insertText]
  );
  const handleList = useCallback(() => insertText("\n- "), [insertText]);
  const handleHeading = useCallback(() => insertText("\n## "), [insertText]);

  // Copy content
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden bg-card flex flex-col",
        isFullscreen && "fixed inset-4 z-50 shadow-2xl",
        className
      )}
      style={{ minHeight: isFullscreen ? undefined : minHeight }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          <ToolbarButton icon={IoTextOutline} label="Heading" onClick={handleHeading} />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton icon={IoCodeSlashOutline} label="Bold" onClick={handleBold} />
          <ToolbarButton icon={IoCodeSlashOutline} label="Italic" onClick={handleItalic} />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton icon={IoCodeOutline} label="Inline Code" onClick={handleCode} />
          <ToolbarButton icon={IoCodeSlashOutline} label="Code Block" onClick={handleCodeBlock} />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton icon={IoLinkOutline} label="Link" onClick={handleLink} />
          <ToolbarButton icon={IoImageOutline} label="Image" onClick={handleImage} />
          <ToolbarButton icon={IoListOutline} label="List" onClick={handleList} />
        </div>

        <div className="flex items-center gap-2">
          {/* Word/Char count */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>

          {/* View mode tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="h-8">
              <TabsTrigger value="write" className="h-6 text-xs px-2">
                <IoCodeSlashOutline className="h-3 w-3 mr-1" />
                Write
              </TabsTrigger>
              <TabsTrigger value="split" className="h-6 text-xs px-2">
                Split
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-6 text-xs px-2">
                <IoEyeOutline className="h-3 w-3 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCopy}
            title="Copy content"
          >
            {copied ? (
              <IoCheckmarkOutline className="h-4 w-4 text-green-500" />
            ) : (
              <IoCopyOutline className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <IoContractOutline className="h-4 w-4" />
            ) : (
              <IoExpandOutline className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "write" && (
          <MonacoEditor
            height="100%"
            defaultLanguage="markdown"
            value={value}
            onChange={(v) => onChange(v || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: "line",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              tabSize: 2,
            }}
          />
        )}

        {activeTab === "preview" && (
          <ScrollArea className="h-full">
            {value ? (
              <MDXPreview content={value} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nothing to preview yet
              </div>
            )}
          </ScrollArea>
        )}

        {activeTab === "split" && (
          <div className="flex h-full">
            <div className="flex-1 border-r">
              <MonacoEditor
                height="100%"
                defaultLanguage="markdown"
                value={value}
                onChange={(v) => onChange(v || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
            <ScrollArea className="flex-1">
              {value ? (
                <MDXPreview content={value} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Preview will appear here
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-5 text-xs">
            MDX
          </Badge>
          <span>Markdown with JSX support</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Line endings: LF</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
