"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/src/components/navigation/footer";
import { NewsletterSection } from "@/src/components/pages/landing/newsletter-section";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer/newsletter on resources or github pages
  if (pathname?.startsWith("/resources") || pathname?.startsWith("/github")) {
    return null;
  }
  
  return (
    <>
      <NewsletterSection />
      <Footer />
    </>
  );
}

