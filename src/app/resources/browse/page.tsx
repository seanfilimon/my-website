import { Metadata } from "next";
import { Suspense } from "react";
import ResourcesGrid from "@/components/resources/resources-grid";
import { caller } from "@/src/lib/trpc/server";

export const metadata: Metadata = {
  title: "Browse Resources | Sean Filimon",
  description:
    "Explore a comprehensive collection of frameworks, libraries, and tools for modern web development.",
  openGraph: {
    title: "Browse Resources | Sean Filimon",
    description:
      "Explore a comprehensive collection of frameworks, libraries, and tools for modern web development.",
  },
};

async function getResourcesData() {
  try {
    const [resources, categories, types] = await Promise.all([
      caller.resource.getAllWithCounts(),
      caller.resource.listCategories(),
      caller.resource.listTypes(),
    ]);

    return {
      resources,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      types: types.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
    };
  } catch (error) {
    console.error("Error fetching resources:", error);
    return {
      resources: [],
      categories: [],
      types: [],
    };
  }
}

export default async function BrowseResourcesPage() {
  const { resources, categories, types } = await getResourcesData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Resources</h1>
          <p className="text-muted-foreground">
            Search and filter through all available frameworks, libraries, and
            tools.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-lg text-muted-foreground">
                Loading resources...
              </div>
            </div>
          }
        >
          <ResourcesGrid
            resources={resources}
            categories={categories}
            types={types}
          />
        </Suspense>
      </div>
    </div>
  );
}
