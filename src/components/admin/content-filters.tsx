"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  IoSearchOutline,
  IoFilterOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
  IoCloseOutline,
} from "react-icons/io5";
import {
  ContentType,
  FilterState,
  ContentStatus,
  CONTENT_TYPE_CONFIGS,
} from "@/src/lib/admin/types";
import { cn } from "@/src/lib/utils";

interface ContentFiltersProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  activeType: ContentType;
}

const STATUS_OPTIONS: { value: ContentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const SORT_OPTIONS: { value: FilterState["sortBy"]; label: string }[] = [
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "publishedAt", label: "Published Date" },
  { value: "views", label: "Views" },
  { value: "likes", label: "Likes" },
  { value: "title", label: "Title" },
];

// Mock resources for filter - will be replaced with tRPC query
const RESOURCE_OPTIONS = [
  { value: "ALL", label: "All Resources" },
  { value: "nextjs", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "typescript", label: "TypeScript" },
  { value: "nodejs", label: "Node.js" },
];

// Mock categories for filter - will be replaced with tRPC query
const CATEGORY_OPTIONS = [
  { value: "ALL", label: "All Categories" },
  { value: "framework", label: "Framework" },
  { value: "library", label: "Library" },
  { value: "language", label: "Language" },
  { value: "tool", label: "Tool" },
];

export function ContentFilters({
  filters,
  onFilterChange,
  onResetFilters,
  activeType,
}: ContentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const config = CONTENT_TYPE_CONFIGS[activeType];

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "ALL" ||
    filters.resourceId !== "ALL" ||
    filters.categoryId !== "ALL" ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined;

  const activeFilterCount = [
    filters.search !== "",
    filters.status !== "ALL",
    filters.resourceId !== "ALL",
    filters.categoryId !== "ALL",
    filters.dateFrom !== undefined || filters.dateTo !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="border-b bg-card/30 px-4 py-3 space-y-3">
      {/* Primary Filters Row */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${config.labelPlural.toLowerCase()}...`}
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-9 h-9"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IoCloseOutline className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter (if applicable) */}
        {config.hasStatus && (
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value as ContentStatus | "ALL")}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Resource Filter (if applicable) */}
        {config.hasResource && (
          <Select
            value={filters.resourceId}
            onValueChange={(value) => onFilterChange("resourceId", value)}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange("sortBy", value as FilterState["sortBy"])}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3"
          onClick={() =>
            onFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")
          }
        >
          {filters.sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
        </Button>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 gap-2", showAdvanced && "bg-muted")}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <IoFilterOutline className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
          <IoChevronDownOutline
            className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")}
          />
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-muted-foreground"
            onClick={onResetFilters}
          >
            <IoRefreshOutline className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Advanced Filters Row */}
      {showAdvanced && (
        <div className="flex items-center gap-2 pt-2 border-t">
          {/* Category Filter (if applicable) */}
          {config.hasCategory && (
            <Select
              value={filters.categoryId}
              onValueChange={(value) => onFilterChange("categoryId", value)}
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date Range - From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <IoCalendarOutline className="h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "MMM d, yyyy") : "From Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => onFilterChange("dateFrom", date)}
                initialFocus
              />
              {filters.dateFrom && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => onFilterChange("dateFrom", undefined)}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Date Range - To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <IoCalendarOutline className="h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "MMM d, yyyy") : "To Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => onFilterChange("dateTo", date)}
                initialFocus
              />
              {filters.dateTo && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => onFilterChange("dateTo", undefined)}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{filters.search}"
                  <button onClick={() => onFilterChange("search", "")}>
                    <IoCloseOutline className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.status}
                  <button onClick={() => onFilterChange("status", "ALL")}>
                    <IoCloseOutline className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.resourceId !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  Resource: {filters.resourceId}
                  <button onClick={() => onFilterChange("resourceId", "ALL")}>
                    <IoCloseOutline className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
