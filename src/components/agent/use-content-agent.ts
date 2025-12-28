/**
 * Custom hook for content generation agent interactions
 * Provides real-time streaming of agent responses
 */
"use client";

import { useState, useCallback, useRef } from "react";
import type { ContentType } from "@/src/lib/inngest/events/content";

/**
 * Message types for the chat interface
 */
export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    agent?: string;
    contentType?: ContentType;
    generatedContent?: GeneratedContent;
    toolCalls?: ToolCall[];
  };
}

export interface GeneratedContent {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  readTime?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  keywords?: string[];
  // Saved content info
  contentId?: string;
  saved?: boolean;
}

export interface SavedContent {
  contentId: string;
  contentType: string;
  title: string;
  slug: string;
  editUrl: string;
}

export interface ParsedIntent {
  contentType: string;
  quantity: number;
  topic: string;
  tone: string;
  audience?: string;
  wordCount?: number;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: "pending" | "completed" | "error";
}

export interface AgentStatus {
  isConnected: boolean;
  isGenerating: boolean;
  currentAgent?: string;
  error?: string;
  // Progress tracking
  progress?: {
    current: number;
    total: number;
    message: string;
  };
  // Parsed intent
  intent?: ParsedIntent;
}

export interface ContentContext {
  topic?: string;
  instructions?: string;
  audience?: string;
  tone?: "professional" | "casual" | "technical" | "educational";
  wordCount?: number;
  resourceId?: string;
  categoryId?: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  /** Mentioned items from the input */
  mentions?: {
    resources?: string[];
    categories?: string[];
    blogs?: string[];
    articles?: string[];
  };
}

