"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Basic Scroll Trigger Animation
 */
export const scrollTriggerAnimation = (
  element: gsap.DOMTarget,
  animation: gsap.TweenVars,
  options?: {
    trigger?: gsap.DOMTarget;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    toggleActions?: string;
  }
) => {
  const {
    trigger,
    start = "top 80%",
    end = "bottom 20%",
    scrub = false,
    markers = false,
    toggleActions = "play none none none",
  } = options || {};

  return gsap.to(element, {
    ...animation,
    scrollTrigger: {
      trigger: trigger || element,
      start,
      end,
      scrub,
      markers,
      toggleActions,
    },
  });
};

/**
 * Scroll Trigger with Timeline
 */
export const scrollTriggerTimeline = (
  trigger: gsap.DOMTarget,
  options?: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    pin?: boolean;
    toggleActions?: string;
  }
) => {
  const {
    start = "top top",
    end = "bottom bottom",
    scrub = false,
    markers = false,
    pin = false,
    toggleActions = "play none none none",
  } = options || {};

  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub,
      markers,
      pin,
      toggleActions,
    },
  });
};

/**
 * Pin Element on Scroll
 */
export const pinElement = (
  element: gsap.DOMTarget,
  options?: {
    start?: string;
    end?: string;
    pinSpacing?: boolean;
    markers?: boolean;
  }
) => {
  const { start = "top top", end = "+=100%", pinSpacing = true, markers = false } = options || {};

  return ScrollTrigger.create({
    trigger: element,
    start,
    end,
    pin: true,
    pinSpacing,
    markers,
  });
};

/**
 * Scrub Animation on Scroll
 */
export const scrubAnimation = (
  element: gsap.DOMTarget,
  animation: gsap.TweenVars,
  options?: {
    trigger?: gsap.DOMTarget;
    start?: string;
    end?: string;
    scrub?: number;
    markers?: boolean;
  }
) => {
  const { trigger, start = "top center", end = "bottom center", scrub = 1, markers = false } = options || {};

  return gsap.to(element, {
    ...animation,
    ease: "none",
    scrollTrigger: {
      trigger: trigger || element,
      start,
      end,
      scrub,
      markers,
    },
  });
};

/**
 * Batch Scroll Trigger
 */
export const batchScrollTrigger = (
  elements: string | Element[],
  animation: gsap.TweenVars,
  options?: {
    start?: string;
    end?: string;
    interval?: number;
    batchMax?: number;
  }
) => {
  const { start = "top 80%", interval = 0.1, batchMax = 3 } = options || {};

  return ScrollTrigger.batch(elements, {
    onEnter: (batch) =>
      gsap.to(batch, {
        ...animation,
        stagger: { each: interval, grid: "auto" },
        overwrite: true,
      }),
    start,
    interval,
    batchMax,
  });
};

