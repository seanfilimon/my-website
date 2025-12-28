"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    // Skip transition for resources, github, and admin pages
    const skipTransition = pathname?.startsWith("/resources") || 
                          pathname?.startsWith("/github") ||
                          pathname?.startsWith("/admin");

    if (skipTransition || !contentRef.current) {
      return;
    }

    // Only animate if we're coming from a different page (not initial load)
    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      // Animate page transition: blur fade in
      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power2.out",
        }
      );
    }

    previousPathname.current = pathname;
  }, [pathname]);

  return (
    <div ref={contentRef}>
      {children}
    </div>
  );
}
