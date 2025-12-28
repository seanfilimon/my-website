"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useContentAgent,
  type GeneratedContent,
  type ToolCall,
} from "@/src/components/agent/use-content-agent";
import type { ContentType as InngestContentType } from "@/src/lib/inngest/events/content";
import { ToolCallList } from "./tool-call-card";
import { MentionInput, extractMentionIds, stripMentionSyntax, type Mention } from "./mention-input";
import {
  Bot,
  Send,
  Loader2,
  User,
  AlertCircle,
  FileText,
  BookOpen,
  Package,
  Sparkles,
  Zap,
  X,
  Check,
  ArrowRight,
  Plus,
  Users,
  Hash,
  Paperclip,
  MessageSquare,
  PanelRightClose,
  ExternalLink,
  Save,
} from "lucide-react";
import Link from "next/link";

// Map admin content types to Inngest content types
type AdminContentType = "blogs" | "articles" | "resources";
const ADMIN_TO_INNGEST_TYPE: Record<AdminContentType, InngestContentType> = {
  blogs: "blog",
  articles: "article",
  resources: "resource",
};

// Tone options
type ToneType = "professional" | "casual" | "technical" | "educational";
const TONE_OPTIONS: { value: ToneType; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
  { value: "educational", label: "Educational" },
];

// Common audience presets
const AUDIENCE_PRESETS = [
  "Beginner developers",
  "Senior engineers",
  "Product managers",
  "Startup founders",
  "Students",
  "General audience",
];

// Word count presets
const WORD_COUNT_PRESETS = [500, 1000, 1500, 2000, 3000];

interface AIChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeContentType?: string;
  onApplyContent?: (content: GeneratedContent, selectedFields: string[]) => void;
}

/**
 * AI Chat Panel - Side panel for AI-assisted content generation
 */
