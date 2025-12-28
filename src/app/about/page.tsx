import type { Metadata } from "next";
import { AboutContent } from "@/components/pages/about/about-content";

export const metadata: Metadata = {
  title: "About Me | Sean Filimon",
  description:
    "Full-stack developer, founder, and content creator helping build the future of software engineers.",
  openGraph: {
    title: "About Me | Sean Filimon",
    description:
      "Full-stack developer, founder, and content creator helping build the future of software engineers.",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
