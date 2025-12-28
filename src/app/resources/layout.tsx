import { caller } from "@/src/lib/trpc/server";
import { ResourcesLayoutClient } from "./resources-layout-client";

async function getSidebarData() {
  try {
    const sidebarData = await caller.resource.getForSidebar();
    return sidebarData;
  } catch (error) {
    console.error("Error fetching sidebar data:", error);
    return [];
  }
}

export default async function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = await getSidebarData();

  return (
    <ResourcesLayoutClient sidebarData={sidebarData}>
      {children}
    </ResourcesLayoutClient>
  );
}
