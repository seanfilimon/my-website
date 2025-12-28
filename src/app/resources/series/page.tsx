import { Metadata } from "next";
import { SeriesContent } from "./series-content";

export const metadata: Metadata = {
  title: "Series | Resources | Sean Filimon",
  description:
    "Curated multi-part series diving deep into complex web development topics and technologies.",
  openGraph: {
    title: "Series | Resources | Sean Filimon",
    description:
      "Curated multi-part series diving deep into complex web development topics and technologies.",
  },
};

export default function SeriesPage() {
  return <SeriesContent />;
}
