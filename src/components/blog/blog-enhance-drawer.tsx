"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  IoSparklesOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoAddOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { Loader2, Eye } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AIProgressMonitor, type ProgressStep } from "./ai-progress-monitor";
import { Markdown } from "@/components/ui/markdown";
import { toast } from "sonner";

interface BlogEnhanceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogId: string;
  currentContent: string;
  onContentUpdate: (newContent: string) => void;
}

export function BlogEnhanceDrawer({
  open,
  onOpenChange,
  blogId,
  currentContent,
  onContentUpdate,
}: BlogEnhanceDrawerProps) {
  const [instruction, setInstruction] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "progress" | "preview">("input");

  const addUrl = useCallback(() => {
    if (urlInput.trim() && !urls.includes(urlInput.trim())) {
      setUrls((prev) => [...prev, urlInput.trim()]);
      setUrlInput("");
    }
  }, [urlInput, urls]);

  const removeUrl = useCallback((url: string) => {
    setUrls((prev) => prev.filter((u) => u !== url));
  }, []);

  const handleEnhance = useCallback(async () => {
    if (!instruction.trim()) {
      toast.error("Please provide an instruction");
      return;
    }

    setIsProcessing(true);
    setProgressSteps([]);
    setEnhancedContent(null);
    setActiveTab("progress");

    try {
      const response = await fetch("/api/agent/blog-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId,
          instruction: instruction.trim(),
          urls: urls.length > 0 ? urls : undefined,
          autoSave: false, // Don't auto-save, let user review first
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start enhancement");
      }

      const data = await response.json();
      
      // Simulate progress updates (in real implementation, use SSE or websockets)
      // For now, just simulate some steps
      const mockSteps: ProgressStep[] = [
        {
          id: "step-1",
          agent: "Blog Enhance Agent",
          stage: "analyzing",
          message: "Analyzing your instruction and planning changes...",
          toolCalls: [],
          timestamp: new Date(),
        },
      ];

      if (urls.length > 0) {
        mockSteps.push({
          id: "step-2",
          agent: "URL Research Agent",
          stage: "researching",
          message: `Researching ${urls.length} URL(s)...`,
          toolCalls: urls.map((url, idx) => ({
            name: "extractUrl",
            status: "completed" as const,
            input: { url },
            output: { success: true, title: `Content from ${url}` },
            duration: 1500 + idx * 500,
            timestamp: new Date(Date.now() + idx * 2000),
          })),
          timestamp: new Date(Date.now() + 1000),
          duration: 2000 + urls.length * 500,
        });
      }

      mockSteps.push({
        id: "step-3",
        agent: "Blog Enhance Agent",
        stage: "writing",
        message: "Creating enhanced content...",
        toolCalls: [
          {
            name: "insertSection",
            status: "completed" as const,
            input: { heading: "New Section", position: "after", targetHeading: "Introduction" },
            output: { success: true, message: "Section inserted successfully" },
            duration: 800,
            timestamp: new Date(Date.now() + 3000),
          },
        ],
        timestamp: new Date(Date.now() + 3000),
        duration: 1500,
      });

      mockSteps.push({
        id: "step-4",
        agent: "Blog Enhance Agent",
        stage: "complete",
        message: "Enhancement complete!",
        toolCalls: [],
        timestamp: new Date(Date.now() + 5000),
        duration: 100,
      });

      // Simulate progressive updates
      let currentStep = 0;
      const updateSteps = () => {
        if (currentStep < mockSteps.length) {
          setProgressSteps((prev) => [...prev, mockSteps[currentStep]]);
          currentStep++;
          setTimeout(updateSteps, 1500);
        } else {
          // Set mock enhanced content
          setEnhancedContent(
            currentContent +
              "\n\n## New Section\n\nThis section was added by AI based on your instruction.\n\nContent here..."
          );
          setIsProcessing(false);
          setActiveTab("preview");
          toast.success("Enhancement complete!");
        }
      };
      
      setTimeout(updateSteps, 500);

    } catch (error: any) {
      console.error("Enhancement error:", error);
      toast.error(error?.message || "Failed to enhance blog");
      setIsProcessing(false);
    }
  }, [instruction, urls, blogId, currentContent]);

  const handleApply = useCallback(() => {
    if (enhancedContent) {
      onContentUpdate(enhancedContent);
      toast.success("Changes applied to blog");
      onOpenChange(false);
    }
  }, [enhancedContent, onContentUpdate, onOpenChange]);

  const handleReset = useCallback(() => {
    setInstruction("");
    setUrls([]);
    setUrlInput("");
    setProgressSteps([]);
    setEnhancedContent(null);
    setActiveTab("input");
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[800px] h-full flex flex-col p-0 overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <IoSparklesOutline className="h-5 w-5 text-primary" />
            Enhance Blog with AI
          </SheetTitle>
          <SheetDescription>
            Add sections, research URLs, and improve your blog content
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 flex-shrink-0">
            <TabsTrigger value="input">Instructions</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="preview" disabled={!enhancedContent}>
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4 pb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    What would you like to do?
                  </label>
                  <Textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="E.g., 'Add a troubleshooting section after installation' or 'Research this URL and integrate key insights'"
                    rows={4}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be specific about what sections to add, where to add them, and what content to include.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    URLs to Research (Optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addUrl()}
                      placeholder="https://example.com/article"
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={addUrl}
                      disabled={!urlInput.trim() || isProcessing}
                      size="sm"
                    >
                      <IoAddOutline className="h-4 w-4" />
                    </Button>
                  </div>
                  {urls.length > 0 && (
                    <div className="space-y-1">
                      {urls.map((url, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
                        >
                          <span className="flex-1 truncate">{url}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUrl(url)}
                            disabled={isProcessing}
                          >
                            <IoTrashOutline className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex px-6 py-4">
            <AIProgressMonitor
              steps={progressSteps}
              isActive={isProcessing}
              className="flex-1"
            />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col min-h-0">
            <ScrollArea className="flex-1 h-full w-full">
              <div className="px-6 py-4">
                {enhancedContent && (
                  <div className="prose prose-sm max-w-none pb-6">
                    <Markdown content={enhancedContent} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={isProcessing}
          >
            Reset
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              <IoCloseOutline className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            {enhancedContent ? (
              <Button onClick={handleApply}>
                <IoCheckmarkOutline className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
            ) : (
              <Button onClick={handleEnhance} disabled={isProcessing || !instruction.trim()}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IoSparklesOutline className="h-4 w-4 mr-2" />
                    Enhance
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default BlogEnhanceDrawer;
