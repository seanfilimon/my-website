"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  IoSearchOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline
} from "react-icons/io5";

export interface ResourceItem {
  id: string;
  name: string;
  logo: string;
  color: string;
  tutorials: number;
  guides: number;
  articles: number;
  href: string;
}

export interface ResourceCategory {
  category: string;
  icon: any;
  expanded: boolean;
  items: ResourceItem[];
}

interface ResourcesSidebarProps {
  categories: ResourceCategory[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  expandedCategories: string[];
  onToggleCategory: (category: string) => void;
}

export function ResourcesSidebar({
  categories,
  searchQuery,
  onSearchChange,
  expandedCategories,
  onToggleCategory
}: ResourcesSidebarProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const allResources = categories.flatMap(cat => cat.items);

  return (
    <aside 
      ref={containerRef}
      className="h-full w-full border-r bg-muted/10 flex flex-col overflow-hidden"
    >
      {/* Scrollable content container - takes full height */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <div className="p-4">
          {/* Header Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 px-2 select-none">
              Browse Resources
            </h2>
            
            {/* Search Input */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Tree Navigation */}
          <nav className="space-y-1 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.includes(category.category);
              
              return (
                <div key={category.category} className="relative">
                  {/* Vertical tree line for expanded categories */}
                  {isExpanded && category.items.length > 0 && (
                    <div 
                      className="absolute left-[18px] top-10 bottom-0 w-[2px] bg-border/30"
                      style={{ height: 'calc(100% - 40px)' }}
                    />
                  )}

                  {/* Category Header Button */}
                  <button
                    onClick={() => onToggleCategory(category.category)}
                    className="w-full flex items-center gap-2 px-2 py-2.5 rounded-sm hover:bg-muted/50 transition-all text-left group select-none"
                  >
                    {/* Chevron */}
                    <div className="shrink-0 transition-transform duration-200">
                      {isExpanded ? (
                        <IoChevronDownOutline className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <IoChevronForwardOutline className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Category Icon */}
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    
                    {/* Category Name */}
                    <span className="text-sm font-semibold flex-1 group-hover:text-foreground transition-colors">
                      {category.category}
                    </span>
                    
                    {/* Count Badge */}
                    <span className="text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted shrink-0">
                      {category.items.length}
                    </span>
                  </button>

                  {/* Expanded Items with animation */}
                  <div
                    className="overflow-hidden transition-all duration-200 ease-in-out"
                    style={{
                      maxHeight: isExpanded ? `${category.items.length * 48}px` : '0px',
                      opacity: isExpanded ? 1 : 0
                    }}
                  >
                    <div className="ml-6 mt-1 space-y-0.5">
                      {category.items.map((item, index) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className="relative flex items-center gap-3 px-2 py-2 rounded-sm hover:bg-accent transition-all group select-none"
                        >
                          {/* Logo Badge */}
                          <div
                            className="flex items-center justify-center h-6 w-6 rounded text-xs font-bold shrink-0 transition-transform duration-200 group-hover:scale-110"
                            style={{ 
                              backgroundColor: `${item.color}${hoveredItem === item.id ? '30' : '20'}`,
                              color: item.color
                            }}
                          >
                            {item.logo}
                          </div>
                          
                          {/* Resource Name */}
                          <span className="text-sm flex-1 truncate group-hover:text-primary transition-colors">
                            {item.name}
                          </span>
                          
                          {/* Total Count Badge */}
                          <span className="text-xs text-muted-foreground font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.tutorials + item.guides + item.articles}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Stats Panel */}
          <div className="p-3 rounded-sm bg-accent/50 border border-border/50">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 select-none">
              Library Stats
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center select-none">
                <span className="text-muted-foreground">Total Resources</span>
                <span className="font-bold text-foreground text-sm">{allResources.length}</span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between items-center select-none">
                <span className="text-muted-foreground">Tutorials</span>
                <span className="font-semibold text-foreground">
                  {allResources.reduce((sum, r) => sum + r.tutorials, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center select-none">
                <span className="text-muted-foreground">Guides</span>
                <span className="font-semibold text-foreground">
                  {allResources.reduce((sum, r) => sum + r.guides, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center select-none">
                <span className="text-muted-foreground">Articles</span>
                <span className="font-semibold text-foreground">
                  {allResources.reduce((sum, r) => sum + r.articles, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
