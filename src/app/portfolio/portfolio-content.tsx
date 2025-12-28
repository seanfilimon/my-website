"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoArrowForwardOutline,
  IoLogoGithub,
  IoSearchOutline,
  IoFunnelOutline,
  IoChevronDownOutline,
  IoGlobeOutline,
} from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/src/lib/trpc/client";

// Map Experience types to portfolio categories
const TYPE_TO_CATEGORY: Record<string, string> = {
  WORK: "Companies",
  PROJECT: "Projects",
};

// Transform Experience data to portfolio card format
interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  logo?: string | null;
  website?: string;
  tags: string[];
  stats: Record<string, string>;
  links: {
    live?: string | null;
    github?: string | null;
    case_study: string;
  };
  featured: boolean;
  slug: string;
}

function transformExperienceToProject(exp: any): PortfolioProject {
  // Extract website from organizationUrl or projectUrl
  const websiteUrl = exp.organizationUrl || exp.projectUrl;
  const website = websiteUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Combine technologies and tags
  const tags = [
    ...(exp.technologies?.map((t: any) => t.name) || []),
    ...(exp.tags?.map((t: any) => t.name) || []),
  ];

  // Convert metrics to stats object
  const stats: Record<string, string> = {};
  exp.metrics?.forEach((m: any) => {
    stats[m.label.toLowerCase().replace(/\s+/g, "_")] = m.value;
  });

  return {
    id: exp.id,
    title: exp.title,
    category: TYPE_TO_CATEGORY[exp.type] || exp.type,
    description: exp.summary || exp.description?.slice(0, 200) || "",
    image: exp.thumbnail || exp.coverImage || "/bg-pattern.png",
    logo: exp.organizationLogo,
    website,
    tags,
    stats,
    links: {
      live: exp.projectUrl || exp.demoUrl || exp.organizationUrl,
      github: exp.githubUrl,
      case_study: `/portfolio/experience/${exp.slug}`,
    },
    featured: exp.featured,
    slug: exp.slug,
  };
}

