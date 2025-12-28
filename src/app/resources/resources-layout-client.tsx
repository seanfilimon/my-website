"use client";

import { useState } from "react";
import { ResourcesSidebarWrapper } from "@/src/components/pages/resources/resources-sidebar-wrapper";
import { ResourcesProvider } from "./resources-context";

export interface SidebarCategory {
  category: string;
  categorySlug: string;
  items: Array<{
    id: string;
    name: string;
    logo: string;
    color: string;
    tutorials: number;
    guides: number;
    articles: number;
    href: string;
  }>;
}

interface ResourcesLayoutClientProps {
  children: React.ReactNode;
  sidebarData: SidebarCategory[];
}

export function ResourcesLayoutClient({
  children,
  sidebarData,
}: ResourcesLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ResourcesProvider toggleSidebar={() => setSidebarOpen(!sidebarOpen)}>
      <div className="h-[calc(100vh-4rem)] w-full bg-background">
        <div className="flex w-full h-full">
          {/* Sidebar Wrapper */}
          <ResourcesSidebarWrapper 
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarData={sidebarData}
          />

          {/* Content Area */}
          <div className="flex-1 min-w-0 h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </ResourcesProvider>
  );
}



