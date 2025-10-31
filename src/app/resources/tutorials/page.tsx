"use client";

import { useState } from "react";
import Link from "next/link";
import { IoHomeOutline, IoChevronForwardOutline, IoSearchOutline, IoMenuOutline, IoCloseOutline } from "react-icons/io5";
import { ResourcesMobileMenu } from "@/src/components/pages/resources/resources-mobile-menu";

export default function TutorialsPage() {
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
                <span className="font-medium text-foreground">Tutorials</span>
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
            <p className="text-xs text-muted-foreground">Step-by-step guides and hands-on tutorials</p>
          </div>
        </div>

        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="w-full px-4 py-4">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="search" placeholder="Search tutorials..." className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
          <div className="text-center py-12 text-muted-foreground">
            <p>Tutorials coming soon...</p>
          </div>
        </div>
    </main>

      <ResourcesMobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}