export function AIChatPanel({
  open,
  onOpenChange,
  activeContentType,
  onApplyContent,
}: AIChatPanelProps) {
  const [threadId] = useState(() => `thread-${Date.now()}`);
  const [contentType, setContentType] = useState<InngestContentType>("blog");
  const [mode, setMode] = useState<"full" | "quick">("full");
  const [inputValue, setInputValue] = useState("");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Advanced options
  const [tone, setTone] = useState<ToneType>("professional");
  const [audience, setAudience] = useState("");
  const [wordCount, setWordCount] = useState<number>(1500);
  const [quantity, setQuantity] = useState(1);
  const [showAudiencePopover, setShowAudiencePopover] = useState(false);
  const [showWordCountPopover, setShowWordCountPopover] = useState(false);

  // Mentions
  const [mentions, setMentions] = useState<Mention[]>([]);

  // Sync content type with active creator type
  useEffect(() => {
    if (activeContentType && activeContentType in ADMIN_TO_INNGEST_TYPE) {
      setContentType(ADMIN_TO_INNGEST_TYPE[activeContentType as AdminContentType]);
    }
  }, [activeContentType]);

  // Extract mention IDs for context
  const mentionIds = extractMentionIds(mentions);

  const {
    messages,
    status,
    generatedContent,
    savedContent,
    sendMessage,
    cancel,
    clearMessages,
  } = useContentAgent({
    threadId,
    contentType,
    mode,
    context: {
      tone,
      audience: audience || undefined,
      wordCount,
      // Pass first resource/category as primary context
      resourceId: mentionIds.resources[0],
      categoryId: mentionIds.categories[0],
      // Pass all mentions for additional context
      mentions: {
        resources: mentionIds.resources.length > 0 ? mentionIds.resources : undefined,
        categories: mentionIds.categories.length > 0 ? mentionIds.categories : undefined,
        blogs: mentionIds.blogs.length > 0 ? mentionIds.blogs : undefined,
        articles: mentionIds.articles.length > 0 ? mentionIds.articles : undefined,
      },
    },
  });

  // Handle keyboard shortcut for panel toggle
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Handle keyboard shortcuts in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setInputValue("");
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim() && !status.isGenerating) {
      // Strip mention syntax for cleaner prompt, but keep the names
      let prompt = stripMentionSyntax(inputValue.trim());
      if (quantity > 1) {
        prompt = `Generate ${quantity} ${contentType}${quantity > 1 ? "s" : ""} about: ${prompt}. Please provide ${quantity} distinct variations.`;
      }
      sendMessage(prompt);
      setInputValue("");
      setMentions([]);
    }
  };

  const handleApplyContent = useCallback(() => {
    if (generatedContent && onApplyContent) {
      const availableFields: string[] = [];
      if (generatedContent.title) availableFields.push("title");
      if (generatedContent.slug) availableFields.push("slug");
      if (generatedContent.excerpt) availableFields.push("excerpt");
      if (generatedContent.content) availableFields.push("content");
      if (generatedContent.metaTitle) availableFields.push("metaTitle");
      if (generatedContent.metaDescription) availableFields.push("metaDescription");
      if (generatedContent.tags?.length) availableFields.push("tags");
      if (generatedContent.readTime) availableFields.push("readTime");

      setSelectedFields(availableFields);
      setShowApplyDialog(true);
    }
  }, [generatedContent, onApplyContent]);

  const confirmApply = useCallback(() => {
    if (generatedContent && onApplyContent) {
      onApplyContent(generatedContent, selectedFields);
      setShowApplyDialog(false);
    }
  }, [generatedContent, onApplyContent, selectedFields]);

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const getAgentColor = (agent?: string) => {
    switch (agent) {
      case "Research Agent":
        return "bg-blue-500/10 text-blue-500";
      case "Writer Agent":
        return "bg-purple-500/10 text-purple-500";
      case "Editor Agent":
        return "bg-amber-500/10 text-amber-500";
      case "SEO Agent":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getContentTypeIcon = (type: InngestContentType) => {
    switch (type) {
      case "blog":
        return <FileText className="size-3" />;
      case "article":
        return <BookOpen className="size-3" />;
      case "resource":
        return <Package className="size-3" />;
    }
  };

  // Don't render if not open
  if (!open) return null;

  return (
    <>
      {/* Side Panel */}
      <div className="w-[360px] border-l bg-background flex flex-col shrink-0">
        {/* Header */}
        <div className="h-10 px-3 flex items-center justify-between border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={clearMessages}
              disabled={status.isGenerating || messages.length === 0}
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onOpenChange(false)}
            >
              <PanelRightClose className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">AI Content Assistant</p>
                <p className="text-[10px] mt-1 text-muted-foreground/70 max-w-[200px] mx-auto">
                  Describe what you want to create
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`shrink-0 size-5 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "system"
                        ? "bg-muted"
                        : getAgentColor(message.metadata?.agent)
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="size-2.5" />
                  ) : message.role === "system" ? (
                    <AlertCircle className="size-2.5" />
                  ) : (
                    <Bot className="size-2.5" />
                  )}
                </div>
                <div className={`flex-1 max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                  {message.metadata?.agent && (
                    <span className="text-[9px] text-muted-foreground mb-0.5 block">
                      {message.metadata.agent}
                    </span>
                  )}
                  <div
                    className={`inline-block px-2.5 py-1.5 rounded-lg text-xs ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.role === "system"
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {/* Tool Calls */}
                  {message.metadata?.toolCalls && message.metadata.toolCalls.length > 0 && (
                    <ToolCallList toolCalls={message.metadata.toolCalls} />
                  )}
                </div>
              </div>
            ))}

            {status.isGenerating && status.currentAgent && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                <span>{status.currentAgent} is working...</span>
              </div>
            )}

            {/* Progress indicator for multi-content generation */}
            {status.isGenerating && status.progress && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 rounded px-2 py-1">
                <Loader2 className="size-3 animate-spin" />
                <span>{status.progress.message}</span>
                <span className="ml-auto font-medium">
                  {status.progress.current}/{status.progress.total}
                </span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Generated Content Actions */}
        {generatedContent && !status.isGenerating && (
          <div className="px-3 py-2 border-t bg-green-500/5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-green-500" />
                <span className="text-xs font-medium">Generated</span>
              </div>
              <Button
                size="sm"
                className="h-6 text-[10px] gap-1"
                onClick={handleApplyContent}
              >
                Apply
                <ArrowRight className="size-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Saved Content Link */}
        {savedContent && !status.isGenerating && (
          <div className="px-3 py-2 border-t bg-blue-500/5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Save className="size-3.5 text-blue-500" />
                <span className="text-xs font-medium truncate max-w-[180px]">
                  {savedContent.title}
                </span>
              </div>
              <Link href={savedContent.editUrl}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] gap-1"
                >
                  Edit
                  <ExternalLink className="size-3" />
                </Button>
              </Link>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              Saved as draft • {savedContent.contentType}
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t shrink-0">
          <div className="relative">
            <MentionInput
              value={inputValue}
              onChange={setInputValue}
              onMentionsChange={setMentions}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to create... Use # to mention resources"
              disabled={status.isGenerating}
              rows={2}
              className="min-h-[48px] max-h-[100px] resize-none border-0 rounded-none bg-transparent pl-3 pr-10 py-2.5 shadow-none focus-visible:ring-0 text-xs leading-relaxed placeholder:text-muted-foreground/50"
            />
            <div className="absolute right-2 bottom-2 z-10">
              {status.isGenerating ? (
                <button
                  onClick={cancel}
                  className="size-6 flex items-center justify-center rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <X className="size-3" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="size-6 flex items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center gap-1 px-2 py-1 border-t border-border/40 bg-muted/20">
            <TooltipProvider delayDuration={150}>
              {/* Content Type */}
              <Select
                value={contentType}
                onValueChange={(v) => setContentType(v as InngestContentType)}
                disabled={status.isGenerating}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectTrigger className="size-6 p-0 border-0 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded shadow-none focus:ring-0 transition-colors [&>svg:last-child]:hidden justify-center">
                      {getContentTypeIcon(contentType)}
                    </SelectTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] py-1 px-2">{contentType}</TooltipContent>
                </Tooltip>
                <SelectContent align="start" className="min-w-[90px]">
                  <SelectItem value="blog" className="text-xs py-1">Blog</SelectItem>
                  <SelectItem value="article" className="text-xs py-1">Article</SelectItem>
                  <SelectItem value="resource" className="text-xs py-1">Resource</SelectItem>
                </SelectContent>
              </Select>

              {/* Quantity */}
              {quantity > 1 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setQuantity(1)}
                      disabled={status.isGenerating}
                      className="h-6 min-w-6 px-1 text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors disabled:opacity-50"
                    >
                      ×{quantity}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] py-1 px-2">Reset</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setQuantity(3)}
                      disabled={status.isGenerating}
                      className="size-6 flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/80 rounded transition-colors disabled:opacity-50"
                    >
                      <Plus className="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] py-1 px-2">Multi</TooltipContent>
                </Tooltip>
              )}

              <span className="text-border mx-0.5">·</span>

              {/* Mode */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setMode(mode === "full" ? "quick" : "full")}
                    disabled={status.isGenerating}
                    className={`size-6 flex items-center justify-center rounded transition-colors disabled:opacity-50 ${
                      mode === "full"
                        ? "text-violet-500 bg-violet-500/10 hover:bg-violet-500/20"
                        : "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                    }`}
                  >
                    {mode === "full" ? <Sparkles className="size-3" /> : <Zap className="size-3" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] py-1 px-2">
                  {mode === "full" ? "Full" : "Quick"}
                </TooltipContent>
              </Tooltip>

              {/* Tone */}
              <Select
                value={tone}
                onValueChange={(v) => setTone(v as ToneType)}
                disabled={status.isGenerating}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectTrigger className="size-6 p-0 border-0 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded shadow-none focus:ring-0 transition-colors [&>svg:last-child]:hidden justify-center">
                      <MessageSquare className="size-3" />
                    </SelectTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] py-1 px-2">{tone}</TooltipContent>
                </Tooltip>
                <SelectContent align="start" className="min-w-[90px]">
                  {TONE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs py-1">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Audience */}
              <Popover open={showAudiencePopover} onOpenChange={setShowAudiencePopover}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        disabled={status.isGenerating}
                        className={`size-6 flex items-center justify-center rounded transition-colors disabled:opacity-50 ${
                          audience ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20" : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <Users className="size-3" />
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] py-1 px-2">{audience || "Audience"}</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-44 p-2" align="start">
                  <Input
                    placeholder="Target audience..."
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="h-6 text-[10px] mb-1.5"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1">
                    {AUDIENCE_PRESETS.slice(0, 4).map((p) => (
                      <button key={p} onClick={() => { setAudience(p); setShowAudiencePopover(false); }} className="h-5 px-1.5 text-[9px] text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">{p}</button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Word Count */}
              <Popover open={showWordCountPopover} onOpenChange={setShowWordCountPopover}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button disabled={status.isGenerating} className="size-6 flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/80 rounded transition-colors disabled:opacity-50">
                        <Hash className="size-3" />
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] py-1 px-2">{wordCount}w</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-36 p-2" align="start">
                  <Input type="number" value={wordCount} onChange={(e) => setWordCount(Number(e.target.value) || 1000)} className="h-6 text-[10px] mb-1.5" min={100} max={10000} />
                  <div className="flex flex-wrap gap-1">
                    {WORD_COUNT_PRESETS.map((p) => (
                      <button key={p} onClick={() => { setWordCount(p); setShowWordCountPopover(false); }} className={`h-5 px-1.5 text-[9px] rounded transition-colors ${wordCount === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{p}</button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Attachments */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button disabled className="size-6 flex items-center justify-center text-muted-foreground/30 rounded cursor-not-allowed">
                    <Paperclip className="size-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] py-1 px-2">Soon</TooltipContent>
              </Tooltip>

              <div className="flex-1" />
              <span className="text-[9px] text-muted-foreground/40">⌘↵</span>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Apply Content Dialog */}
      <AlertDialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Generated Content</AlertDialogTitle>
            <AlertDialogDescription>
              Select which fields to apply to your form. Existing values will be overwritten.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-3">
            {generatedContent?.title && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-title"
                  checked={selectedFields.includes("title")}
                  onCheckedChange={() => toggleField("title")}
                />
                <Label htmlFor="field-title" className="flex-1 cursor-pointer">
                  <span className="font-medium">Title</span>
                  <p className="text-xs text-muted-foreground truncate">{generatedContent.title}</p>
                </Label>
              </div>
            )}

            {generatedContent?.slug && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-slug"
                  checked={selectedFields.includes("slug")}
                  onCheckedChange={() => toggleField("slug")}
                />
                <Label htmlFor="field-slug" className="flex-1 cursor-pointer">
                  <span className="font-medium">Slug</span>
                  <p className="text-xs text-muted-foreground truncate">{generatedContent.slug}</p>
                </Label>
              </div>
            )}

            {generatedContent?.excerpt && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-excerpt"
                  checked={selectedFields.includes("excerpt")}
                  onCheckedChange={() => toggleField("excerpt")}
                />
                <Label htmlFor="field-excerpt" className="flex-1 cursor-pointer">
                  <span className="font-medium">Excerpt</span>
                  <p className="text-xs text-muted-foreground truncate">{generatedContent.excerpt}</p>
                </Label>
              </div>
            )}

            {generatedContent?.content && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-content"
                  checked={selectedFields.includes("content")}
                  onCheckedChange={() => toggleField("content")}
                />
                <Label htmlFor="field-content" className="flex-1 cursor-pointer">
                  <span className="font-medium">Content</span>
                  <p className="text-xs text-muted-foreground">{generatedContent.content.length} characters</p>
                </Label>
              </div>
            )}

            {generatedContent?.metaTitle && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-metaTitle"
                  checked={selectedFields.includes("metaTitle")}
                  onCheckedChange={() => toggleField("metaTitle")}
                />
                <Label htmlFor="field-metaTitle" className="flex-1 cursor-pointer">
                  <span className="font-medium">Meta Title</span>
                  <p className="text-xs text-muted-foreground truncate">{generatedContent.metaTitle}</p>
                </Label>
              </div>
            )}

            {generatedContent?.metaDescription && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-metaDescription"
                  checked={selectedFields.includes("metaDescription")}
                  onCheckedChange={() => toggleField("metaDescription")}
                />
                <Label htmlFor="field-metaDescription" className="flex-1 cursor-pointer">
                  <span className="font-medium">Meta Description</span>
                  <p className="text-xs text-muted-foreground truncate">{generatedContent.metaDescription}</p>
                </Label>
              </div>
            )}

            {generatedContent?.tags && generatedContent.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-tags"
                  checked={selectedFields.includes("tags")}
                  onCheckedChange={() => toggleField("tags")}
                />
                <Label htmlFor="field-tags" className="flex-1 cursor-pointer">
                  <span className="font-medium">Tags</span>
                  <p className="text-xs text-muted-foreground">{generatedContent.tags.join(", ")}</p>
                </Label>
              </div>
            )}

            {generatedContent?.readTime && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-readTime"
                  checked={selectedFields.includes("readTime")}
                  onCheckedChange={() => toggleField("readTime")}
                />
                <Label htmlFor="field-readTime" className="flex-1 cursor-pointer">
                  <span className="font-medium">Read Time</span>
                  <p className="text-xs text-muted-foreground">{generatedContent.readTime}</p>
                </Label>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApply}
              disabled={selectedFields.length === 0}
            >
              Apply {selectedFields.length} Field{selectedFields.length !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AIChatPanel;
