"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "@/src/lib/gsap/plugins";
import { shouldDisableAnimations } from "@/src/lib/utils/device-detection";

export function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip smooth scrolling on mobile or if animations are disabled
    if (shouldDisableAnimations()) {
      console.log("Smooth scrolling disabled for mobile/reduced motion");
      return;
    }

    // Register GSAP plugins globally once
    gsap.registerPlugin(ScrollTrigger);

    // Set default GSAP settings
    gsap.defaults({
      duration: 0.8,
      ease: "power3.out",
    });

    // Configure ScrollTrigger defaults
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      limitCallbacks: true,
    });

    // Only normalize scroll for pages that use document-level scrolling
    // Pages like /resources and /github have their own internal scrolling
    const shouldNormalizeScroll = !pathname?.startsWith("/resources") && !pathname?.startsWith("/github");
    
    if (shouldNormalizeScroll) {
      ScrollTrigger.normalizeScroll(true);
    }

    // Refresh ScrollTrigger after initialization
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Kill all ScrollTrigger instances on unmount
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      // Disable normalize scroll if it was enabled
      if (shouldNormalizeScroll) {
        ScrollTrigger.normalizeScroll(false);
      }
    };
  }, [pathname]);

  return <>{children}</>;
}

