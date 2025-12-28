"use client";

import { useState, useMemo } from "react";
import { ResourcesSidebar, ResourceCategory } from "./resources-sidebar";
import {
  IoRocketOutline,
  IoFlashOutline,
  IoServerOutline,
  IoConstructOutline,
  IoCloudOutline,
  IoBriefcaseOutline,
  IoLayersOutline,
} from "react-icons/io5";

interface SidebarDataItem {
  category: string;
  categorySlug: string;
  items: Array<{
    id: string;
    name: string;
    logo: string;
    logoUrl?: string | null;
    color: string;
    tutorials: number;
    guides: number;
    articles: number;
    href: string;
  }>;
}

interface ResourcesSidebarWrapperProps {
  sidebarOpen: boolean;
  onToggle: () => void;
  sidebarData?: SidebarDataItem[];
}

// Map category slugs to icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  frontend: IoRocketOutline,
  backend: IoServerOutline,
  database: IoServerOutline,
  devops: IoCloudOutline,
  languages: IoFlashOutline,
  tools: IoConstructOutline,
  companies: IoBriefcaseOutline,
  default: IoLayersOutline,
};

function getCategoryIcon(categorySlug: string): React.ComponentType<{ className?: string }> {
  // Try exact match first
  if (categoryIcons[categorySlug.toLowerCase()]) {
    return categoryIcons[categorySlug.toLowerCase()];
  }
  
  // Try partial matches
  const slug = categorySlug.toLowerCase();
  if (slug.includes("front")) return IoRocketOutline;
  if (slug.includes("back")) return IoServerOutline;
  if (slug.includes("data")) return IoServerOutline;
  if (slug.includes("cloud") || slug.includes("devops")) return IoCloudOutline;
  if (slug.includes("lang")) return IoFlashOutline;
  if (slug.includes("tool") || slug.includes("lib")) return IoConstructOutline;
  if (slug.includes("compan") || slug.includes("business")) return IoBriefcaseOutline;
  
  return categoryIcons.default;
}

export function ResourcesSidebarWrapper({ 
  sidebarOpen, 
  onToggle,
  sidebarData = []
}: ResourcesSidebarWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => {
    // Expand first category by default if data exists
    return sidebarData.length > 0 ? [sidebarData[0].category] : [];
  });

  // Transform tRPC data to sidebar format
  const categories: ResourceCategory[] = useMemo(() => {
    if (sidebarData.length === 0) {
      return [];
    }

    return sidebarData.map((cat) => ({
      category: cat.category,
      icon: getCategoryIcon(cat.categorySlug),
      expanded: expandedCategories.includes(cat.category),
      items: cat.items,
    }));
  }, [sidebarData, expandedCategories]);

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
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
        />
      </aside>
    </>
  );
}
