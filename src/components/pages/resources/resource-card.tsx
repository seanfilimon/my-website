import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  IoPlayCircleOutline,
  IoMapOutline,
  IoDocumentTextOutline
} from "react-icons/io5";
import { ResourceItem } from "./resources-sidebar";

interface ResourceCardProps {
  resource: ResourceItem;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link
      href={resource.href}
      className="group border rounded-lg overflow-hidden hover:border-primary hover:shadow-lg transition-all bg-card"
    >
      {/* Card Header with Logo */}
      <div className="p-6 border-b bg-muted/20">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center h-12 w-12 rounded-lg text-xl font-bold shrink-0 overflow-hidden"
            style={{ 
              backgroundColor: resource.logoUrl ? 'transparent' : `${resource.color}20`,
              color: resource.color
            }}
          >
            {resource.logoUrl ? (
              <Image src={resource.logoUrl} alt={resource.name} width={48} height={48} className="object-contain" />
            ) : (
              resource.logo
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
              {resource.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Card Body - Content Stats */}
      <div className="p-6 space-y-4">
        {/* Content Type Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-full bg-primary/10 text-primary mb-2">
              <IoPlayCircleOutline className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{resource.tutorials}</div>
            <div className="text-xs text-muted-foreground">Tutorials</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-full bg-primary/10 text-primary mb-2">
              <IoMapOutline className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{resource.guides}</div>
            <div className="text-xs text-muted-foreground">Guides</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-full bg-primary/10 text-primary mb-2">
              <IoDocumentTextOutline className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{resource.articles}</div>
            <div className="text-xs text-muted-foreground">Articles</div>
          </div>
        </div>

        {/* Total Count */}
        <div className="pt-4 border-t text-center">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {resource.tutorials + resource.guides + resource.articles}
            </span>
            {" "}total resources available
          </span>
        </div>

        {/* View Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full rounded-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
        >
          View All Resources →
        </Button>
      </div>
    </Link>
  );
}

