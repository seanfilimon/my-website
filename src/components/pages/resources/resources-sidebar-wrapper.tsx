"use client";

import { useState } from "react";
import { ResourcesSidebar, resourcesTree } from "@/src/components/pages/resources";

interface ResourcesSidebarWrapperProps {
  sidebarOpen: boolean;
  onToggle: () => void;
}

export function ResourcesSidebarWrapper({ sidebarOpen, onToggle }: ResourcesSidebarWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Frameworks"]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        resources-sidebar-wrapper
        fixed lg:relative left-0 top-0 h-full w-72 z-50 shrink-0
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ResourcesSidebar
          categories={resourcesTree}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
        />
      </aside>
    </>
  );
}

