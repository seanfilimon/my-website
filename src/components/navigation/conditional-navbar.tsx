"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar on resources page (it has its own)
  if (pathname?.startsWith("/resources")) {
    return null;
  }
  
  return <Navbar />;
}

