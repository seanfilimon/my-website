"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother);
}

/**
 * Initialize Smooth Scroll with GSAP ScrollSmoother
 * Note: ScrollSmoother requires a GSAP membership/license
 * For free alternative, use Lenis or custom implementation
 */
export const initSmoothScroll = (options?: {
  smooth?: number;
  effects?: boolean;
  smoothTouch?: boolean;
}) => {
  if (typeof window === "undefined") return null;

  const {
    smooth = 1.5,
    effects = true,
    smoothTouch = false,
  } = options || {};

  try {
    // ScrollSmoother requires wrapper structure:
    // <div id="smooth-wrapper">
    //   <div id="smooth-content">
    //     ... your content ...
    //   </div>
    // </div>
    
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth,
      effects,
      smoothTouch,
      normalizeScroll: true,
    });

    return smoother;
  } catch (error) {
    console.warn("ScrollSmoother requires GSAP membership. Using fallback.");
    return null;
  }
};

/**
 * Alternative smooth scroll using GSAP ScrollTrigger (Free)
 * This is a lighter implementation that works without ScrollSmoother
 */
export const initBasicSmoothScroll = () => {
  if (typeof window === "undefined") return;

  // Normalize scroll behavior
  ScrollTrigger.normalizeScroll(true);

  // Configure defaults
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
  });

  return ScrollTrigger;
};

/**
 * Initialize GSAP with optimized settings
 */
export const initGSAP = () => {
  if (typeof window === "undefined") return;

  // Set GSAP defaults for smoother animations
  gsap.defaults({
    ease: "power3.out",
    duration: 1.2,
  });

  // Configure ScrollTrigger for smoother scroll
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
    limitCallbacks: true,
  });

  // Add smooth scroll behavior
  gsap.to(window, {
    scrollTo: { autoKill: true },
    ease: "power3.out",
  });

  // Initialize basic smooth scroll
  initBasicSmoothScroll();
};

/**
 * Cleanup function for ScrollTrigger instances
 */
export const cleanupScrollTrigger = () => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

/**
 * Refresh all ScrollTrigger instances
 */
export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};

/**
 * Scroll to a specific element or position
 */
export const scrollTo = (target: string | number, options?: gsap.TweenVars) => {
  gsap.to(window, {
    scrollTo: target,
    duration: 1,
    ease: "power3.inOut",
    ...options,
  });
};

export { gsap, ScrollTrigger };

