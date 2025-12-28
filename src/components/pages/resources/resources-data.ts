// This file previously contained static resources data.
// Resources are now fetched via tRPC from the database.
// See: src/lib/trpc/routers/resource.ts - getForSidebar and getAllWithCounts procedures

// Keeping this file for backwards compatibility with any imports.
// The resourcesTree export is now empty - use tRPC data instead.

import { ResourceCategory } from "./resources-sidebar";

/**
 * @deprecated Use tRPC resource.getForSidebar() instead
 */
export const resourcesTree: ResourceCategory[] = [];
