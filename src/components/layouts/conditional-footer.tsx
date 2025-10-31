"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/src/components/navigation/footer";
import { NewsletterSection } from "@/src/components/pages/landing/newsletter-section";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer/newsletter on resources, github, or admin pages
  if (pathname && (pathname.startsWith("/resources") || pathname.startsWith("/github") || pathname.startsWith("/admin"))) {
    return null;
  }
  
  return (
    <>
      <NewsletterSection />
      <Footer />
    </>
  );
}

