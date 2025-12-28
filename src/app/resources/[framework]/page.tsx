import { notFound } from "next/navigation";
import { caller } from "@/src/lib/trpc/server";
import { ResourcePageContent } from "./resource-page-content";

interface ResourcePageProps {
  params: Promise<{ framework: string }>;
}

async function getResourceData(slug: string) {
  try {
    const resource = await caller.resource.bySlug({ slug });
    return resource;
  } catch (error) {
    console.error("Error fetching resource:", error);
    return null;
  }
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { framework } = await params;
  const resource = await getResourceData(framework);

  if (!resource) {
    notFound();
  }

  return <ResourcePageContent resource={resource} />;
}

export async function generateMetadata({ params }: ResourcePageProps) {
  const { framework } = await params;
  const resource = await getResourceData(framework);

  if (!resource) {
    return {
      title: "Resource Not Found",
    };
  }

  return {
    title: `${resource.name} Resources | Sean Filimon`,
    description: resource.description,
  };
}



