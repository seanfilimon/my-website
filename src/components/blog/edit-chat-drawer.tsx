"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  IoSendOutline,
  IoSparklesOutline,
  IoCloseOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { Loader2, User, Bot } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedContent?: string;
}

interface EditChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
  blogId: string;
}

export function EditChatDrawer({
  open,
  onOpenChange,
  content,
  onContentUpdate,
  blogId,
}: EditChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          text: content,
          instruction: input.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process request");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || "Here's the updated content based on your request.",
        suggestedContent: data.result,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message || "Something went wrong"}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, content, isLoading]);

  const handleApplySuggestion = useCallback((suggestedContent: string) => {
    onContentUpdate(suggestedContent);
    
    // Add confirmation message
    const confirmMessage: Message = {
      id: `confirm-${Date.now()}`,
      role: "assistant",
      content: "Changes applied to the editor. You can continue editing or save your changes.",
    };
    setMessages((prev) => [...prev, confirmMessage]);
  }, [onContentUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <IoSparklesOutline className="h-5 w-5 text-primary" />
            AI Editor Assistant
          </SheetTitle>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <IoSparklesOutline className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">AI Editor Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Describe what changes you want to make to the blog content. For example:
              </p>
              <ul className="text-sm text-muted-foreground mt-3 space-y-1 text-left">
                <li>&quot;Add a conclusion section&quot;</li>
                <li>&quot;Make the introduction more engaging&quot;</li>
                <li>&quot;Add code examples for the API section&quot;</li>
                <li>&quot;Fix any grammar issues&quot;</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Apply suggestion button */}
                    {message.suggestedContent && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <Button
                          size="sm"
                          onClick={() => handleApplySuggestion(message.suggestedContent!)}
                          className="w-full gap-2"
                        >
                          <IoCheckmarkOutline className="h-4 w-4" />
                          Apply Changes
                        </Button>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the changes you want..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IoSendOutline className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
