"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  IoChevronDown, 
  IoLogoGithub, 
  IoPeopleOutline, 
  IoStarOutline 
} from "react-icons/io5";
import type { GitHubUser, GitHubRepo } from "@/src/lib/github/api";
import { formatNumber } from "@/src/lib/github/api";

interface GitHubData {
  user: GitHubUser | null;
  popularRepos: GitHubRepo[];
  recentRepos: GitHubRepo[];
  totalStars: number;
  loading: boolean;
  error: string | null;
}

export function GitHubDropdown() {
  const [data, setData] = useState<GitHubData>({
    user: null,
    popularRepos: [],
    recentRepos: [],
    totalStars: 0,
    loading: false,
    error: null
  });

  useEffect(() => {
    // Only fetch when dropdown is likely to be opened (on mount)
    const fetchGitHubData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch('/api/github/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub data');
        }
        
        const githubData = await response.json();
        setData(prev => ({ ...prev, ...githubData, loading: false }));
      } catch (error) {
        console.error('GitHub API Error:', error);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load GitHub data'
        }));
      }
    };

    fetchGitHubData();
  }, []);

  const { user, popularRepos, recentRepos, totalStars, loading, error } = data;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-1 rounded-sm data-[state=open]:bg-accent"
        >
          <IoLogoGithub className="h-4 w-4" />
          Github
          <IoChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[520px] border-l border-r p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading GitHub data...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Failed to load GitHub data</div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="px-1 py-1.5">
              <Link
                href="https://github.com/seanfilimon"
                target="_blank"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-full shrink-0">
                  <Image
                    src="/face_grayscale_nobg.png"
                    alt="Sean Filimon"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">{user?.name || "Sean Filimon"}</div>
                  <div className="text-xs text-muted-foreground">@{user?.login || "seanfilimon"}</div>
                </div>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex gap-5 px-2 py-2">
              <Link
                href="https://github.com/seanfilimon?tab=repositories"
                target="_blank"
                className="flex items-baseline gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-base">{user?.public_repos || "45"}</span>
                <span className="text-xs text-muted-foreground">repos</span>
              </Link>
              <Link
                href="https://github.com/seanfilimon?tab=followers"
                target="_blank"
                className="flex items-baseline gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-base">{formatNumber(user?.followers || 1200)}</span>
                <span className="text-xs text-muted-foreground">followers</span>
              </Link>
              <Link
                href="https://github.com/seanfilimon?tab=following"
                target="_blank"
                className="flex items-baseline gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-base">{user?.following || "328"}</span>
                <span className="text-xs text-muted-foreground">following</span>
              </Link>
            </div>

            <DropdownMenuSeparator />

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left Column - Popular Repositories */}
              <div>
                <DropdownMenuLabel className="text-xs font-semibold px-1 py-1.5">
                  Popular Repositories
                </DropdownMenuLabel>
                <div className="space-y-0.5">
                  {popularRepos.length > 0 ? (
                    popularRepos.map((repo) => (
                      <Link
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        className="flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-accent transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IoLogoGithub className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm truncate">{repo.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                          <IoStarOutline className="h-3 w-3" />
                          <span>{formatNumber(repo.stargazers_count)}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                      Loading repositories...
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Recent Repositories */}
              <div>
                <DropdownMenuLabel className="text-xs font-semibold px-1 py-1.5">
                  Recent Repositories
                </DropdownMenuLabel>
                <div className="space-y-0.5">
                  {recentRepos.length > 0 ? (
                    recentRepos.map((repo) => (
                      <Link
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        className="flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-accent transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IoLogoGithub className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm truncate">{repo.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                          <IoStarOutline className="h-3 w-3" />
                          <span>{formatNumber(repo.stargazers_count)}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                      Loading repositories...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Footer with additional stats */}
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <IoStarOutline className="h-3 w-3" />
                  <span>{formatNumber(totalStars)} stars earned</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span>Active today</span>
                </div>
              </div>
              <Link
                href="https://github.com/seanfilimon"
                target="_blank"
                className="text-xs font-medium hover:underline"
              >
                View Profile →
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
