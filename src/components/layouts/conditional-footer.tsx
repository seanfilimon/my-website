"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/src/components/navigation/footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on resources, github, or admin pages
  if (pathname && (pathname.startsWith("/resources") || pathname.startsWith("/github") || pathname.startsWith("/admin"))) {
    return null;
  }
  
  return <Footer />;
}

