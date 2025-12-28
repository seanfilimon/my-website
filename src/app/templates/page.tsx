import { Metadata } from "next";
import { TemplatesContent } from "./templates-content";

export const metadata: Metadata = {
  title: "Templates | Sean Filimon",
  description:
    "Production-ready starter templates and boilerplates for Next.js, React, and modern web development.",
  openGraph: {
    title: "Templates | Sean Filimon",
    description:
      "Production-ready starter templates and boilerplates for Next.js, React, and modern web development.",
  },
};

export default function TemplatesPage() {
  return <TemplatesContent />;
}
