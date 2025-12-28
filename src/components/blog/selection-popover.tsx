"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  IoRefreshOutline,
  IoExpandOutline,
  IoTextOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { Loader2, Wand2, Minimize2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SelectionPopoverProps {
  position: { x: number; y: number };
  selectedText: string;
  onEdit: (newText: string) => void;
  onClose: () => void;
}

type AIAction = "rewrite" | "expand" | "simplify" | "fix";

export function SelectionPopover({
  position,
  selectedText,
  onEdit,
  onClose,
}: SelectionPopoverProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = useCallback(async (action: AIAction) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: selectedText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process text");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [selectedText]);

  const handleApply = useCallback(() => {
    if (result) {
      onEdit(result);
      onClose();
    }
  }, [result, onEdit, onClose]);

  const handleCancel = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  // Calculate position to keep popover in viewport
  const adjustedPosition = {
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y, window.innerHeight - 200),
  };

  return (
    <div
      className="selection-popover fixed z-50 bg-popover border rounded-lg shadow-lg p-2 min-w-[280px] max-w-[400px]"
      style={{
        left: adjustedPosition.left,
        top: adjustedPosition.top,
      }}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Processing...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-3">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Try Again
          </Button>
        </div>
      )}

      {/* Result State */}
      {result && !isLoading && (
        <div className="space-y-3">
          <div className="max-h-[200px] overflow-y-auto p-2 bg-muted/50 rounded text-sm">
            {result}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <IoCloseOutline className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleApply}>
              <IoCheckmarkOutline className="h-4 w-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isLoading && !result && !error && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-1 truncate max-w-[250px]">
            Selected: &quot;{selectedText.slice(0, 50)}{selectedText.length > 50 ? "..." : ""}&quot;
          </p>
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-9"
              onClick={() => handleAction("rewrite")}
            >
              <IoRefreshOutline className="h-4 w-4" />
              Rewrite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-9"
              onClick={() => handleAction("expand")}
            >
              <IoExpandOutline className="h-4 w-4" />
              Expand
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-9"
              onClick={() => handleAction("simplify")}
            >
              <Minimize2 className="h-4 w-4" />
              Simplify
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-9"
              onClick={() => handleAction("fix")}
            >
              <Wand2 className="h-4 w-4" />
              Fix Grammar
            </Button>
          </div>
          <div className="pt-1 border-t mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-muted-foreground"
              onClick={onClose}
            >
              <IoCloseOutline className="h-4 w-4 mr-1" />
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
