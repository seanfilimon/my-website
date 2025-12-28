"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  ContentType, 
  ContentItem, 
  FilterState, 
  DEFAULT_FILTER_STATE,
  ContentStatus,
} from "./types";

// Hook for managing selected items
export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string, shiftKey = false) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      
      if (shiftKey && lastSelectedId) {
        // Shift-click: select range
        const itemIds = items.map((item) => item.id);
        const lastIndex = itemIds.indexOf(lastSelectedId);
        const currentIndex = itemIds.indexOf(id);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          for (let i = start; i <= end; i++) {
            next.add(itemIds[i]);
          }
        }
      } else {
        // Regular click: toggle single item
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }
      
      return next;
    });
    
    setLastSelectedId(id);
  }, [items, lastSelectedId]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  return {
    selectedIds,
    selectedItems,
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected: items.length > 0 && selectedIds.size === items.length,
    isSomeSelected: selectedIds.size > 0 && selectedIds.size < items.length,
  };
}

// Hook for managing filters
export function useFilters(initialState: FilterState = DEFAULT_FILTER_STATE) {
  const [filters, setFilters] = useState<FilterState>(initialState);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.status !== "ALL" ||
      filters.resourceId !== "ALL" ||
      filters.categoryId !== "ALL" ||
      filters.dateFrom !== undefined ||
      filters.dateTo !== undefined
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    setFilters,
  };
}

// Hook for managing the active content type
export function useContentType(initialType: ContentType = "blogs") {
  const [activeType, setActiveType] = useState<ContentType>(initialType);

  return {
    activeType,
    setActiveType,
  };
}

// Hook for managing the editing state
export function useEditing<T extends { id: string }>(items: T[]) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [items, editingId]
  );

  const startEditing = useCallback((id: string) => {
    setEditingId(id);
    setIsCreating(false);
  }, []);

  const startCreating = useCallback(() => {
    setEditingId(null);
    setIsCreating(true);
  }, []);

  const stopEditing = useCallback(() => {
    setEditingId(null);
    setIsCreating(false);
  }, []);

  return {
    editingId,
    editingItem,
    isCreating,
    isEditing: editingId !== null || isCreating,
    startEditing,
    startCreating,
    stopEditing,
  };
}

// Hook for inline editing
export function useInlineEdit<T>(
  initialValue: T,
  onSave: (value: T) => Promise<void> | void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setValue(initialValue);
  }, [initialValue]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setValue(initialValue);
  }, [initialValue]);

  const saveEdit = useCallback(async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, [value, initialValue, onSave]);

  return {
    isEditing,
    value,
    setValue,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}

// Hook for drag and drop reordering
export function useDragReorder<T extends { id: string }>(
  items: T[],
  onReorder: (items: T[]) => void
) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleDragEnd = useCallback(
    (activeId: string, overId: string) => {
      setActiveId(null);

      if (activeId === overId) return;

      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);

      onReorder(newItems);
    },
    [items, onReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [items, activeId]
  );

  return {
    activeId,
    activeItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}

// Hook for autosave
export function useAutosave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay = 2000
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const save = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(data);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to save"));
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave]);

  return {
    isSaving,
    lastSaved,
    error,
    save,
  };
}

// Utility function to filter content items
export function filterContentItems<T extends ContentItem>(
  items: T[],
  filters: FilterState
): T[] {
  return items.filter((item) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const title = "title" in item ? item.title : "name" in item ? (item as any).name : "";
      const matchesTitle = title.toLowerCase().includes(searchLower);
      
      const excerpt = "excerpt" in item ? (item as any).excerpt : "";
      const description = "description" in item ? (item as any).description : "";
      const matchesContent = excerpt.toLowerCase().includes(searchLower) || 
                            description.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesContent) return false;
    }

    // Status filter
    if (filters.status !== "ALL" && "status" in item) {
      if ((item as any).status !== filters.status) return false;
    }

    // Resource filter
    if (filters.resourceId !== "ALL" && "resourceId" in item) {
      if ((item as any).resourceId !== filters.resourceId) return false;
    }

    // Category filter
    if (filters.categoryId !== "ALL" && "categoryId" in item) {
      if ((item as any).categoryId !== filters.categoryId) return false;
    }

    // Date range filter
    if (filters.dateFrom && "createdAt" in item) {
      if (new Date((item as any).createdAt) < filters.dateFrom) return false;
    }
    if (filters.dateTo && "createdAt" in item) {
      if (new Date((item as any).createdAt) > filters.dateTo) return false;
    }

    return true;
  });
}

// Utility function to sort content items
export function sortContentItems<T extends ContentItem>(
  items: T[],
  sortBy: FilterState["sortBy"],
  sortOrder: FilterState["sortOrder"]
): T[] {
  return [...items].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "title":
        aValue = "title" in a ? a.title : "name" in a ? (a as any).name : "";
        bValue = "title" in b ? b.title : "name" in b ? (b as any).name : "";
        break;
      case "createdAt":
        aValue = "createdAt" in a ? new Date((a as any).createdAt).getTime() : 0;
        bValue = "createdAt" in b ? new Date((b as any).createdAt).getTime() : 0;
        break;
      case "updatedAt":
        aValue = "updatedAt" in a ? new Date((a as any).updatedAt).getTime() : 0;
        bValue = "updatedAt" in b ? new Date((b as any).updatedAt).getTime() : 0;
        break;
      case "publishedAt":
        aValue = "publishedAt" in a && (a as any).publishedAt 
          ? new Date((a as any).publishedAt).getTime() 
          : 0;
        bValue = "publishedAt" in b && (b as any).publishedAt 
          ? new Date((b as any).publishedAt).getTime() 
          : 0;
        break;
      case "views":
        aValue = "views" in a ? (a as any).views : 0;
        bValue = "views" in b ? (b as any).views : 0;
        break;
      case "likes":
        aValue = "likes" in a ? (a as any).likes : 0;
        bValue = "likes" in b ? (b as any).likes : 0;
        break;
      default:
        return 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });
}
