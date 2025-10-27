/**
 * GitHub API utilities for fetching real user and repository data
 */

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  topics: string[];
}

/**
 * Fetch GitHub user data
 */
export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'seanfilimon-portfolio'
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub user data');
  }

  return response.json();
}

/**
 * Fetch GitHub repositories for a user
 */
export async function fetchGitHubRepos(
  username: string,
  options?: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }
): Promise<GitHubRepo[]> {
  const { sort = 'updated', direction = 'desc', per_page = 100, page = 1 } = options || {};
  
  const params = new URLSearchParams({
    sort,
    direction,
    per_page: per_page.toString(),
    page: page.toString(),
  });

  const response = await fetch(
    `https://api.github.com/users/${username}/repos?${params}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'seanfilimon-portfolio'
      },
      next: { revalidate: 1800 } // Cache for 30 minutes
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub repositories');
  }

  return response.json();
}

/**
 * Get popular repositories (sorted by stars)
 */
export async function getPopularRepos(username: string, limit: number = 4): Promise<GitHubRepo[]> {
  const repos = await fetchGitHubRepos(username, { per_page: 100 });
  return repos
    .filter(repo => !repo.name.startsWith('.') && repo.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit);
}

/**
 * Get recent repositories (sorted by last update)
 */
export async function getRecentRepos(username: string, limit: number = 4): Promise<GitHubRepo[]> {
  const repos = await fetchGitHubRepos(username, { sort: 'updated', per_page: limit });
  return repos.filter(repo => !repo.name.startsWith('.'));
}

/**
 * Calculate total stars across all repositories
 */
export async function getTotalStars(username: string): Promise<number> {
  const repos = await fetchGitHubRepos(username, { per_page: 100 });
  return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
}

/**
 * Format number for display (e.g., 1200 -> "1.2K")
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
