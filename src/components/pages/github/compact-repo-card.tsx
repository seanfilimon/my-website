import Link from "next/link";
import {
  IoStarOutline,
  IoGitBranchOutline,
  IoCalendarOutline
} from "react-icons/io5";

export interface CompactRepository {
  id: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  updatedAt: string;
  url: string;
  category: string;
}

interface CompactRepoCardProps {
  repo: CompactRepository;
}

export function CompactRepoCard({ repo }: CompactRepoCardProps) {
  return (
    <Link
      id={repo.name}
      href={repo.url}
      target="_blank"
      className="group border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all bg-card select-none"
    >
      {/* Repo Name */}
      <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors truncate">
        {repo.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {repo.description || "No description available"}
      </p>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <div 
              className="h-2.5 w-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: repo.languageColor }}
            />
            <span>{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <IoStarOutline className="h-3 w-3" />
          <span>{repo.stars}</span>
        </div>
        <div className="flex items-center gap-1">
          <IoGitBranchOutline className="h-3 w-3" />
          <span>{repo.forks}</span>
        </div>
      </div>
    </Link>
  );
}

