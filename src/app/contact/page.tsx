import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Sean Filimon for project collaborations, speaking opportunities, or technical consulting.",
  openGraph: {
    title: "Contact Sean Filimon",
    description:
      "Get in touch with Sean Filimon for project collaborations, speaking opportunities, or technical consulting.",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
