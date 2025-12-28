"use client";

import { useState } from "react";
import { 
  Plus, 
  Loader2, 
  MessageSquare, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  MoreVertical 
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";

interface Thread {
  id: string;
  title: string;
  lastMessage?: string;
  messageCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ThreadSidebarProps {
  threads: Thread[];
  currentThreadId?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onLoadMore?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function ThreadSidebar({
  threads,
  currentThreadId,
  isLoading,
  hasMore,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onLoadMore,
  collapsed = false,
  onToggleCollapse,
  className,
}: ThreadSidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (threadId: string) => {
    setDeletingId(threadId);
    try {
      await onDeleteThread(threadId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  if (collapsed) {
    return (
      <div className={cn("w-12 border-r flex flex-col bg-muted/30", className)}>
        <div className="p-2 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleCollapse}
            className="w-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onNewThread}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.slice(0, 10).map((thread) => (
            <Button
              key={thread.id}
              variant={currentThreadId === thread.id ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onSelectThread(thread.id)}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-64 border-r flex flex-col bg-muted/30", className)}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <Button onClick={onNewThread} className="flex-1 mr-2" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        {onToggleCollapse && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && threads.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a new chat to get started
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "group relative rounded-md hover:bg-muted transition-colors",
                  currentThreadId === thread.id && "bg-muted"
                )}
              >
                <button
                  onClick={() => onSelectThread(thread.id)}
                  className="w-full text-left px-3 py-2.5"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {thread.title || "New conversation"}
                      </p>
                      {thread.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {thread.lastMessage}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(thread.updatedAt)}
                        {thread.messageCount !== undefined && (
                          <span className="ml-2">• {thread.messageCount} messages</span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
                
                {/* Delete Menu */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDelete(thread.id)}
                        disabled={deletingId === thread.id}
                        className="text-destructive focus:text-destructive"
                      >
                        {deletingId === thread.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {/* Load More */}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load more"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreadSidebar;
