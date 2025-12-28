"use client";

import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IoSearchOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoDocumentTextOutline,
  IoNewspaperOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoGridOutline,
  IoLayersOutline,
  IoCloseOutline,
} from "react-icons/io5";

export interface ResourceItem {
  id: string;
  name: string;
  logo: string;
  logoUrl?: string | null;
  color: string;
  tutorials: number;
  guides: number;
  articles: number;
  href: string;
}

export interface ResourceCategory {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
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

// Content type links for the dropdown
const contentTypeLinks = [
  { name: "Browse All", href: "/resources/browse", icon: IoGridOutline, keywords: ["browse", "all", "resources", "search"] },
  { name: "Blogs", href: "/blogs", icon: IoNewspaperOutline, keywords: ["blog", "blogs", "posts", "writing"] },
  { name: "Articles", href: "/articles", icon: IoDocumentTextOutline, keywords: ["article", "articles", "docs", "documentation"] },
  { name: "Courses", href: "/courses", icon: IoBookOutline, keywords: ["course", "courses", "tutorial", "tutorials", "learn", "learning"] },
  { name: "Videos", href: "/videos", icon: IoPlayCircleOutline, keywords: ["video", "videos", "watch", "youtube"] },
];

export function ResourcesSidebar({
  categories,
  searchQuery,
  onSearchChange,
  expandedCategories,
  onToggleCategory
}: ResourcesSidebarProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [contentExpanded, setContentExpanded] = useState(true);
  
  const allResources = categories.flatMap(cat => cat.items);
  
  // Normalize search query
  const normalizedQuery = searchQuery.toLowerCase().trim();
  const isSearching = normalizedQuery.length > 0;

  // Filter content links based on search
  const filteredContentLinks = useMemo(() => {
    if (!isSearching) return contentTypeLinks;
    return contentTypeLinks.filter(link => 
      link.name.toLowerCase().includes(normalizedQuery) ||
      link.keywords.some(kw => kw.includes(normalizedQuery))
    );
  }, [normalizedQuery, isSearching]);

  // Filter categories and their items based on search
  const filteredCategories = useMemo(() => {
    if (!isSearching) return categories;
    
    return categories
      .map(category => {
        // Check if category name matches
        const categoryMatches = category.category.toLowerCase().includes(normalizedQuery);
        
        // Filter items within category
        const filteredItems = category.items.filter(item =>
          item.name.toLowerCase().includes(normalizedQuery)
        );
        
        // Include category if it matches or has matching items
        if (categoryMatches || filteredItems.length > 0) {
          return {
            ...category,
            items: categoryMatches ? category.items : filteredItems, // Show all items if category matches
          };
        }
        return null;
      })
      .filter((cat): cat is ResourceCategory => cat !== null);
  }, [categories, normalizedQuery, isSearching]);

  // Get all matching resources for flat display when searching
  const flatSearchResults = useMemo(() => {
    if (!isSearching) return [];
    return allResources.filter(item =>
      item.name.toLowerCase().includes(normalizedQuery)
    );
  }, [allResources, normalizedQuery, isSearching]);

  // Auto-expand categories with matches when searching
  const effectiveExpandedCategories = useMemo(() => {
    if (isSearching) {
      // When searching, expand all categories that have matches
      return filteredCategories.map(cat => cat.category);
    }
    return expandedCategories;
  }, [isSearching, filteredCategories, expandedCategories]);

  const hasResults = filteredContentLinks.length > 0 || filteredCategories.length > 0;

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
              Resources
            </h2>
            
            {/* Search Input */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search content & topics..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              {isSearching && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
                >
                  <IoCloseOutline className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Search Results Count */}
            {isSearching && (
              <div className="mt-2 px-2 text-xs text-muted-foreground">
                {flatSearchResults.length + filteredContentLinks.length} results for "{searchQuery}"
              </div>
            )}
          </div>

          {/* No Results State */}
          {isSearching && !hasResults && (
            <div className="text-center py-8">
              <IoSearchOutline className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No results found</p>
              <button
                onClick={() => onSearchChange("")}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {hasResults && (
            <>
              {/* Content Dropdown */}
              {filteredContentLinks.length > 0 && (
                <nav className="space-y-1 mb-4">
                  <div className="relative">
                    {/* Vertical tree line for expanded content */}
                    {(contentExpanded || isSearching) && (
                      <div 
                        className="absolute left-[18px] top-10 bottom-0 w-[2px] bg-border/30"
                        style={{ height: `${filteredContentLinks.length * 40}px` }}
                      />
                    )}

                    {/* Content Header Button */}
                    <button
                      onClick={() => setContentExpanded(!contentExpanded)}
                      className="w-full flex items-center gap-2 px-2 py-2.5 rounded-sm hover:bg-muted/50 transition-all text-left group select-none"
                    >
                      {/* Chevron */}
                      <div className="shrink-0 transition-transform duration-200">
                        {(contentExpanded || isSearching) ? (
                          <IoChevronDownOutline className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <IoChevronForwardOutline className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Icon */}
                      <IoLayersOutline className="h-4 w-4 text-muted-foreground shrink-0" />
                      
                      {/* Name */}
                      <span className="text-sm font-semibold flex-1 group-hover:text-foreground transition-colors">
                        Content
                      </span>
                      
                      {/* Count Badge */}
                      <span className="text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted shrink-0">
                        {filteredContentLinks.length}
                      </span>
                    </button>

                    {/* Expanded Content Links */}
                    <div
                      className="overflow-hidden transition-all duration-200 ease-in-out"
                      style={{
                        maxHeight: (contentExpanded || isSearching) ? `${filteredContentLinks.length * 44}px` : '0px',
                        opacity: (contentExpanded || isSearching) ? 1 : 0
                      }}
                    >
                      <div className="ml-6 mt-1 space-y-0.5">
                        {filteredContentLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="relative flex items-center gap-3 px-2 py-2 rounded-sm hover:bg-accent transition-all group select-none"
                            >
                              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                              <span className="text-sm group-hover:text-primary transition-colors">
                                {isSearching ? (
                                  <HighlightMatch text={link.name} query={normalizedQuery} />
                                ) : (
                                  link.name
                                )}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </nav>
              )}

              {/* Divider */}
              {filteredContentLinks.length > 0 && filteredCategories.length > 0 && (
                <div className="h-px bg-border mb-4" />
              )}

              {/* Topics Tree Navigation */}
              {filteredCategories.length > 0 && (
                <nav className="space-y-1 mb-6">
                  {filteredCategories.map((category) => {
                    const Icon = category.icon;
                    const isExpanded = effectiveExpandedCategories.includes(category.category);
                    
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
                          onClick={() => !isSearching && onToggleCategory(category.category)}
                          className={`w-full flex items-center gap-2 px-2 py-2.5 rounded-sm hover:bg-muted/50 transition-all text-left group select-none ${isSearching ? 'cursor-default' : ''}`}
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
                            {isSearching ? (
                              <HighlightMatch text={category.category} query={normalizedQuery} />
                            ) : (
                              category.category
                            )}
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
                            {category.items.map((item) => (
                              <Link
                                key={item.id}
                                href={item.href}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="relative flex items-center gap-3 px-2 py-2 rounded-sm hover:bg-accent transition-all group select-none"
                              >
                                {/* Logo Badge */}
                                <div
                                  className="flex items-center justify-center h-6 w-6 rounded text-xs font-bold shrink-0 transition-transform duration-200 group-hover:scale-110 overflow-hidden"
                                  style={{ 
                                    backgroundColor: item.logoUrl ? 'transparent' : `${item.color}${hoveredItem === item.id ? '30' : '20'}`,
                                    color: item.color
                                  }}
                                >
                                  {item.logoUrl ? (
                                    <Image src={item.logoUrl} alt={item.name} width={24} height={24} className="object-contain" />
                                  ) : (
                                    item.logo
                                  )}
                                </div>
                                
                                {/* Resource Name */}
                                <span className="text-sm flex-1 truncate group-hover:text-primary transition-colors">
                                  {isSearching ? (
                                    <HighlightMatch text={item.name} query={normalizedQuery} />
                                  ) : (
                                    item.name
                                  )}
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
              )}
            </>
          )}

          {/* Stats Panel - Only show when not searching */}
          {!isSearching && (
            <div className="p-3 rounded-sm bg-accent/50 border border-border/50">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 select-none">
                Library Stats
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center select-none">
                  <span className="text-muted-foreground">Topics</span>
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
          )}
        </div>
      </div>
    </aside>
  );
}

// Helper component to highlight matching text
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return <>{text}</>;
  
  return (
    <>
      {text.slice(0, index)}
      <span className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}
