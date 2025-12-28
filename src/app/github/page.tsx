import { Metadata } from "next";
import { GitHubContent } from "./github-content";

export const metadata: Metadata = {
  title: "GitHub Activity | Sean Filimon",
  description:
    "Explore my open source contributions, repositories, and coding activity on GitHub.",
  openGraph: {
    title: "GitHub Activity | Sean Filimon",
    description:
      "Explore my open source contributions, repositories, and coding activity on GitHub.",
  },
};

export default function GitHubPage() {
  return <GitHubContent />;
}
