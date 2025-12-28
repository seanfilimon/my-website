"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminSidebar } from "./admin-sidebar";
import { ContentList } from "./content-list";
import { BulkActionsBar } from "./bulk-actions-bar";
import { ContentFiltersBar } from "./content-filters-bar";
import {
  ContentType,
  ContentItem,
  FilterState,
  DEFAULT_FILTER_STATE,
  CONTENT_TYPE_CONFIGS,
} from "@/src/lib/admin/types";
import {
  useSelection,
  filterContentItems,
  sortContentItems,
} from "@/src/lib/admin/hooks";
import {
  useContentData,
  useContentCounts,
} from "@/src/lib/admin/use-content-data";
import { useContentMutations, useBulkDelete } from "@/src/lib/admin/use-content-mutations";

export function UnifiedAdminPanel() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<ContentType>("blogs");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Fetch content data using tRPC
  const { data: items, isLoading, isError, error, refetch } = useContentData(activeType, filters);
  
  // Get content counts for sidebar
  const contentCounts = useContentCounts();

  // Get mutations for the active type
  const mutations = useContentMutations(activeType);
  const { bulkDelete } = useBulkDelete(activeType);

  // Filter and sort items (client-side for additional filtering)
  const filteredItems = filterContentItems(items, filters);
  const sortedItems = sortContentItems(filteredItems, filters.sortBy, filters.sortOrder);

  // Selection state
  const selection = useSelection(sortedItems);

  // Handle content type change
  const handleTypeChange = useCallback((type: ContentType) => {
    setActiveType(type);
    selection.clearSelection();
    setFilters(DEFAULT_FILTER_STATE);
  }, [selection.clearSelection]);

  // Handle filter change
  const handleFilterChange = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  // Handle item click - navigate to editor page
  const handleItemClick = useCallback((item: ContentItem) => {
    router.push(`/admin/edit/${activeType}/${item.id}`);
  }, [router, activeType]);

  // Handle create new - navigate to unified creator
  const handleCreateNew = useCallback(() => {
    router.push(`/admin/create?type=${activeType}`);
  }, [router, activeType]);

  // Get config for toast messages
  const config = CONTENT_TYPE_CONFIGS[activeType];

  // Handle bulk publish
  const handleBulkPublish = useCallback(async () => {
    if (!mutations.bulkPublish) return;
    
    try {
      const count = selection.selectedIds.size;
      await mutations.bulkPublish.mutateAsync({ ids: Array.from(selection.selectedIds) });
      selection.clearSelection();
      toast.success(`${count} ${count === 1 ? config.label : config.labelPlural} published`);
    } catch (error) {
      console.error("Failed to publish:", error);
      toast.error("Failed to publish items");
    }
  }, [mutations.bulkPublish, selection, config]);

  // Handle bulk archive
  const handleBulkArchive = useCallback(async () => {
    if (!mutations.bulkArchive) return;
    
    try {
      const count = selection.selectedIds.size;
      await mutations.bulkArchive.mutateAsync({ ids: Array.from(selection.selectedIds) });
      selection.clearSelection();
      toast.success(`${count} ${count === 1 ? config.label : config.labelPlural} archived`);
    } catch (error) {
      console.error("Failed to archive:", error);
      toast.error("Failed to archive items");
    }
  }, [mutations.bulkArchive, selection, config]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    try {
      const result = await bulkDelete(Array.from(selection.selectedIds));
      selection.clearSelection();
      if (result.failed > 0) {
        toast.warning(`Deleted ${result.succeeded}/${result.total} items. ${result.failed} failed.`);
      } else {
        toast.success(`${result.succeeded} ${result.succeeded === 1 ? config.label : config.labelPlural} deleted`);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete items");
    }
  }, [bulkDelete, selection, config]);

  // Handle reorder
  const handleReorder = useCallback((newItems: ContentItem[]) => {
    // TODO: Implement reorder mutation
    console.log("Reordering:", newItems.map((i) => i.id));
  }, []);

  // Handle inline edit
  const handleInlineEdit = useCallback(async (id: string, field: string, value: any) => {
    try {
      await mutations.update.mutateAsync({ id, [field]: value });
      toast.success("Updated successfully");
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update");
    }
  }, [mutations.update]);

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <AdminSidebar
        activeType={activeType}
        onTypeChange={handleTypeChange}
        counts={contentCounts}
        searchValue={filters.search}
        onSearchChange={(value) => handleFilterChange("search", value)}
        onCreateNew={handleCreateNew}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filters Bar */}
        <ContentFiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          activeType={activeType}
          itemCount={sortedItems.length}
          totalCount={items.length}
        />

        {/* Content List */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading content...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-destructive mb-2">Failed to load content</p>
                <p className="text-sm text-muted-foreground mb-4">{error?.message}</p>
                <button
                  onClick={() => refetch()}
                  className="text-primary hover:underline text-sm"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <ContentList
              items={sortedItems}
              activeType={activeType}
              selectedIds={selection.selectedIds}
              onItemClick={handleItemClick}
              onSelectionChange={selection.toggleSelection}
              onSelectAll={selection.selectAll}
              onClearSelection={selection.clearSelection}
              onCreateNew={handleCreateNew}
              onReorder={handleReorder}
              onInlineEdit={handleInlineEdit}
              isAllSelected={selection.isAllSelected}
              isSomeSelected={selection.isSomeSelected}
            />
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selection.selectedCount > 0 && (
          <BulkActionsBar
            selectedCount={selection.selectedCount}
            onPublish={handleBulkPublish}
            onArchive={handleBulkArchive}
            onDelete={handleBulkDelete}
            onClearSelection={selection.clearSelection}
            activeType={activeType}
            isPublishing={mutations.isBulkPublishing}
            isArchiving={mutations.isBulkArchiving}
          />
        )}
      </div>
    </div>
  );
}
