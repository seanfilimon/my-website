"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  IoLogoGithub,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoSearchOutline,
  IoChevronDownOutline
} from "react-icons/io5";
import { GitHubSidebar, CompactRepoCard, repositories, techCategories, ContributionGraph, generateYearData } from "@/src/components/pages/github";

export default function GitHubPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Next.js"]);
  const [yearData] = useState(() => generateYearData());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<string[]>(["Next.js"]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const totalCommitsThisYear = yearData.reduce((sum, day) => sum + day.commits, 0);

  const stats = {
    totalRepos: repositories.length,
    totalStars: repositories.reduce((sum, repo) => sum + repo.stars, 0),
    totalCommits: totalCommitsThisYear,
    totalContributions: totalCommitsThisYear + 456 // Additional contributions (PRs, reviews, etc.)
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // GSAP Animations
  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    const tl = gsap.timeline({ delay: 0.1 });

    tl.fromTo(
      ".github-sidebar-wrapper",
      { x: -288, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out"
      }
    )
    .fromTo(
      ".breadcrumb-section",
      { opacity: 0, y: -15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out"
      },
      "-=0.3"
    )
    .fromTo(
      ".github-content > section",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out"
      },
      "-=0.2"
    );

    gsap.fromTo(
      ".repo-card-wrapper",
      { opacity: 0, y: 20, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".repos-grid",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (typeof window !== 'undefined') {
        document.documentElement.style.scrollBehavior = 'auto';
      }
    };
  }, []);

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        github-sidebar-wrapper
        fixed lg:sticky left-0 top-0 h-[calc(100vh-4rem)] w-72 z-50 shrink-0
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <GitHubSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={techCategories}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
          stats={stats}
        />
      </aside>

      {/* Main Content with constrained height */}
      <main ref={sectionRef} className="github-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
        {/* Breadcrumb */}
        <div className="breadcrumb-section border-b bg-muted/5">
          <div className="w-full px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Link 
                  href="/" 
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IoHomeOutline className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">GitHub Activity</span>
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-sm hover:bg-accent transition-colors"
              >
                {mobileMenuOpen ? (
                  <>
                    <IoCloseOutline className="h-4 w-4" />
                    <span>Close</span>
                  </>
                ) : (
                  <>
                    <IoMenuOutline className="h-4 w-4" />
                    <span>Menu</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Open source projects, contributions, and development activity
            </p>
          </div>
        </div>

        {/* Commit Activity Section - Full Year Contribution Graph */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/5">
          <div className="w-full">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Contribution Activity
              </h2>
              <p className="text-sm text-muted-foreground">
                {stats.totalCommits.toLocaleString()} contributions in the last year
              </p>
            </div>

            {/* GitHub-style Contribution Graph */}
            <div className="p-6 border rounded-lg bg-card mb-8 overflow-x-auto">
              <ContributionGraph data={yearData} />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg bg-card text-center">
                <div className="text-2xl font-bold mb-1">{stats.totalCommits.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Commits</div>
              </div>
              <div className="p-4 border rounded-lg bg-card text-center">
                <div className="text-2xl font-bold mb-1">{stats.totalContributions.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Contributions</div>
              </div>
              <div className="p-4 border rounded-lg bg-card text-center">
                <div className="text-2xl font-bold mb-1">{stats.totalStars.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Stars</div>
              </div>
              <div className="p-4 border rounded-lg bg-card text-center">
                <div className="text-2xl font-bold mb-1">{stats.totalRepos}</div>
                <div className="text-xs text-muted-foreground">Public Repos</div>
              </div>
            </div>
          </div>
        </section>

        {/* Repositories Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Public Repositories
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredRepos.length} open source projects
              </p>
            </div>

            {/* Compact Repos Grid */}
            <div className="repos-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRepos.map((repo) => (
                <div key={repo.id} className="repo-card-wrapper">
                  <CompactRepoCard repo={repo} />
                </div>
              ))}
            </div>

            {/* View on GitHub Button */}
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="sm" className="rounded-sm">
                <Link href="https://github.com/seanfilimon" target="_blank" className="flex items-center gap-2">
                  <IoLogoGithub className="h-4 w-4" />
                  View Full Profile on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Full Page Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-0 top-16 bg-background z-50 lg:hidden overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b shrink-0">
                <h2 className="text-lg font-semibold">Browse Repositories</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center h-10 w-10 rounded-sm hover:bg-accent transition-colors"
                  aria-label="Close menu"
                >
                  <IoCloseOutline className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search repositories..."
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>

                {/* Collapsible Tech Categories */}
                <div className="space-y-2">
                  {techCategories.map((category) => {
                    const isExpanded = expandedMobileCategories.includes(category.category);
                    const categoryRepos = repositories.filter(repo => 
                      repo.tech.some(tech => category.tech.includes(tech))
                    );
                    
                    return (
                      <div key={category.category} className="border rounded-lg overflow-hidden">
                        {/* Category Header */}
                        <button
                          onClick={() => {
                            setExpandedMobileCategories(prev =>
                              prev.includes(category.category)
                                ? prev.filter(c => c !== category.category)
                                : [...prev, category.category]
                            );
                          }}
                          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="flex items-center justify-center h-8 w-8 rounded text-lg"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              {category.icon}
                            </div>
                            <span className="font-semibold">{category.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                              {categoryRepos.length}
                            </span>
                            <IoChevronDownOutline 
                              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Category Repos */}
                        {isExpanded && (
                          <div className="space-y-1 p-2 bg-muted/20">
                            {categoryRepos.map((repo) => (
                              <a
                                key={repo.id}
                                href={`#${repo.name}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{repo.name}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {repo.description}
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
