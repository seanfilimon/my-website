"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ToolCallCardProps {
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: "pending" | "completed" | "error";
}

/**
 * Collapsible card component for displaying tool calls
 */
export function ToolCallCard({ name, input, output, status }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = {
    pending: <Loader2 className="size-3 animate-spin text-muted-foreground" />,
    completed: <Check className="size-3 text-green-500" />,
    error: <AlertCircle className="size-3 text-destructive" />,
  };

  const statusColor = {
    pending: "border-muted-foreground/30",
    completed: "border-green-500/30",
    error: "border-destructive/30",
  };

  // Format the tool name for display
  const displayName = name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  // Truncate long values for preview
  const truncateValue = (value: unknown, maxLength = 50): string => {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  };

  // Get a preview of the input
  const inputPreview = Object.entries(input)
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${truncateValue(value, 30)}`)
    .join(", ");

  return (
    <div
      className={cn(
        "rounded-md border bg-muted/30 text-xs overflow-hidden transition-colors",
        statusColor[status]
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="size-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-3 text-muted-foreground shrink-0" />
        )}
        
        <span className="font-medium text-foreground truncate">{displayName}</span>
        
        <span className="text-muted-foreground truncate flex-1 text-[10px]">
          {!expanded && inputPreview}
        </span>
        
        <span className="shrink-0">{statusIcon[status]}</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-2 pb-2 space-y-2 border-t border-border/50">
          {/* Input */}
          <div className="pt-2">
            <div className="text-[10px] font-medium text-muted-foreground mb-1">Input</div>
            <pre className="bg-background/50 rounded p-1.5 text-[10px] overflow-x-auto max-h-24 overflow-y-auto">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          {output !== undefined && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Output</div>
              <pre className="bg-background/50 rounded p-1.5 text-[10px] overflow-x-auto max-h-32 overflow-y-auto">
                {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Container for multiple tool call cards
 */
export function ToolCallList({ toolCalls }: { toolCalls: ToolCallCardProps[] }) {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="space-y-1 mt-1.5">
      {toolCalls.map((toolCall, index) => (
        <ToolCallCard key={`${toolCall.name}-${index}`} {...toolCall} />
      ))}
    </div>
  );
}

export default ToolCallCard;
