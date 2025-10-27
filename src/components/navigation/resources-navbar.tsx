"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoNewspaperOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoListOutline,
  IoDocumentTextOutline
} from "react-icons/io5";
import { ThemeToggle } from "./theme-toggle";

const topicTabs = [
  { id: "all", name: "All Resources", icon: IoBookOutline, href: "/resources" },
  { id: "articles", name: "Articles", icon: IoDocumentTextOutline, href: "/resources/articles" },
  { id: "blogs", name: "Blogs", icon: IoNewspaperOutline, href: "/resources/blogs" },
  { id: "tutorials", name: "Tutorials", icon: IoPlayCircleOutline, href: "/resources/tutorials" },
  { id: "series", name: "Series", icon: IoListOutline, href: "/resources/series" },
];

interface ResourcesNavbarProps {
  activeTab?: string;
}

export function ResourcesNavbar({ activeTab = "all" }: ResourcesNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto">
        <div className="flex h-16 items-center">
          {/* Left Side - Profile (width matches sidebar) */}
          <div className="w-72 border-r px-4 h-full flex items-center shrink-0">
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
                <span className="text-xs text-muted-foreground leading-tight">
                  Founder & CEO
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side - Topic Tabs & Actions */}
          <div className="flex-1 flex items-center justify-between px-4">
            {/* Center - Topic Navigation */}
            <div className="flex items-center gap-1">
              {topicTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
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

            {/* Right - Theme Toggle */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


