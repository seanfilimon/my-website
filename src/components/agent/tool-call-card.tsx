"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle, Wrench } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ToolCallCardProps {
  name: string;
  input?: Record<string, unknown>;
  output?: unknown;
  status: "pending" | "running" | "completed" | "error";
  duration?: number;
}

const toolColors: Record<string, string> = {
  analyzeRequest: "border-blue-500/30 bg-blue-500/5",
  research: "border-purple-500/30 bg-purple-500/5",
  saveBlog: "border-green-500/30 bg-green-500/5",
  saveArticle: "border-green-500/30 bg-green-500/5",
  saveResource: "border-green-500/30 bg-green-500/5",
  updateBlog: "border-amber-500/30 bg-amber-500/5",
  appendToBlog: "border-amber-500/30 bg-amber-500/5",
  getResources: "border-cyan-500/30 bg-cyan-500/5",
  getBlogs: "border-cyan-500/30 bg-cyan-500/5",
  getCategories: "border-cyan-500/30 bg-cyan-500/5",
  fetchAndUploadLogo: "border-pink-500/30 bg-pink-500/5",
  checkProgress: "border-gray-500/30 bg-gray-500/5",
};

const statusIcons = {
  pending: <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />,
  running: <Loader2 className="h-3 w-3 animate-spin text-blue-500" />,
  completed: <CheckCircle2 className="h-3 w-3 text-green-500" />,
  error: <XCircle className="h-3 w-3 text-red-500" />,
};

export function ToolCallCard({ name, input, output, status, duration }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = toolColors[name] || "border-gray-500/30 bg-gray-500/5";

  return (
    <div className={cn("rounded-md border text-xs", colorClass)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
        <Wrench className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium">{name}</span>
        <span className="ml-auto flex items-center gap-2">
          {duration && (
            <span className="text-muted-foreground">{duration}ms</span>
          )}
          {statusIcons[status]}
        </span>
      </button>

      {expanded && (
        <div className="border-t px-2 py-2 space-y-2">
          {input && Object.keys(input).length > 0 && (
            <div>
              <div className="text-muted-foreground mb-1">Input:</div>
              <pre className="bg-background/50 rounded p-1.5 overflow-x-auto text-[10px]">
                {JSON.stringify(input, null, 2)}
              </pre>
            </div>
          )}
          {output !== undefined && (
            <div>
              <div className="text-muted-foreground mb-1">Output:</div>
              <pre className="bg-background/50 rounded p-1.5 overflow-x-auto text-[10px] max-h-32 overflow-y-auto">
                {typeof output === "string" 
                  ? output 
                  : JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ToolCallCard;
