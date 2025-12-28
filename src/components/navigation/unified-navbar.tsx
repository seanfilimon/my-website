"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  IoLogoDiscord,
  IoLogInOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoShieldOutline,
} from "react-icons/io5";
import { AnimatedTitle } from "./animated-title";

const resourceTopicTabs = [
  { id: "all", name: "All Resources", icon: IoBookOutline, href: "/resources" },
  { id: "articles", name: "Articles", icon: IoDocumentTextOutline, href: "/resources/articles" },
  { id: "blogs", name: "Blogs", icon: IoNewspaperOutline, href: "/resources/blogs" },
  { id: "tutorials", name: "Tutorials", icon: IoPlayCircleOutline, href: "/resources/tutorials" },
  { id: "series", name: "Series", icon: IoListOutline, href: "/resources/series" },
];

// Admin emails that have access to the admin panel
const ADMIN_EMAILS = [
  "s.filimon@legionedge.ai",
  "seanfilimon@icloud.com",
];

function UserDropdown() {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
  
  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-sm gap-2 p-1 pr-3">
          <Avatar className="h-6 w-6 rounded-sm">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} className="rounded-sm" />
            <AvatarFallback className="rounded-sm text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">{user?.firstName || "Account"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" alignOffset={-4}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/resources" className="cursor-pointer">
            <IoLibraryOutline className="mr-2 h-4 w-4" />
            Resources
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openUserProfile()} className="cursor-pointer">
          <IoSettingsOutline className="mr-2 h-4 w-4" />
          Account Settings
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <IoShieldOutline className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut({ redirectUrl: "/" })}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <IoLogOutOutline className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileUserMenu({ onClose }: { onClose: () => void }) {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
  
  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName?.[0]?.toUpperCase() || "U";

  return (
    <div className="space-y-3">
      {/* User Info */}
      <div className="flex items-center gap-3 p-4 rounded-lg border">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.fullName || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="space-y-2">
        <Link
          href="/resources"
          onClick={onClose}
          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
        >
          <IoLibraryOutline className="h-5 w-5" />
          <span>Resources</span>
        </Link>
        <button
          onClick={() => { openUserProfile(); onClose(); }}
          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors w-full text-left"
        >
          <IoSettingsOutline className="h-5 w-5" />
          <span>Account Settings</span>
        </button>
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <IoShieldOutline className="h-5 w-5" />
            <span>Admin Panel</span>
          </Link>
        )}
      </div>
      
      {/* Sign Out */}
      <Button 
        variant="outline" 
        className="w-full rounded-sm gap-2 h-12 text-destructive hover:text-destructive"
        onClick={() => { signOut({ redirectUrl: "/" }); onClose(); }}
      >
        <IoLogOutOutline className="h-5 w-5" />
        Sign Out
      </Button>
    </div>
  );
}

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
                  src="/me.jpg"
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
          <div className={`flex-1 flex items-center min-w-0 px-2 ${(isResourcesPage || isGitHubPage || isAdminPage) ? 'justify-start' : 'justify-center'}`}>
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
                <Link href="/articles" className="flex items-center">
                  <IoDocumentTextOutline className="h-4 w-4" />
                  <span>Articles</span>
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
            {/* Auth Buttons */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm" className="hidden md:flex rounded-sm font-bold gap-2">
                  <IoLogInOutline className="h-4 w-4" />
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserDropdown />
            </SignedIn>
              
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
                    href="/articles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <IoDocumentTextOutline className="h-6 w-6" />
                    <div>
                      <div className="font-semibold text-lg">Articles</div>
                      <div className="text-sm text-muted-foreground">Technical articles</div>
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
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="w-full rounded-sm font-bold h-12 gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <IoLogInOutline className="h-5 w-5" />
                        Sign In
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <MobileUserMenu onClose={() => setMobileMenuOpen(false)} />
                  </SignedIn>
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

