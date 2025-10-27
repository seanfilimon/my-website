"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "@/src/lib/gsap/plugins";
import { shouldDisableAnimations } from "@/src/lib/utils/device-detection";

export function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
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

    // Normalize scroll behavior
    ScrollTrigger.normalizeScroll(true);

    // Refresh ScrollTrigger after initialization
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Kill all ScrollTrigger instances on unmount
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}

