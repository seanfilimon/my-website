"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  IoHomeOutline,
  IoLibraryOutline,
  IoSearchOutline,
  IoNotificationsOutline,
  IoAnalyticsOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoPersonCircleOutline,
  IoPersonOutline,
  IoGridOutline,
  IoNewspaperOutline,
  IoDocumentTextOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoBriefcaseOutline,
  IoLayersOutline,
  IoPricetagsOutline,
  IoAddOutline,
  IoEllipsisHorizontalOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import { AIChatPanel } from "@/src/components/admin";
import { AIContentProvider, useAIContent } from "@/src/lib/admin/ai-content-context";
import type { GeneratedContent } from "@/src/components/agent/use-content-agent";

// Quick navigation items for search
const quickNavItems = [
  { type: "page", title: "Content Manager", href: "/admin", icon: IoGridOutline },
  { type: "page", title: "Create Content", href: "/admin/create", icon: IoAddOutline },
  { type: "page", title: "Resource Types", href: "/admin/resource-types", icon: IoLayersOutline },
  { type: "page", title: "Categories", href: "/admin/categories", icon: IoPricetagsOutline },
  { type: "page", title: "Analytics", href: "/admin/analytics", icon: IoAnalyticsOutline },
  { type: "page", title: "Settings", href: "/admin/settings", icon: IoSettingsOutline },
  { type: "action", title: "New Blog Post", href: "/admin/create?type=blogs", icon: IoNewspaperOutline },
  { type: "action", title: "New Article", href: "/admin/create?type=articles", icon: IoDocumentTextOutline },
  { type: "action", title: "New Course", href: "/admin/create?type=courses", icon: IoBookOutline },
  { type: "action", title: "New Video", href: "/admin/create?type=videos", icon: IoPlayCircleOutline },
  { type: "action", title: "New Resource", href: "/admin/create?type=resources", icon: IoLibraryOutline },
  { type: "action", title: "New Experience", href: "/admin/create?type=experiences", icon: IoBriefcaseOutline },
];

// Primary nav items (always visible)
const primaryNavItems = [
  { name: "Content", href: "/admin", icon: IoGridOutline },
  { name: "Create", href: "/admin/create", icon: IoAddOutline },
];

// Secondary nav items (in "More" dropdown)
const secondaryNavItems = [
  { name: "Resource Types", href: "/admin/resource-types", icon: IoLayersOutline },
  { name: "Categories", href: "/admin/categories", icon: IoPricetagsOutline },
  { name: "Analytics", href: "/admin/analytics", icon: IoAnalyticsOutline, badge: "New" },
  { name: "Settings", href: "/admin/settings", icon: IoSettingsOutline },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  
  const { setPendingContent, activeContentType } = useAIContent();

  // Check if we're on the create route
  const isCreateRoute = pathname === "/admin/create" || pathname.startsWith("/admin/create/");

  // Handle applying generated content
  const handleApplyContent = (content: GeneratedContent, selectedFields: string[]) => {
    setPendingContent(content, selectedFields);
    setAiPanelOpen(false);
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearchSelect = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  // Check if current path matches any secondary nav item
  const isSecondaryActive = secondaryNavItems.some((item) => pathname === item.href);

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background flex flex-col">
      {/* Top Admin Bar */}
      <div className="h-12 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 shrink-0">
        <div className="flex items-center justify-between h-full px-3">
          <div className="flex items-center gap-4">
            {/* Logo/Title */}
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <IoGridOutline className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm hidden sm:inline">Admin</span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Primary Nav Items */}
              {primaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors
                      ${isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors
                      ${isSecondaryActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                  >
                    <IoEllipsisHorizontalOutline className="h-4 w-4" />
                    <span>More</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {secondaryNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 ${isActive ? "bg-muted" : ""}`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge variant="outline" className="ml-auto h-5 px-1.5 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            {isCreateRoute ? (
              /* AI Toggle for Create Route */
              <Button
                variant={aiPanelOpen ? "default" : "outline"}
                size="sm"
                className="gap-2 h-8"
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
              >
                <IoSparklesOutline className="h-4 w-4" />
                <span className="text-xs">AI Assistant</span>
                <kbd className="hidden sm:inline-flex pointer-events-none h-4 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground">
                  <span>⌘</span>I
                </kbd>
              </Button>
            ) : (
              /* Standard Navigation for Other Routes */
              <>
            {/* Global Search */}
            <Button
              variant="outline"
              size="sm"
              className="w-48 justify-start text-muted-foreground hidden lg:flex h-8"
              onClick={() => setSearchOpen(true)}
            >
              <IoSearchOutline className="mr-2 h-3.5 w-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground">
                <span>⌘</span>K
              </kbd>
            </Button>

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSearchOpen(true)}
            >
              <IoSearchOutline className="h-4 w-4" />
            </Button>

            {/* View Site */}
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" asChild>
              <Link href="/" target="_blank">
                <IoHomeOutline className="h-4 w-4" />
              </Link>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <IoNotificationsOutline className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <IoPersonCircleOutline className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm">
                  <IoPersonOutline className="mr-2 h-3.5 w-3.5" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <IoSettingsOutline className="mr-2 h-3.5 w-3.5" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm text-destructive">
                  <IoLogOutOutline className="mr-2 h-3.5 w-3.5" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area with Side Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className={`flex-1 overflow-hidden transition-all duration-300 ${isCreateRoute && aiPanelOpen ? "mr-0" : ""}`}>
        {children}
      </main>

        {/* AI Chat Side Panel for Create Route */}
        {isCreateRoute && (
          <AIChatPanel
            open={aiPanelOpen}
            onOpenChange={setAiPanelOpen}
            activeContentType={activeContentType || undefined}
            onApplyContent={handleApplyContent}
          />
        )}
      </div>

      {/* Global Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search pages, actions, content..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Pages">
            {quickNavItems
              .filter((item) => item.type === "page")
              .map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => handleSearchSelect(item.href)}
                  className="flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            {quickNavItems
              .filter((item) => item.type === "action")
              .map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => handleSearchSelect(item.href)}
                  className="flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.title}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Create
                  </Badge>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AIContentProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AIContentProvider>
  );
}
