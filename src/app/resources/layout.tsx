"use client";

import { useState } from "react";
import { ResourcesSidebarWrapper } from "@/src/components/pages/resources/resources-sidebar-wrapper";
import { ResourcesProvider } from "./resources-context";

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ResourcesProvider toggleSidebar={() => setSidebarOpen(!sidebarOpen)}>
      <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
        <div className="flex w-full h-full overflow-hidden">
          {/* Sidebar Wrapper */}
          <ResourcesSidebarWrapper 
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Content Area */}
          <div className="flex-1 min-w-0 h-full">
      {children}
    </div>
        </div>
      </div>
    </ResourcesProvider>
  );
}