// Loading skeleton for project cards
function ProjectCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="flex flex-col gap-2 pl-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20 ml-auto" />
        </div>
        <Skeleton className="h-3 w-48" />
        <div className="flex gap-1.5 mt-1">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const portfolioRef = useRef<HTMLDivElement>(null);

  // Fetch experiences from database
  const { data, isLoading, error } = trpc.experience.list.useQuery({
    published: true,
    limit: 100,
    orderBy: "order",
    order: "asc",
  });

  // Filter for portfolio types (WORK and PROJECT only)
  const portfolioExperiences = useMemo(() => {
    if (!data?.experiences) return [];
    return data.experiences.filter(
      (exp) => exp.type === "WORK" || exp.type === "PROJECT"
    );
  }, [data?.experiences]);

  // Transform experiences to project format
  const projects = useMemo(() => {
    return portfolioExperiences.map(transformExperienceToProject);
  }, [portfolioExperiences]);

  // Derive all tags from experiences
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    // Add categories first
    tagSet.add("Companies");
    tagSet.add("Projects");
    // Add all technologies and tags from experiences
    portfolioExperiences.forEach((exp) => {
      exp.technologies?.forEach((t: any) => tagSet.add(t.name));
      exp.tags?.forEach((t: any) => tagSet.add(t.name));
    });
    return Array.from(tagSet);
  }, [portfolioExperiences]);

  // Filter projects based on search and tags
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchQuery === "" || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => 
          project.tags.includes(tag) || project.category === tag
        );
      
      return matchesSearch && matchesTags;
    });
  }, [projects, searchQuery, selectedTags]);

  return (
    <div ref={portfolioRef} className="py-20">
      {/* Header */}
      <div className="portfolio-header max-w-6xl mx-auto px-4 text-center mb-16 space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold">
          My Portfolio
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Companies, products, and projects I&apos;ve built while sharing the journey and lessons learned
        </p>
      </div>

      {/* Filter Section */}
      <div className="portfolio-filters max-w-7xl mx-auto px-4 mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-sm border-border"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-sm gap-2 min-w-48" disabled={isLoading}>
                <IoFunnelOutline className="h-4 w-4" />
                <span>Filter by Category & Tags</span>
                {selectedTags.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-sm">
                    {selectedTags.length}
                  </span>
                )}
                <IoChevronDownOutline className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-64 overflow-y-auto">
              <div className="p-3">
                <div className="grid grid-cols-3 gap-1">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`px-2 py-1.5 text-xs rounded-sm border text-left transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-accent"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <Button
                    onClick={() => setSelectedTags([])}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 rounded-sm text-xs"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">
              Failed to load portfolio items. Please try again later.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="rounded-sm"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Projects Grid - Clean Cards */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                  <Image
                    src={project.image}
                    alt={`${project.title} preview`}
                    fill
                    className="object-cover transition-all duration-300"
                  />

                  {/* Featured Badge - Above Blur */}
                  {project.featured && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md shadow-lg">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-background/80 backdrop-blur-sm">
                    {/* Top Row - Quick Actions */}
                    <div className="self-stretch flex justify-end items-start gap-1.5">
                      {/* View Details Button */}
                      <Button
                        asChild
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md bg-background/90 hover:bg-background border shadow-md transition-all duration-200"
                      >
                        <Link href={project.links.case_study}>
                          <IoArrowForwardOutline className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* GitHub Link */}
                      {project.links.github && (
                        <Button
                          asChild
                          size="sm"
                          className="h-8 w-8 p-0 rounded-md bg-foreground hover:bg-foreground/80 text-background shadow-md transition-all duration-200"
                        >
                          <Link href={project.links.github} target="_blank">
                            <IoLogoGithub className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}

                      {/* Live Site Link */}
                      {project.links.live && (
                        <Button
                          asChild
                          size="sm"
                          className="h-8 w-8 p-0 rounded-md bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all duration-200"
                        >
                          <Link href={project.links.live} target="_blank">
                            <IoGlobeOutline className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {/* Bottom Row - Main Action */}
                    <div className="w-full flex justify-center">
                      <Button
                        asChild
                        className="rounded-lg flex items-center gap-2 shadow-lg font-bold text-black dark:text-black bg-primary hover:bg-primary/90"
                      >
                        <Link href={project.links.case_study}>
                          <span>View Details</span>
                          <IoArrowForwardOutline className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex items-center gap-3 pb-1 pl-1">
                  <div className="flex flex-1 flex-col gap-2">
                    {/* Title and Category */}
                    <div className="flex items-center gap-2">
                      {/* Company Logo */}
                      {project.category === "Companies" && project.logo && (
                        <div className="relative h-5 w-5 overflow-hidden rounded-full shrink-0">
                          <Image
                            src={project.logo}
                            alt={`${project.title} logo`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <span className="line-clamp-1 font-medium leading-none transition-colors duration-300 select-none">
                        {project.title}
                      </span>
                      
                      {/* Category Badge */}
                      <div className="px-2 py-0.5 rounded bg-accent flex items-center justify-center shrink-0 ml-auto select-none">
                        <span className="text-xs font-medium text-accent-foreground">
                          {project.category}
                        </span>
                      </div>
                      
                      {project.featured && (
                        <div className="px-2 py-0.5 rounded text-xs font-medium shrink-0 select-none bg-primary/10 text-primary">
                          FEATURED
                        </div>
                      )}
                    </div>

                    {/* Stats and Website */}
                    <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                      <span className="truncate whitespace-nowrap leading-none select-none">
                        {project.category === "Companies" && project.website ? (
                          <>
                            <span className="text-primary font-medium">{project.website}</span>
                            {Object.keys(project.stats).length > 0 && (
                              <>
                                <span className="mx-1">•</span>
                                {Object.entries(project.stats).map(([key, value]) => `${value} ${key.replace('_', ' ')}`).join(' • ')}
                              </>
                            )}
                          </>
                        ) : Object.keys(project.stats).length > 0 ? (
                          Object.entries(project.stats).map(([key, value]) => `${value} ${key.replace('_', ' ')}`).join(' • ')
                        ) : (
                          <span className="text-muted-foreground/60">No stats available</span>
                        )}
                      </span>
                    </div>

                    {/* Technology Icons */}
                    {project.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {project.tags.slice(0, 4).map((tech: string, index: number) => {
                          const size = index === 0 ? 22 : 18;
                          
                          return (
                            <div 
                              key={index} 
                              className="transition-all duration-300 rounded-full flex items-center justify-center bg-accent"
                              style={{ width: size, height: size }}
                            >
                              <span 
                                className="text-accent-foreground font-medium select-none"
                                style={{ fontSize: index === 0 ? '10px' : '8px' }}
                              >
                                {tech.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          );
                        })}
                        {project.tags.length > 4 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            +{project.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {projects.length === 0 
                ? "No portfolio items found. Add some experiences to get started!"
                : "No projects found matching your criteria."
              }
            </p>
            {selectedTags.length > 0 || searchQuery !== "" ? (
              <Button 
                onClick={() => {
                  setSelectedTags([]);
                  setSearchQuery("");
                }}
                variant="outline"
                className="mt-4 rounded-sm"
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 text-center mt-20">
        <div className="border-2 border-border rounded-sm p-8 space-y-4">
          <h2 className="text-3xl font-bold">
            Want to Build Something Together?
          </h2>
          <p className="text-muted-foreground">
            I&apos;m always interested in collaborating on projects that make a difference for developers and entrepreneurs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button asChild className="rounded-sm font-bold text-black dark:text-black uppercase">
              <Link href="/contact">Start a Conversation</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-sm">
              <Link href="/about">Learn About My Process</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
