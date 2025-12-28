"use client";

import { Button } from "@/components/ui/button";
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
  IoFilterOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
} from "react-icons/io5";
import {
  ContentType,
  FilterState,
  ContentStatus,
  CONTENT_TYPE_CONFIGS,
} from "@/src/lib/admin/types";
import { cn } from "@/src/lib/utils";

interface ContentFiltersBarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  activeType: ContentType;
  itemCount: number;
  totalCount: number;
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

export function ContentFiltersBar({
  filters,
  onFilterChange,
  onResetFilters,
  activeType,
  itemCount,
  totalCount,
}: ContentFiltersBarProps) {
  const config = CONTENT_TYPE_CONFIGS[activeType];

  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.resourceId !== "ALL" ||
    filters.categoryId !== "ALL" ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined;

  const activeFilterCount = [
    filters.status !== "ALL",
    filters.resourceId !== "ALL",
    filters.categoryId !== "ALL",
    filters.dateFrom !== undefined || filters.dateTo !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="border-b bg-card/30 px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Left side - Results count */}
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">{config.labelPlural}</h2>
        <Badge variant="secondary" className="font-normal">
          {itemCount === totalCount 
            ? `${totalCount} items` 
            : `${itemCount} of ${totalCount}`}
        </Badge>
      </div>

      {/* Right side - Filters */}
      <div className="flex items-center gap-2">
        {/* Status Filter (if applicable) */}
        {config.hasStatus && (
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value as ContentStatus | "ALL")}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
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
            <SelectTrigger className="w-36 h-8 text-xs">
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

        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-8 gap-2 text-xs",
                (filters.dateFrom || filters.dateTo) && "border-primary"
              )}
            >
              <IoCalendarOutline className="h-3.5 w-3.5" />
              {filters.dateFrom || filters.dateTo 
                ? `${filters.dateFrom ? format(filters.dateFrom, "MMM d") : "Start"} - ${filters.dateTo ? format(filters.dateTo, "MMM d") : "End"}`
                : "Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex">
              <div className="border-r">
                <div className="p-2 text-xs font-medium text-center border-b">From</div>
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => onFilterChange("dateFrom", date)}
                  initialFocus
                />
              </div>
              <div>
                <div className="p-2 text-xs font-medium text-center border-b">To</div>
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => onFilterChange("dateTo", date)}
                />
              </div>
            </div>
            {(filters.dateFrom || filters.dateTo) && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    onFilterChange("dateFrom", undefined);
                    onFilterChange("dateTo", undefined);
                  }}
                >
                  Clear dates
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange("sortBy", value as FilterState["sortBy"])}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
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
          className="h-8 px-2 text-xs"
          onClick={() =>
            onFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")
          }
        >
          {filters.sortOrder === "asc" ? "↑" : "↓"}
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            onClick={onResetFilters}
          >
            <IoRefreshOutline className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