export interface UseContentAgentOptions {
  threadId: string;
  contentType?: ContentType;
  mode?: "full" | "quick";
  context?: ContentContext;
  autoDetect?: boolean; // Enable intent parsing
  onMessage?: (message: AgentMessage) => void;
  onContent?: (content: GeneratedContent) => void;
  onSaved?: (saved: SavedContent) => void;
  onIntent?: (intent: ParsedIntent) => void;
  onComplete?: (result: { success: boolean; content?: GeneratedContent; quantity?: number }) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for interacting with the content generation agent
 */
export function useContentAgent(options: UseContentAgentOptions) {
  const {
    threadId,
    contentType = "blog",
    mode = "full",
    context,
    autoDetect = true,
    onMessage,
    onContent,
    onSaved,
    onIntent,
    onComplete,
    onError,
  } = options;

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [status, setStatus] = useState<AgentStatus>({
    isConnected: false,
    isGenerating: false,
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [savedContent, setSavedContent] = useState<SavedContent | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Add a message to the chat
   */
  const addMessage = useCallback(
    (message: Omit<AgentMessage, "id" | "timestamp">) => {
      const newMessage: AgentMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      onMessage?.(newMessage);

      return newMessage;
    },
    [onMessage]
  );

  /**
   * Send a message to the agent
   */
  const sendMessage = useCallback(
    async (message: string) => {
      // Add user message
      addMessage({
        role: "user",
        content: message,
      });

      // Set generating state
      setStatus((prev) => ({
        ...prev,
        isGenerating: true,
        error: undefined,
      }));

      // Create abort controller
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            threadId,
            contentType,
            context: context
              ? {
                  ...context,
                  topic: context.topic || message,
                }
              : { topic: message },
            mode,
            autoDetect,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Set connected state
        setStatus((prev) => ({
          ...prev,
          isConnected: true,
        }));

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete events
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                handleStreamEvent(data);
              } catch (e) {
                console.error("Failed to parse stream event:", e);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled
          addMessage({
            role: "system",
            content: "Generation cancelled.",
          });
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          setStatus((prev) => ({
            ...prev,
            error: errorMessage,
          }));

          addMessage({
            role: "system",
            content: `Error: ${errorMessage}`,
          });

          onError?.(error instanceof Error ? error : new Error(errorMessage));
        }
      } finally {
        setStatus((prev) => ({
          ...prev,
          isGenerating: false,
          currentAgent: undefined,
        }));
        abortControllerRef.current = null;
      }
    },
    [threadId, contentType, mode, context, addMessage, onError]
  );

  /**
   * Handle stream events
   */
  const handleStreamEvent = useCallback(
    (event: {
      type: string;
      [key: string]: unknown;
    }) => {
      switch (event.type) {
        case "start":
          addMessage({
            role: "system",
            content: `Starting ${event.contentType} generation in ${event.mode} mode...`,
            metadata: {
              contentType: event.contentType as ContentType,
            },
          });
          break;

        case "agent":
          setStatus((prev) => ({
            ...prev,
            currentAgent: event.agent as string,
          }));

          // Include tool calls if present
          const agentToolCalls = event.toolCalls as ToolCall[] | undefined;
          
          addMessage({
            role: "assistant",
            content: `${event.agent} ${event.status === "completed" ? "completed" : "processing"}...`,
            metadata: {
              agent: event.agent as string,
              toolCalls: agentToolCalls,
            },
          });
          break;

        case "tool_call":
          // Individual tool call event - update the last agent message with tool calls
          const toolData = event.tool as { name: string; input: Record<string, unknown>; output?: unknown; status: string };
          setMessages((prev) => {
            const lastAgentMsgIndex = prev.findLastIndex(
              (m) => m.role === "assistant" && m.metadata?.agent === event.agent
            );
            if (lastAgentMsgIndex === -1) return prev;

            const updated = [...prev];
            const lastMsg = updated[lastAgentMsgIndex];
            const existingToolCalls = lastMsg.metadata?.toolCalls || [];
            
            updated[lastAgentMsgIndex] = {
              ...lastMsg,
              metadata: {
                ...lastMsg.metadata,
                toolCalls: [
                  ...existingToolCalls,
                  {
                    name: toolData.name,
                    input: toolData.input,
                    output: toolData.output,
                    status: toolData.status as "pending" | "completed" | "error",
                  },
                ],
              },
            };
            return updated;
          });
          break;

        case "content":
          const content = event.data as GeneratedContent;
          setGeneratedContent(content);
          onContent?.(content);

          addMessage({
            role: "assistant",
            content: content.title
              ? `Generated: "${content.title}"`
              : "Content generated successfully.",
            metadata: {
              generatedContent: content,
            },
          });
          break;

        case "output":
          // Final output from the network
          if (event.output) {
            addMessage({
              role: "assistant",
              content:
                typeof event.output === "string"
                  ? event.output
                  : "Generation complete.",
            });
          }
          break;

        case "intent":
          // Parsed intent from the intent parser
          const intent = event.data as ParsedIntent;
          setStatus((prev) => ({
            ...prev,
            intent,
          }));
          onIntent?.(intent);
          
          addMessage({
            role: "system",
            content: `Detected: ${intent.quantity} ${intent.contentType}${intent.quantity > 1 ? "s" : ""} about "${intent.topic}" (${intent.tone})`,
          });
          break;

        case "progress":
          // Progress update for multi-content generation
          setStatus((prev) => ({
            ...prev,
            progress: {
              current: event.current as number,
              total: event.total as number,
              message: event.message as string,
            },
          }));
          break;

        case "saved":
          // Content was saved to database
          const saved: SavedContent = {
            contentId: event.contentId as string,
            contentType: event.contentType as string,
            title: event.title as string,
            slug: event.slug as string,
            editUrl: event.editUrl as string,
          };
          setSavedContent(saved);
          onSaved?.(saved);
          
          addMessage({
            role: "assistant",
            content: `✅ Saved "${saved.title}" as draft`,
            metadata: {
              agent: "SEO Agent",
            },
          });
          break;

        case "triggered":
          // Inngest function was triggered
          addMessage({
            role: "assistant",
            content: event.message as string || `${event.contentType} generation triggered. Check your drafts shortly.`,
            metadata: {
              agent: "Orchestrator",
            },
          });
          break;

        case "complete":
          // Add completion message
          if (event.message) {
            addMessage({
              role: "assistant",
              content: event.message as string,
            });
          }
          
          onComplete?.({
            success: event.success as boolean,
            content: generatedContent || undefined,
            quantity: event.quantity as number | undefined,
          });
          break;

        case "error":
          setStatus((prev) => ({
            ...prev,
            error: event.error as string,
          }));

          addMessage({
            role: "system",
            content: `Error: ${event.error}`,
          });

          onError?.(new Error(event.error as string));
          break;
      }
    },
    [addMessage, onContent, onComplete, onError, generatedContent]
  );

  /**
   * Cancel the current generation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setGeneratedContent(null);
    setSavedContent(null);
    setStatus({
      isConnected: false,
      isGenerating: false,
    });
  }, []);

  return {
    messages,
    status,
    generatedContent,
    savedContent,
    sendMessage,
    cancel,
    clearMessages,
    addMessage,
  };
}

export default useContentAgent;
