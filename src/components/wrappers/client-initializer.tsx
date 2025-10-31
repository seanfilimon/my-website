"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "@/src/lib/gsap/plugins";
import { shouldDisableAnimations } from "@/src/lib/utils/device-detection";

/**
 * Client-side initializer for GSAP and global client-only setup
 * This component renders nothing but initializes client-side features
 */
export function ClientInitializer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip animations on mobile or if user prefers reduced motion
    if (shouldDisableAnimations()) {
      console.log("Animations disabled for mobile/reduced motion");
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

    // Refresh ScrollTrigger after initialization
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // This component renders nothing
  return null;
}

