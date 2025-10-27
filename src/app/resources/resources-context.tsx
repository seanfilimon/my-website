"use client";

import { createContext, useContext, use } from "react";

interface ResourcesContextType {
  toggleSidebar: () => void;
}

const ResourcesContext = createContext<ResourcesContextType>({
  toggleSidebar: () => {}
});

export function ResourcesProvider({ 
  children, 
  toggleSidebar 
}: { 
  children: React.ReactNode;
  toggleSidebar: () => void;
}) {
  return (
    <ResourcesContext.Provider value={{ toggleSidebar }}>
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  return useContext(ResourcesContext);
}

