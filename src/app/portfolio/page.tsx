import type { Metadata } from "next";
import { PortfolioContent } from "./portfolio-content";

export const metadata: Metadata = {
  title: "Portfolio | Sean Filimon",
  description:
    "A showcase of companies, products, and projects built by Sean Filimon - from startups to open source.",
  openGraph: {
    title: "Portfolio | Sean Filimon",
    description:
      "A showcase of companies, products, and projects built by Sean Filimon - from startups to open source.",
  },
};

export default function PortfolioPage() {
  return <PortfolioContent />;
}
