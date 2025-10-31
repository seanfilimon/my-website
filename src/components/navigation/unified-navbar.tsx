"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoPersonOutline,
  IoLibraryOutline,
  IoBriefcaseOutline,
  IoNewspaperOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoListOutline,
  IoDocumentTextOutline,
  IoLogoGithub,
  IoMenuOutline,
  IoCloseOutline,
  IoLogoDiscord
} from "react-icons/io5";
import { AnimatedTitle } from "./animated-title";

const resourceTopicTabs = [
  { id: "all", name: "All Resources", icon: IoBookOutline, href: "/resources" },
  { id: "articles", name: "Articles", icon: IoDocumentTextOutline, href: "/resources/articles" },
  { id: "blogs", name: "Blogs", icon: IoNewspaperOutline, href: "/resources/blogs" },
  { id: "tutorials", name: "Tutorials", icon: IoPlayCircleOutline, href: "/resources/tutorials" },
  { id: "series", name: "Series", icon: IoListOutline, href: "/resources/series" },
];

export function UnifiedNavbar() {
  const pathname = usePathname();
  const isResourcesPage = pathname ? pathname.startsWith("/resources") : false;
  const isGitHubPage = pathname ? pathname.startsWith("/github") : false;
  const isAdminPage = pathname ? pathname.startsWith("/admin") : false;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={(isResourcesPage || isGitHubPage || isAdminPage) ? "mx-auto" : "container max-w-7xl mx-auto border-l border-r"}>
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className={`h-full flex items-center shrink-0 transition-all duration-300 ${(isResourcesPage || isGitHubPage || isAdminPage) ? 'w-72 border-r px-4' : 'px-4'}`}>
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 overflow-hidden rounded-full shrink-0">
                <Image
                  src="/face_grayscale_nobg.png"
                  alt="Sean Filimon"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-xs font-medium uppercase tracking-wide leading-tight truncate">
                  Sean Filimon
                </span>
                {(isResourcesPage || isGitHubPage || isAdminPage) ? (
                  <span className="text-xs text-muted-foreground leading-tight truncate">
                    {isAdminPage ? "Administrator" : "Founder & CEO"}
                  </span>
                ) : (
                  <AnimatedTitle />
                )}
              </div>
            </Link>
          </div>

          {/* Center Navigation Section */}
          <div className="flex-1 flex items-center justify-center min-w-0 px-2">
            {/* Main Navigation - Hidden in resources/admin mode and on mobile */}
            <div className={`hidden md:flex items-center gap-1 transition-opacity duration-300 ${(isResourcesPage || isGitHubPage || isAdminPage) ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
              <Button variant="ghost" asChild className="rounded-sm gap-1.5">
                <Link href="/portfolio" className="flex items-center">
                  <IoBriefcaseOutline className="h-4 w-4" />
                  <span>Portfolio</span>
                </Link>
              </Button>

              <Button variant="ghost" asChild className="rounded-sm gap-1.5">
                <Link href="/github" className="flex items-center">
                  <IoLogoGithub className="h-4 w-4" />
                  <span>GitHub</span>
                </Link>
              </Button>

              <Button variant="ghost" asChild className="rounded-sm gap-1.5">
                <Link href="/resources" className="flex items-center">
                  <IoLibraryOutline className="h-4 w-4" />
                  <span>Resources</span>
                </Link>
              </Button>

              <Button variant="ghost" asChild className="rounded-sm gap-1.5">
                <Link href="/about" className="flex items-center">
                  <IoPersonOutline className="h-4 w-4" />
                  <span>About</span>
                </Link>
              </Button>
            </div>

            {/* Resources Navigation - Hidden in normal/admin mode and on mobile */}
            <div className={`hidden md:flex items-center gap-1 transition-opacity duration-300 ${(isResourcesPage || isGitHubPage) && !isAdminPage ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}>
              {resourceTopicTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    asChild
                    className={`rounded-sm gap-1.5 ${isActive ? 'bg-accent' : ''}`}
                  >
                    <Link href={tab.href} className="flex items-center">
                      <Icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{tab.name}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Right Actions Section */}
          <div className="flex items-center gap-2 shrink-0 px-4">
            <Button 
              variant="outline" 
              size="sm"
              asChild 
              className="hidden lg:flex rounded-sm gap-2"
            >
              <Link href="https://discord.gg/seanfilimon" target="_blank">
                <IoLogoDiscord className="h-4 w-4" />
                <span>Discord</span>
              </Link>
            </Button>
            {!(isResourcesPage || isGitHubPage || isAdminPage) && (
              <Button size="sm" asChild className="hidden md:flex rounded-sm font-bold">
                <Link href="/about">Learn More</Link>
              </Button>
            )}
            
            {/* Mobile Menu Button - Always visible on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-sm shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <IoCloseOutline className="h-5 w-5" />
              ) : (
                <IoMenuOutline className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>

      {/* Full Page Mobile Menu - Regular Pages Only */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/80 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Full Page Menu */}
          <div className="fixed inset-0 top-16 bg-background z-50 md:hidden overflow-y-auto">
            {!isResourcesPage && !isGitHubPage && (
              <div className="container mx-auto p-6 space-y-8">
                {/* Navigation Links */}
                <nav className="space-y-2">
                  <Link
                    href="/portfolio"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <IoBriefcaseOutline className="h-6 w-6" />
                    <div>
                      <div className="font-semibold text-lg">Portfolio</div>
                      <div className="text-sm text-muted-foreground">View my work</div>
                    </div>
                  </Link>
                  <Link
                    href="/github"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <IoLogoGithub className="h-6 w-6" />
                    <div>
                      <div className="font-semibold text-lg">GitHub</div>
                      <div className="text-sm text-muted-foreground">Open source projects</div>
                    </div>
                  </Link>
                  <Link
                    href="/resources"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <IoLibraryOutline className="h-6 w-6" />
                    <div>
                      <div className="font-semibold text-lg">Resources</div>
                      <div className="text-sm text-muted-foreground">Learning materials</div>
                    </div>
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <IoPersonOutline className="h-6 w-6" />
                    <div>
                      <div className="font-semibold text-lg">About</div>
                      <div className="text-sm text-muted-foreground">Learn more about me</div>
                    </div>
                  </Link>
                </nav>

                {/* Action Buttons */}
                <div className="pt-6 border-t space-y-3">
                  <Button asChild variant="outline" className="w-full rounded-sm gap-2 h-12">
                    <Link href="https://discord.gg/seanfilimon" target="_blank" onClick={() => setMobileMenuOpen(false)}>
                      <IoLogoDiscord className="h-5 w-5" />
                      Join Discord
                    </Link>
                  </Button>
                  <Button asChild className="w-full rounded-sm font-bold h-12">
                    <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Resources/GitHub mobile menus are handled by their respective pages */}
          </div>
        </>
      )}
    </>
  );
}

