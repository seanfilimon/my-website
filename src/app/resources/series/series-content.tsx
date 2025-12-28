"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IoHomeOutline,
  IoChevronForwardOutline,
  IoSearchOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoLayersOutline,
} from "react-icons/io5";
import { ResourcesMobileMenu } from "@/src/components/pages/resources/resources-mobile-menu";
import { Button } from "@/components/ui/button";

export function SeriesContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <main className="resources-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
        <div className="breadcrumb-section border-b bg-muted/5">
          <div className="w-full px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <IoHomeOutline className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">Series</span>
              </div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-sm hover:bg-accent transition-colors">
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
            <p className="text-xs text-muted-foreground">Multi-part content series on complex topics</p>
          </div>
        </div>

        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="w-full px-4 py-4">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search series..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <IoLayersOutline className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-2xl font-bold mb-3">Content Series Coming Soon</h2>

            <p className="text-muted-foreground mb-6">
              We&apos;re working on curated multi-part series that dive deep into complex topics.
              Each series will guide you through comprehensive learning paths with structured content.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card text-left">
                <h3 className="font-semibold mb-2">What to expect:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>In-depth multi-part tutorials on frameworks and tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Progressive learning paths from beginner to advanced</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Real-world project walkthroughs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Comprehensive guides on best practices</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/resources/tutorials">
                    Browse Tutorials
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/resources/articles">
                    Read Articles
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ResourcesMobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
