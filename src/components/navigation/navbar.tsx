"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoPersonOutline,
  IoLibraryOutline,
  IoBriefcaseOutline
} from "react-icons/io5";
import { ThemeToggle } from "./theme-toggle";
import { AnimatedTitle } from "./animated-title";
import { GitHubDropdown } from "./github-dropdown";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 border-l border-r">
        <div className="flex h-16 items-center justify-between">
          {/* Left Side - Logo */}
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
              <AnimatedTitle />
            </div>
          </Link>

          {/* Center - Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            {/* Portfolio */}
            <Button variant="ghost" asChild className="rounded-sm gap-1.5">
              <Link href="/portfolio" className="flex items-center">
                <IoBriefcaseOutline className="h-4 w-4" />
                <span>Portfolio</span>
              </Link>
            </Button>

            {/* Github Dropdown */}
            <GitHubDropdown />

            {/* Resources */}
            <Button variant="ghost" asChild className="rounded-sm gap-1.5">
              <Link href="/resources" className="flex items-center">
                  <IoLibraryOutline className="h-4 w-4" />
                <span>Resources</span>
              </Link>
                </Button>

            {/* About Me */}
            <Button variant="ghost" asChild className="rounded-sm gap-1.5">
              <Link href="/about" className="flex items-center">
                <IoPersonOutline className="h-4 w-4" />
                <span>About</span>
              </Link>
            </Button>
          </div>

          {/* Right Side - Theme Toggle & Get Started Button */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="rounded-sm font-bold uppercase tracking-tight">
              <Link href="/get-started">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

