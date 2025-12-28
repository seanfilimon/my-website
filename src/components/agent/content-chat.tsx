"use client";

import { useState, useCallback } from "react";
import { useAgent } from "@inngest/use-agent";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Send, Loader2, X, Plus, MessageSquare, Trash2 } from "lucide-react";
import { MessageList } from "./message-list";
import { cn } from "@/src/lib/utils";

interface ContentChatProps {
  className?: string;
  onContentGenerated?: (content: unknown) => void;
}

// Type definitions for useAgent
interface MessagePart {
  type: string;
  text?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  state?: string;
}

interface AgentMessage {
  id?: string;
  role: string;
  parts?: MessagePart[];
  content?: string;
  createdAt?: Date | string;
}

interface AgentThread {
  id: string;
  title?: string;
}

/**
 * Real-time content chat using Inngest useAgent hook
 */
export function ContentChat({ className, onContentGenerated }: ContentChatProps) {
  const [inputValue, setInputValue] = useState("");

  const {
    messages,
    status,
    currentThreadId,
    threads,
    threadsLoading,
    sendMessage,
    cancel,
    createNewThread,
    switchToThread,
    deleteThread,
  } = useAgent({
    onToolResult: (result: unknown) => {
      // Handle tool results - check for saved content
      if (result && typeof result === "object" && "success" in result) {
        onContentGenerated?.(result);
      }
    },
    onStreamEnded: () => {
      console.log("[ContentChat] Stream ended");
    },
    debug: process.env.NODE_ENV === "development",
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim() && status !== "streaming") {
        sendMessage(inputValue.trim());
        setInputValue("");
      }
    },
    [inputValue, status, sendMessage]
  );

  const handleNewThread = useCallback(() => {
    createNewThread();
  }, [createNewThread]);

  const handleDeleteThread = useCallback(
    async (threadId: string) => {
      await deleteThread(threadId);
    },
    [deleteThread]
  );

  // Transform messages for MessageList component
  const transformedMessages = (messages as AgentMessage[]).map((msg, idx) => ({
    id: msg.id || `msg-${idx}-${Date.now()}`,
    role: msg.role as "user" | "assistant" | "system" | "tool",
    parts: msg.parts?.map((part) => ({
      type: part.type,
      text: part.type === "text" ? part.text : undefined,
      toolName: part.type === "tool-call" ? part.toolName : undefined,
      toolInput: part.type === "tool-call" ? part.args : undefined,
      toolOutput: part.type === "tool-result" ? part.result : undefined,
      status: part.type === "tool-call" 
        ? (part.state === "pending" ? "pending" : part.state === "running" ? "running" : "completed") as "pending" | "running" | "completed" | "error"
        : undefined,
    })) || [{ type: "text", text: String(msg.content || "") }],
    createdAt: msg.createdAt,
  }));

  const isGenerating = status === "streaming" || status === "submitted";

  return (
    <div className={cn("flex h-full", className)}>
      {/* Thread Sidebar */}
      <div className="w-64 border-r flex flex-col bg-muted/30">
        <div className="p-3 border-b">
          <Button onClick={handleNewThread} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threadsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (threads as AgentThread[]).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          ) : (
            (threads as AgentThread[]).map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "group relative rounded-md hover:bg-muted transition-colors",
                  currentThreadId === thread.id && "bg-muted"
                )}
              >
                <button
                  onClick={() => switchToThread(thread.id)}
                  className="w-full text-left px-3 py-2 text-sm truncate flex items-center gap-2"
                >
                  <MessageSquare className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {thread.title || "New conversation"}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteThread(thread.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <MessageList
          messages={transformedMessages}
          isLoading={isGenerating}
          className="flex-1"
        />

        {/* Status indicator */}
        {isGenerating && (
          <div className="px-4 py-2 border-t bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is working...</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe what content you want to create..."
              disabled={isGenerating}
              className="flex-1"
            />
            {isGenerating ? (
              <Button type="button" variant="destructive" onClick={cancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            ) : (
              <Button type="submit" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContentChat;
