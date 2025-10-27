"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
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
  IoLogoGithub
} from "react-icons/io5";
import { ThemeToggle } from "./theme-toggle";
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
  const isResourcesPage = pathname?.startsWith("/resources");
  const isGitHubPage = pathname?.startsWith("/github");
  
  const navRef = useRef<HTMLDivElement>(null);
  const logoSectionRef = useRef<HTMLDivElement>(null);
  const mainNavRef = useRef<HTMLDivElement>(null);
  const resourceNavRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navRef.current) return;

    const tl = gsap.timeline();

    if (isResourcesPage) {
      // Animate to Resources layout - quick and smooth
      tl.to(mainNavRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (mainNavRef.current) {
            mainNavRef.current.style.display = "none";
          }
        }
      }, 0)
      .set(resourceNavRef.current, { display: "flex" }, 0.25)
      .fromTo(resourceNavRef.current, {
        opacity: 0,
        y: -15
      }, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out"
      }, 0.25);
    } else {
      // Animate to Regular layout - quick transition
      tl.to(resourceNavRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (resourceNavRef.current) {
            resourceNavRef.current.style.display = "none";
          }
        }
      }, 0)
      .set(mainNavRef.current, { display: "flex" }, 0.25)
      .fromTo(mainNavRef.current, {
        opacity: 0,
        y: -15
      }, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out"
      }, 0.25);
    }

    return () => {
      tl.kill();
    };
  }, [isResourcesPage]);

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={(isResourcesPage || isGitHubPage) ? "mx-auto" : "container max-w-7xl mx-auto border-l border-r"}>
        <div className="flex h-16 items-center">
          {/* Logo Section - Fixed width to prevent choking */}
          <div
            ref={logoSectionRef}
            className={`h-full flex items-center shrink-0 transition-all ${(isResourcesPage || isGitHubPage) ? 'w-72 border-r px-4' : 'pl-4 pr-0'}`}
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full shrink-0">
                <Image
                  src="/face_grayscale_nobg.png"
                  alt="Sean Filimon"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xs font-medium uppercase tracking-wide leading-tight">
                  Sean Filimon
                </span>
                {(isResourcesPage || isGitHubPage) ? (
                  <span className="text-xs text-muted-foreground leading-tight">
                    Founder & CEO
                  </span>
                ) : (
                  <AnimatedTitle />
                )}
              </div>
            </Link>
          </div>

          {/* Flex spacer for content */}
          <div className="flex-1 flex items-center justify-between px-4">
            {/* Main Navigation - Hidden in resources mode */}
            <div ref={mainNavRef} className="flex items-center gap-1">
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

            {/* Resources Navigation - Hidden in normal mode */}
            <div
              ref={resourceNavRef}
              className="hidden items-center gap-1 opacity-0"
              style={{ transform: "translateY(-20px)" }}
            >
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

            {/* Right Actions */}
            <div ref={actionsRef} className="flex items-center gap-2">
              <ThemeToggle />
              {!(isResourcesPage || isGitHubPage) && (
                <Button asChild className="rounded-sm font-bold uppercase tracking-tight">
                  <Link href="/get-started">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

