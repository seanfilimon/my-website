"use client";

import { useRef } from "react";
import {
  IoSearchOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoCodeSlashOutline
} from "react-icons/io5";

export interface TechCategory {
  category: string;
  icon: string;
  color: string;
  repos: string[];
}

interface GitHubSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: TechCategory[];
  expandedCategories: string[];
  onToggleCategory: (category: string) => void;
  stats: {
    totalRepos: number;
    totalStars: number;
    totalCommits: number;
    totalContributions: number;
  };
}

export function GitHubSidebar({
  searchQuery,
  onSearchChange,
  categories,
  expandedCategories,
  onToggleCategory,
  stats
}: GitHubSidebarProps) {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <aside 
      ref={containerRef}
      className="h-full w-full border-r bg-muted/10 overflow-hidden"
    >
      {/* Scrollable content container */}
      <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin">
        <div className="p-4">
          {/* Header Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 px-2 select-none">
              Repositories
            </h2>
            
            {/* Search Input */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search repos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Technology Categories Tree */}
          <nav className="space-y-1 mb-6">
            {categories.map((category) => {
              const isExpanded = expandedCategories.includes(category.category);
              
              return (
                <div key={category.category} className="relative">
                  {/* Vertical tree line for expanded categories */}
                  {isExpanded && category.repos.length > 0 && (
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
                    
                    {/* Tech Icon/Logo */}
                    <div
                      className="flex items-center justify-center h-5 w-5 rounded text-xs font-bold shrink-0"
                      style={{ 
                        backgroundColor: `${category.color}20`,
                        color: category.color
                      }}
                    >
                      {category.icon}
                    </div>
                    
                    {/* Category Name */}
                    <span className="text-sm font-semibold flex-1 group-hover:text-foreground transition-colors">
                      {category.category}
                    </span>
                    
                    {/* Count Badge */}
                    <span className="text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted shrink-0">
                      {category.repos.length}
                    </span>
                  </button>

                  {/* Expanded Repos */}
                  <div
                    className="overflow-hidden transition-all duration-200 ease-in-out"
                    style={{
                      maxHeight: isExpanded ? `${category.repos.length * 40}px` : '0px',
                      opacity: isExpanded ? 1 : 0
                    }}
                  >
                    <div className="ml-6 mt-1 space-y-0.5">
                      {category.repos.map((repoName) => (
                        <a
                          key={repoName}
                          href={`#${repoName}`}
                          className="relative flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent transition-all group select-none text-sm"
                        >
                          <IoCodeSlashOutline className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate group-hover:text-primary transition-colors">
                            {repoName}
                          </span>
                        </a>
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
              GitHub Stats
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center select-none">
                <span className="text-muted-foreground">Total Repos</span>
                <span className="font-bold text-foreground text-sm">{stats.totalRepos}</span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between items-center select-none">
                <span className="text-muted-foreground">Total Stars</span>
                <span className="font-semibold text-foreground">
                  {stats.totalStars.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center select-none">
                <span className="text-muted-foreground">Commits (2024)</span>
                <span className="font-semibold text-foreground">
                  {stats.totalCommits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center select-none">
                <span className="text-muted-foreground">Contributions</span>
                <span className="font-semibold text-foreground">
                  {stats.totalContributions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
