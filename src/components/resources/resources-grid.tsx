"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IoSearchOutline,
  IoFilterOutline,
  IoDocumentTextOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoArrowForwardOutline,
  IoStarOutline,
} from "react-icons/io5";

interface Resource {
  id: string;
  name: string;
  slug: string;
  icon: string;
  iconUrl?: string | null;
  color: string;
  description: string;
  type: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  officialUrl: string | null;
  docsUrl: string | null;
  githubUrl: string | null;
  featured?: boolean;
  articleCount: number;
  blogCount: number;
  courseCount: number;
  videoCount: number;
  totalContent: number;
  tags: Array<{
    name: string;
    slug: string;
  }>;
}

interface ResourcesGridProps {
  resources: Resource[];
  categories: Array<{ id: string; name: string; slug: string }>;
  types: Array<{ id: string; name: string; slug: string }>;
}

function ResourceCard({ resource, featured = false }: { resource: Resource; featured?: boolean }) {
  return (
    <Link
      href={`/resources/${resource.slug}`}
      className={`
        group relative flex items-center gap-4 p-4 rounded-lg border bg-card
        hover:bg-accent/50 hover:border-primary/30 transition-all duration-200
        ${featured ? 'border-primary/20 bg-primary/5' : ''}
      `}
    >
      {/* Icon */}
      <div 
        className="relative shrink-0 h-12 w-12 rounded-lg flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: resource.iconUrl ? 'transparent' : `${resource.color}15` }}
      >
        {resource.iconUrl ? (
          <Image 
            src={resource.iconUrl} 
            alt={resource.name} 
            fill 
            className="object-cover" 
            sizes="48px"
          />
        ) : (
          <span className="text-2xl" style={{ color: resource.color }}>{resource.icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
            {resource.name}
          </h3>
          {featured && (
            <IoStarOutline className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {resource.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IoDocumentTextOutline className="h-3 w-3" />
            {resource.articleCount + resource.blogCount}
          </span>
          <span className="flex items-center gap-1">
            <IoBookOutline className="h-3 w-3" />
            {resource.courseCount}
          </span>
          <span className="flex items-center gap-1">
            <IoPlayCircleOutline className="h-3 w-3" />
            {resource.videoCount}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <IoArrowForwardOutline className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

export default function ResourcesGrid({ resources, categories, types }: ResourcesGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category.slug === selectedCategory;
    const matchesType = selectedType === "all" || resource.type.slug === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.totalContent - a.totalContent;
      case "name":
        return a.name.localeCompare(b.name);
      case "articles":
        return b.articleCount - a.articleCount;
      case "courses":
        return b.courseCount - a.courseCount;
      default:
        return 0;
    }
  });

  // Group by category for display
  const groupedByCategory = sortedResources.reduce((acc, resource) => {
    const categoryName = resource.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  const isFiltering = searchQuery || selectedCategory !== "all" || selectedType !== "all";

  return (
    <div className="space-y-10">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-lg bg-muted/30 border">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-36 bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-36 bg-background">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(type => (
              <SelectItem key={type.id} value={type.slug}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-36 bg-background">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="articles">Most Articles</SelectItem>
            <SelectItem value="courses">Most Courses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedResources.length} of {resources.length} resources
      </div>

      {/* Resources by Category */}
      {isFiltering ? (
        // Flat grid when filtering
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} featured={resource.featured} />
          ))}
        </div>
      ) : (
        // Grouped by category when not filtering
        <div className="space-y-10">
          {Object.entries(groupedByCategory).map(([categoryName, categoryResources]) => (
            <section key={categoryName}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{categoryName}</h2>
                <span className="text-sm text-muted-foreground">
                  {categoryResources.length} {categoryResources.length === 1 ? 'resource' : 'resources'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} featured={resource.featured} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedResources.length === 0 && (
        <div className="text-center py-16">
          <IoFilterOutline className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resources found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedType("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
