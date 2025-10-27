import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoStarOutline,
  IoGitBranchOutline,
  IoCodeSlashOutline,
  IoCalendarOutline
} from "react-icons/io5";

export interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  updatedAt: string;
  topics: string[];
  url: string;
}

interface RepoCardProps {
  repo: Repository;
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <div className="group border rounded-lg overflow-hidden hover:border-primary hover:shadow-lg transition-all bg-card p-6">
      {/* Repo Header */}
      <div className="flex items-start justify-between mb-3">
        <Link 
          href={repo.url} 
          target="_blank"
          className="flex items-center gap-2 group-hover:text-primary transition-colors"
        >
          <IoCodeSlashOutline className="h-5 w-5 shrink-0" />
          <h3 className="text-lg font-bold truncate">{repo.name}</h3>
        </Link>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {repo.description || "No description available"}
      </p>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="inline-flex px-2 py-0.5 text-xs border rounded"
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 3 && (
            <span className="inline-flex px-2 py-0.5 text-xs text-muted-foreground">
              +{repo.topics.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats and Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: repo.languageColor }}
            />
            <span>{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <IoStarOutline className="h-3.5 w-3.5" />
          <span>{repo.stars}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <IoGitBranchOutline className="h-3.5 w-3.5" />
          <span>{repo.forks}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <IoCalendarOutline className="h-3.5 w-3.5" />
          <span>{repo.updatedAt}</span>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        asChild
        variant="outline" 
        size="sm" 
        className="w-full rounded-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
      >
        <Link href={repo.url} target="_blank">
          View on GitHub
        </Link>
      </Button>
    </div>
  );
}

