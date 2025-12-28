"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Code,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

/**
 * Tool call interface
 */
export interface ToolCall {
  name: string;
  status: "pending" | "running" | "completed" | "error";
  input?: Record<string, unknown>;
  output?: unknown;
  duration?: number;
  timestamp: Date;
}

/**
 * Progress step interface
 */
export interface ProgressStep {
  id: string;
  agent: string;
  stage: string;
  message: string;
  toolCalls: ToolCall[];
  timestamp: Date;
  duration?: number;
}

interface AIProgressMonitorProps {
  steps: ProgressStep[];
  isActive: boolean;
  className?: string;
}

/**
 * AI Progress Monitor Component
 * Displays real-time AI agent activity with expandable tool calls
 */
export function AIProgressMonitor({
  steps,
  isActive,
  className,
}: AIProgressMonitorProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const toggleTool = (toolId: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: ToolCall["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ToolCall["status"]) => {
    const variants: Record<ToolCall["status"], string> = {
      pending: "bg-muted text-muted-foreground",
      running: "bg-blue-500/10 text-blue-500",
      completed: "bg-green-500/10 text-green-500",
      error: "bg-destructive/10 text-destructive",
    };

    return (
      <Badge variant="outline" className={cn("text-xs", variants[status])}>
        {status}
      </Badge>
    );
  };

  const formatJson = (obj: unknown) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="font-medium text-sm">AI Activity Monitor</span>
        </div>
        {isActive && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 text-xs">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Active
          </Badge>
        )}
      </div>

      {/* Progress Steps */}
      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {steps.map((step) => {
                const isExpanded = expandedSteps.has(step.id);
                const hasCalls = step.toolCalls.length > 0;

                return (
                  <Collapsible
                    key={step.id}
                    open={isExpanded}
                    onOpenChange={() => toggleStep(step.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left">
                        {hasCalls && (
                          <span className="mt-0.5">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {step.agent}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {step.stage}
                            </span>
                            {step.duration && (
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(step.duration)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{step.message}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {hasCalls && (
                      <CollapsibleContent className="pl-8 pr-2">
                        <div className="space-y-1 border-l-2 border-muted pl-2 ml-2">
                          {step.toolCalls.map((call, idx) => {
                            const toolId = `${step.id}-tool-${idx}`;
                            const isToolExpanded = expandedTools.has(toolId);

                            return (
                              <Collapsible
                                key={toolId}
                                open={isToolExpanded}
                                onOpenChange={() => toggleTool(toolId)}
                              >
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left">
                                    {getStatusIcon(call.status)}
                                    <span className="flex-1 text-sm font-mono">
                                      {call.name}()
                                    </span>
                                    {getStatusBadge(call.status)}
                                    {call.duration && (
                                      <span className="text-xs text-muted-foreground">
                                        {formatDuration(call.duration)}
                                      </span>
                                    )}
                                    {(call.input || call.output) && (
                                      <ChevronRight
                                        className={cn(
                                          "h-3 w-3 transition-transform",
                                          isToolExpanded && "rotate-90"
                                        )}
                                      />
                                    )}
                                  </div>
                                </CollapsibleTrigger>

                                {(call.input || call.output) && (
                                  <CollapsibleContent className="pl-4">
                                    <div className="space-y-2 p-2">
                                      {call.input && (
                                        <div>
                                          <p className="text-xs font-medium mb-1">
                                            Input:
                                          </p>
                                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                            {formatJson(call.input)}
                                          </pre>
                                        </div>
                                      )}
                                      {call.output && (
                                        <div>
                                          <p className="text-xs font-medium mb-1">
                                            Output:
                                          </p>
                                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                            {formatJson(call.output)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                )}
                              </Collapsible>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default AIProgressMonitor;
