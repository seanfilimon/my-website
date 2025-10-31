"use client";

import { useState } from "react";
import Link from "next/link";
import { IoSearchOutline, IoCloseOutline, IoChevronDownOutline } from "react-icons/io5";
import { resourcesTree } from "./resources-data";

interface ResourcesMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResourcesMobileMenu({ isOpen, onClose }: ResourcesMobileMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Frameworks"]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Full Page Menu */}
      <div className="fixed inset-0 top-16 bg-background z-50 lg:hidden overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b shrink-0">
            <h2 className="text-lg font-semibold">Browse Resources</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-10 w-10 rounded-sm hover:bg-accent transition-colors"
              aria-label="Close menu"
            >
              <IoCloseOutline className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-base rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>

            {/* Collapsible Categories */}
            <div className="space-y-2">
              {resourcesTree.map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategories.includes(category.category);
                
                return (
                  <div key={category.category} className="border rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.category)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                          {category.items.length}
                        </span>
                        <IoChevronDownOutline 
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Category Items */}
                    {isExpanded && (
                      <div className="space-y-1 p-2 bg-muted/20">
                        {category.items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div
                              className="flex items-center justify-center h-8 w-8 rounded text-sm font-bold shrink-0"
                              style={{ 
                                backgroundColor: `${item.color}20`,
                                color: item.color
                              }}
                            >
                              {item.logo}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.tutorials + item.guides + item.articles} resources
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

