"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { SelectionPopover } from "./selection-popover";
import { EditChatDrawer } from "./edit-chat-drawer";
import {
  IoSaveOutline,
  IoCloseOutline,
  IoSparklesOutline,
  IoEyeOutline,
  IoCodeSlashOutline,
} from "react-icons/io5";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { trpc } from "@/src/lib/trpc/client";
import { toast } from "sonner";

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-sm text-muted-foreground">Loading editor...</div>
      </div>
    ),
  }
);

interface InlineBlogEditorProps {
  blogId: string;
  initialContent: string;
  onClose: () => void;
  onSave?: (content: string) => void;
}

export function InlineBlogEditor({
  blogId,
  initialContent,
  onClose,
  onSave,
}: InlineBlogEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  } | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // tRPC mutation for updating blog
  const updateBlog = trpc.blog.update.useMutation();

  // Handle editor mount
  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;

    // Listen for selection changes
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        const selectedText = editor.getModel()?.getValueInRange(selection);
        if (selectedText && selectedText.trim().length > 0) {
          setSelectedText(selectedText);
          setSelectionRange({
            startLine: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLine: selection.endLineNumber,
            endColumn: selection.endColumn,
          });

          // Get position for popover
          const position = editor.getScrolledVisiblePosition({
            lineNumber: selection.endLineNumber,
            column: selection.endColumn,
          });
          if (position && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            setPopoverPosition({
              x: position.left + containerRect.left,
              y: position.top + containerRect.top + 20,
            });
          }
        } else {
          setSelectedText("");
          setSelectionRange(null);
          setPopoverPosition(null);
        }
      } else {
        setSelectedText("");
        setSelectionRange(null);
        setPopoverPosition(null);
      }
    });
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateBlog.mutateAsync({
        id: blogId,
        content,
      });
      toast.success("Blog saved successfully");
      onSave?.(content);
    } catch (error: any) {
      console.error("Failed to save blog:", error);
      toast.error(error?.message || "Failed to save blog");
    } finally {
      setIsSaving(false);
    }
  }, [blogId, content, updateBlog, onSave]);

  // Handle AI edit result
  const handleAIEdit = useCallback((newText: string) => {
    if (editorRef.current && selectionRange) {
      const editor = editorRef.current;
      const model = editor.getModel();
      
      if (model) {
        // Replace the selected text with the AI result
        editor.executeEdits("ai-edit", [
          {
            range: {
              startLineNumber: selectionRange.startLine,
              startColumn: selectionRange.startColumn,
              endLineNumber: selectionRange.endLine,
              endColumn: selectionRange.endColumn,
            },
            text: newText,
          },
        ]);
        
        // Update content state
        setContent(model.getValue());
        
        // Clear selection
        setSelectedText("");
        setSelectionRange(null);
        setPopoverPosition(null);
      }
    }
  }, [selectionRange]);

  // Handle chat-based content update
  const handleChatUpdate = useCallback((newContent: string) => {
    setContent(newContent);
    if (editorRef.current) {
      editorRef.current.setValue(newContent);
    }
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverPosition && !(e.target as Element).closest(".selection-popover")) {
        // Small delay to allow button clicks to register
        setTimeout(() => {
          setPopoverPosition(null);
        }, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverPosition]);

  return (
    <div ref={containerRef} className="relative">
      {/* Editor Toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-2">
          <Button
            variant={showPreview ? "outline" : "default"}
            size="sm"
            onClick={() => setShowPreview(false)}
            className="gap-2"
          >
            <IoCodeSlashOutline className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(true)}
            className="gap-2"
          >
            <IoEyeOutline className="h-4 w-4" />
            Preview
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChatDrawer(true)}
            className="gap-2"
          >
            <IoSparklesOutline className="h-4 w-4" />
            AI Assistant
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="gap-2"
          >
            <IoCloseOutline className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IoSaveOutline className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className={cn("min-h-[500px]", showPreview ? "p-4" : "")}>
        {showPreview ? (
          <div className="max-w-none">
            <Markdown content={content} />
          </div>
        ) : (
          <MonacoEditor
            height="600px"
            defaultLanguage="markdown"
            value={content}
            onChange={(v) => setContent(v || "")}
            onMount={handleEditorMount}
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
      </div>

      {/* Selection Popover */}
      {popoverPosition && selectedText && !showPreview && (
        <SelectionPopover
          position={popoverPosition}
          selectedText={selectedText}
          onEdit={handleAIEdit}
          onClose={() => setPopoverPosition(null)}
        />
      )}

      {/* AI Chat Drawer */}
      <EditChatDrawer
        open={showChatDrawer}
        onOpenChange={setShowChatDrawer}
        content={content}
        onContentUpdate={handleChatUpdate}
        blogId={blogId}
      />
    </div>
  );
}
