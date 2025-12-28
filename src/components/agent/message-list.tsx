"use client";

import { useRef, useEffect, useCallback } from "react";
import { Bot, User, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ToolCallCard } from "./tool-call-card";

interface MessagePart {
  type: string;
  text?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: unknown;
  status?: "pending" | "running" | "completed" | "error";
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  parts: MessagePart[];
  createdAt?: Date | string;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function MessageList({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Infinite scroll - load more when scrolling to top
  useEffect(() => {
    if (!topSentinelRef.current || !hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, isLoading]);

  // Auto-scroll to bottom on new messages (only after initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      bottomRef.current?.scrollIntoView();
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const renderMessageContent = useCallback((message: Message) => {
    return message.parts.map((part, idx) => {
      if (part.type === "text" && part.text) {
        return (
          <p key={idx} className="whitespace-pre-wrap">
            {part.text}
          </p>
        );
      }
      if (part.type === "tool-call" && part.toolName) {
        return (
          <ToolCallCard
            key={idx}
            name={part.toolName}
            input={part.toolInput}
            output={part.toolOutput}
            status={part.status || "completed"}
          />
        );
      }
      return null;
    });
  }, []);

  const getAvatar = (role: string) => {
    switch (role) {
      case "user":
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        );
      case "assistant":
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
        );
      case "system":
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={scrollRef} className={cn("flex-1 overflow-y-auto p-4", className)}>
      {/* Top sentinel for infinite scroll */}
      <div ref={topSentinelRef} className="h-1" />
      
      {/* Loading indicator for older messages */}
      {isLoading && hasMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm">Describe what content you want to create</p>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            {getAvatar(message.role)}
            <div
              className={cn(
                "flex-1 max-w-[85%] space-y-2",
                message.role === "user" && "text-right"
              )}
            >
              <div
                className={cn(
                  "inline-block px-4 py-2 rounded-lg text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.role === "system"
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted"
                )}
              >
                {renderMessageContent(message)}
              </div>
              {message.createdAt && (
                <div className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom anchor for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
