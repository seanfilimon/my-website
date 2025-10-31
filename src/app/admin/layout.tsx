"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  IoHomeOutline,
  IoLibraryOutline,
  IoFolderOutline,
  IoPlayCircleOutline,
  IoDocumentTextOutline,
  IoNewspaperOutline,
  IoBookOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoChevronForwardOutline,
  IoStatsChartOutline
} from "react-icons/io5";

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: IoHomeOutline },
  { name: "Overview", href: "/admin/overview", icon: IoStatsChartOutline },
  { 
    name: "Content",
    icon: IoLibraryOutline,
    children: [
      { name: "Articles", href: "/admin/articles", icon: IoDocumentTextOutline },
      { name: "Blogs", href: "/admin/blogs", icon: IoNewspaperOutline },
      { name: "Courses", href: "/admin/courses", icon: IoBookOutline },
      { name: "Videos", href: "/admin/videos", icon: IoPlayCircleOutline },
    ]
  },
  { name: "Categories", href: "/admin/categories", icon: IoFolderOutline },
  { name: "Resources", href: "/admin/resources", icon: IoLibraryOutline },
  { name: "Users", href: "/admin/users", icon: IoPersonOutline },
  { name: "Settings", href: "/admin/settings", icon: IoSettingsOutline },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Content']);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      <div className="flex w-full h-full overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-muted/30 border-r flex flex-col transition-transform duration-300 h-full ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Content Management</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-accent rounded-sm"
            >
              <IoCloseOutline className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isExpanded = item.children && expandedItems.includes(item.name);

                return (
                  <li key={item.name}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-sm hover:bg-accent transition-colors text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </div>
                          <IoChevronForwardOutline
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </button>
                        {isExpanded && (
                          <ul className="ml-4 mt-1 space-y-1">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive = pathname === child.href;
                              return (
                                <li key={child.name}>
                                  <Link
                                    href={child.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                                      isChildActive
                                        ? 'bg-accent font-medium'
                                        : 'hover:bg-accent/50'
                                    }`}
                                  >
                                    <ChildIcon className="h-4 w-4" />
                                    <span>{child.name}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                          isActive ? 'bg-accent font-medium' : 'hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t bg-background">
            <Button asChild variant="outline" className="w-full rounded-sm" size="sm">
              <Link href="/">
                Back to Site
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 h-full flex flex-col">
          {/* Mobile Header Bar */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-background">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-accent rounded-sm -ml-2"
            >
              <IoMenuOutline className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">Admin Dashboard</span>
            <Button variant="outline" size="sm" className="rounded-sm">
              <IoPersonOutline className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

