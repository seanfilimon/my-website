"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  IoCodeSlashOutline,
  IoSearchOutline,
  IoStarOutline,
  IoDownloadOutline,
  IoLogoGithub
} from "react-icons/io5";

// Sample templates data
const templates = [
  {
    id: 1,
    name: "Next.js SaaS Starter",
    description: "Complete SaaS starter with authentication, payments, and dashboard. Built with Next.js 16 and TypeScript.",
    image: "/bg-pattern.png",
    category: "Full-Stack",
    stars: 1234,
    downloads: 5678,
    tech: ["Next.js", "TypeScript", "Prisma", "Stripe"],
    githubUrl: "https://github.com/seanfilimon/nextjs-saas-starter",
    demoUrl: "https://nextjs-saas-starter.vercel.app",
    href: "/templates/nextjs-saas-starter"
  },
  {
    id: 2,
    name: "React Dashboard Template",
    description: "Modern admin dashboard with charts, tables, and data visualization components.",
    image: "/bg-pattern.png",
    category: "Dashboard",
    stars: 890,
    downloads: 3456,
    tech: ["React", "Tailwind", "Chart.js"],
    githubUrl: "https://github.com/seanfilimon/react-dashboard",
    demoUrl: "https://react-dashboard.vercel.app",
    href: "/templates/react-dashboard"
  },
  {
    id: 3,
    name: "Portfolio Template",
    description: "Beautiful portfolio website with animations and modern design. Perfect for developers and designers.",
    image: "/bg-pattern.png",
    category: "Portfolio",
    stars: 2345,
    downloads: 8901,
    tech: ["Next.js", "GSAP", "Tailwind"],
    githubUrl: "https://github.com/seanfilimon/portfolio-template",
    demoUrl: "https://portfolio-template.vercel.app",
    href: "/templates/portfolio-template"
  },
  {
    id: 4,
    name: "E-commerce Starter",
    description: "Full-featured e-commerce platform with product management, cart, and checkout.",
    image: "/bg-pattern.png",
    category: "E-commerce",
    stars: 1567,
    downloads: 4321,
    tech: ["Next.js", "Stripe", "Prisma"],
    githubUrl: "https://github.com/seanfilimon/ecommerce-starter",
    demoUrl: "https://ecommerce-starter.vercel.app",
    href: "/templates/ecommerce-starter"
  },
];

const categories = ["All", "Full-Stack", "Dashboard", "Portfolio", "E-commerce", "Landing Page"];

export function TemplatesContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Starter Templates
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Production-ready templates and boilerplates to kickstart your next project.
            Built with modern tools and best practices.
          </p>
        </div>

        {/* Search & Categories */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group border rounded-lg overflow-hidden hover:border-primary hover:shadow-lg transition-all bg-card"
            >
              {/* Template Preview */}
              <div className="relative aspect-video bg-muted">
                <Image
                  src={template.image}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Template Content */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded">
                      {template.category}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5">
                  {template.tech.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex px-2 py-1 text-xs border rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <IoStarOutline className="h-4 w-4" />
                    <span>{template.stars.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IoDownloadOutline className="h-4 w-4" />
                    <span>{template.downloads.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-sm">
                    <Link href={template.githubUrl} target="_blank" className="flex items-center justify-center gap-2">
                      <IoLogoGithub className="h-4 w-4" />
                      View Code
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1 rounded-sm">
                    <Link href={template.demoUrl} target="_blank" className="flex items-center justify-center gap-2">
                      <IoCodeSlashOutline className="h-4 w-4" />
                      Live Demo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <IoSearchOutline className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
