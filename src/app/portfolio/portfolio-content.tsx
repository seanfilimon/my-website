"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoArrowForwardOutline,
  IoLogoGithub,
  IoSearchOutline,
  IoFunnelOutline,
  IoChevronDownOutline,
  IoLogoTwitter,
  IoLogoLinkedin
} from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const allTags = [
  // Categories
  "Companies", "Software", "Designs", "Libraries", "Boilerplates",
  // Technologies
  "Next.js", "React", "TypeScript", "Node.js", "Stripe", 
  "AI", "DevOps", "SaaS", "Education", "CLI", "Security",
  "Performance", "Analytics", "MVP", "Storybook", "A11y",
  "WebRTC", "AWS", "Figma", "UI/UX"
];

const projects = [
  {
    id: 1,
    title: "TechFlow",
    category: "Companies",
    description: "Developer workflow platform with AI-powered code reviews and automated deployment pipelines. Currently at $2M ARR.",
    image: "/bg-pattern.png",
    logo: "/face_grayscale_nobg.png", // Company logo
    website: "techflow.dev",
    tags: ["Next.js", "TypeScript", "Stripe", "AI", "DevOps"],
    stats: {
      users: "15K+",
      revenue: "$2M ARR"
    },
    links: {
      live: "https://techflow.dev",
      case_study: "/case-studies/techflow",
      twitter: "https://twitter.com/techflowdev",
      linkedin: "https://linkedin.com/company/techflow"
    },
    featured: true
  },
  {
    id: 2,
    title: "React UI Pro",
    category: "Libraries",
    description: "Production-ready React component library with TypeScript, accessibility, and comprehensive documentation.",
    image: "/bg-pattern.png",
    tags: ["React", "TypeScript", "Storybook", "A11y"],
    stats: {
      stars: "2.4K",
      downloads: "50K+"
    },
    links: {
      github: "https://github.com/seanfilimon/react-ui-pro",
      live: "https://react-ui-pro.dev"
    },
    featured: true
  },
  {
    id: 3,
    title: "SaaS Starter Kit",
    category: "Boilerplates",
    description: "Complete Next.js SaaS boilerplate with auth, payments, dashboard, and deployment ready setup.",
    image: "/bg-pattern.png",
    tags: ["Next.js", "TypeScript", "Stripe", "Prisma"],
    stats: {
      downloads: "25K+",
      stars: "1.8K"
    },
    links: {
      github: "https://github.com/seanfilimon/saas-starter",
      live: "https://saas-starter-demo.com"
    },
    featured: true
  },
  {
    id: 4,
    title: "Brand Identity System",
    category: "Designs",
    description: "Complete brand identity and design system for TechFlow including logo, colors, typography, and components.",
    image: "/bg-pattern.png",
    tags: ["Figma", "UI/UX", "Design System", "Branding"],
    stats: {
      components: "150+",
      variants: "500+"
    },
    links: {
      live: "https://design.techflow.dev",
      case_study: "/designs/techflow-brand"
    },
    featured: false
  },
  {
    id: 5,
    title: "DevTools CLI Suite",
    category: "Software",
    description: "Command-line tools for developers including code analysis, project scaffolding, and deployment utilities.",
    image: "/bg-pattern.png",
    tags: ["CLI", "Node.js", "TypeScript", "DevOps"],
    stats: {
      downloads: "100K+",
      tools: "12"
    },
    links: {
      github: "https://github.com/seanfilimon/devtools-cli",
      docs: "/docs/devtools"
    },
    featured: false
  },
  {
    id: 6,
    title: "LegionEdge",
    category: "Companies",
    description: "Next-generation development platform combining AI-powered code generation with collaborative team tools. Currently in Series A.",
    image: "/bg-pattern.png",
    logo: "/face_grayscale_nobg.png",
    website: "legionedge.ai",
    tags: ["AI", "Next.js", "TypeScript", "SaaS", "DevOps"],
    stats: {
      users: "25K+",
      funding: "Series A"
    },
    links: {
      live: "https://legionedge.ai",
      case_study: "/case-studies/legionedge",
      twitter: "https://twitter.com/legionedgeai",
      linkedin: "https://linkedin.com/company/legionedge"
    },
    featured: true
  },
  {
    id: 7,
    title: "Cezium Software",
    category: "Companies",
    description: "Enterprise software solutions specializing in scalable web applications and cloud infrastructure for Fortune 500 companies.",
    image: "/bg-pattern.png",
    logo: "/me.png",
    website: "cezium.com",
    tags: ["Enterprise", "Cloud", "AWS", "React", "Node.js"],
    stats: {
      clients: "50+",
      revenue: "$10M+"
    },
    links: {
      live: "https://cezium.com",
      case_study: "/case-studies/cezium",
      linkedin: "https://linkedin.com/company/cezium-software"
    },
    featured: false
  },
  {
    id: 8,
    title: "OpticEngine Inc",
    category: "Companies",
    description: "Computer vision and AI company building advanced image processing solutions for autonomous systems and robotics.",
    image: "/bg-pattern.png",
    logo: "/face_grayscale_nobg.png",
    website: "opticengine.com",
    tags: ["AI", "Computer Vision", "Python", "Machine Learning", "Robotics"],
    stats: {
      patents: "12",
      partnerships: "8"
    },
    links: {
      live: "https://opticengine.com",
      case_study: "/case-studies/opticengine",
      twitter: "https://twitter.com/opticengine",
      linkedin: "https://linkedin.com/company/opticengine"
    },
    featured: false
  },
  {
    id: 9,
    title: "E-Commerce Starter",
    category: "Boilerplates",
    description: "Full-featured e-commerce boilerplate with cart, payments, admin panel, and inventory management.",
    image: "/bg-pattern.png",
    tags: ["Next.js", "Stripe", "Prisma", "Analytics"],
    stats: {
      stores: "200+",
      revenue: "$5M+ GMV"
    },
    links: {
      github: "https://github.com/seanfilimon/ecommerce-starter",
      live: "https://ecommerce-demo.dev"
    },
    featured: false
  }
];

