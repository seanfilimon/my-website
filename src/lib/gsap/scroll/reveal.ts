"use client";

import { gsap } from "gsap";

/**
 * Scroll Fade In
 */
export const scrollFadeIn = (
  element: gsap.DOMTarget,
  options?: {
    start?: string;
    end?: string;
    y?: number;
    stagger?: number;
    markers?: boolean;
  }
) => {
  const { start = "top 80%", end = "top 50%", y = 60, stagger = 0, markers = false } = options || {};

  return gsap.from(element, {
    opacity: 0,
    y,
    duration: 1,
    stagger,
    scrollTrigger: {
      trigger: element,
      start,
      end,
      markers,
    },
  });
};

/**
 * Scroll Stagger Reveal
 */
export const scrollStaggerReveal = (
  elements: gsap.DOMTarget,
  options?: {
    start?: string;
    stagger?: number;
    y?: number;
    markers?: boolean;
  }
) => {
  const { start = "top 80%", stagger = 0.1, y = 60, markers = false } = options || {};

  return gsap.from(elements, {
    opacity: 0,
    y,
    duration: 0.8,
    stagger,
    scrollTrigger: {
      trigger: elements,
      start,
      markers,
    },
  });
};

/**
 * Scroll Progress Bar
 */
export const scrollProgressBar = (
  progressBar: gsap.DOMTarget,
  options?: {
    start?: string;
    end?: string;
    scrub?: number;
  }
) => {
  const { start = "top top", end = "bottom bottom", scrub = 0.3 } = options || {};

  return gsap.to(progressBar, {
    scaleX: 1,
    transformOrigin: "left center",
    ease: "none",
    scrollTrigger: {
      start,
      end,
      scrub,
    },
  });
};

/**
 * Scroll Counter
 */
export const scrollCounter = (
  element: gsap.DOMTarget,
  options?: {
    start?: number;
    end: number;
    duration?: number;
    scrollStart?: string;
    ease?: string;
  }
) => {
  const { start = 0, end, duration = 2, scrollStart = "top 70%", ease = "power2.out" } = options || {};

  const el = gsap.utils.toArray(element)[0] as HTMLElement;

  const counter = { value: start };

  return gsap.to(counter, {
    value: end,
    duration,
    ease,
    onUpdate: () => {
      el.textContent = Math.floor(counter.value).toString();
    },
    scrollTrigger: {
      trigger: element,
      start: scrollStart,
    },
  });
};