export function PortfolioContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === "" || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => 
        project.tags.includes(tag) || project.category === tag
      );
    
    return matchesSearch && matchesTags;
  });

  // No scroll animations - keep it simple

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
              <Button variant="outline" className="rounded-sm gap-2 min-w-48">
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
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Projects Grid - Clean Cards */}
      <div className="max-w-7xl mx-auto px-4">
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
                    {/* Social Links for Companies */}
                    {project.category === "Companies" && project.links.twitter && (
                      <Button
                        asChild
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all duration-200"
                      >
                        <Link href={project.links.twitter} target="_blank">
                          <IoLogoTwitter className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    
                    {project.category === "Companies" && project.links.linkedin && (
                      <Button
                        asChild
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
                      >
                        <Link href={project.links.linkedin} target="_blank">
                          <IoLogoLinkedin className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    <Button
                      asChild
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md bg-background/90 hover:bg-background border shadow-md transition-all duration-200"
                    >
                      <Link href={project.links.case_study || project.links.live || "#"}>
                        <IoArrowForwardOutline className="h-4 w-4" />
                      </Link>
                    </Button>
                    
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
                  </div>

                  {/* Bottom Row - Main Action */}
                  <div className="w-full flex justify-center">
                    <Button
                      asChild
                      className="rounded-lg flex items-center gap-2 shadow-lg font-bold text-black dark:text-black bg-primary hover:bg-primary/90"
                    >
                      <Link href={project.links.live || project.links.case_study || "#"}>
                        <span>
                          {project.category === "Companies" ? "View Website" : 
                           project.links.case_study ? "View Case Study" : "View Project"}
                        </span>
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
                    <div className="px-2 py-0.5 rounded bg-accent flex items-center justify-center flex-shrink-0 ml-auto select-none">
                      <span className="text-xs font-medium text-accent-foreground">
                        {project.category}
                      </span>
                    </div>
                    
                    {project.featured && (
                      <div className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 select-none bg-primary/10 text-primary">
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
                      ) : (
                        Object.entries(project.stats).map(([key, value]) => `${value} ${key.replace('_', ' ')}`).join(' • ')
                      )}
                    </span>
                  </div>

                  {/* Technology Icons */}
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No projects found matching your criteria.
            </p>
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
