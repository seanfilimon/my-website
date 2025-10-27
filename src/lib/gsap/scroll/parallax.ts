"use client";

import { gsap } from "gsap";

/**
 * Basic Parallax Effect
 */
export const parallax = (
  element: gsap.DOMTarget,
  options?: {
    speed?: number;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  }
) => {
  const { speed = 0.5, start = "top bottom", end = "bottom top", scrub = true } = options || {};

  return gsap.to(element, {
    y: () => -window.innerHeight * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start,
      end,
      scrub,
    },
  });
};

/**
 * Horizontal Parallax Effect
 */
export const parallaxHorizontal = (
  element: gsap.DOMTarget,
  options?: {
    speed?: number;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  }
) => {
  const { speed = 0.5, start = "top bottom", end = "bottom top", scrub = true } = options || {};

  return gsap.to(element, {
    x: () => -window.innerWidth * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start,
      end,
      scrub,
    },
  });
};

/**
 * Multi-layer Parallax Effect
 */
export const parallaxLayers = (
  layers: { element: gsap.DOMTarget; speed: number }[],
  options?: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
  }
) => {
  const { start = "top bottom", end = "bottom top", scrub = true } = options || {};

  return layers.map(({ element, speed }) =>
    gsap.to(element, {
      y: () => -window.innerHeight * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub,
      },
    })
  );
};

/**
 * Scale Parallax Effect
 */
export const parallaxScale = (
  element: gsap.DOMTarget,
  options?: {
    scale?: number;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  }
) => {
  const { scale = 1.2, start = "top bottom", end = "bottom top", scrub = true } = options || {};

  return gsap.fromTo(
    element,
    { scale: 1 },
    {
      scale,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub,
      },
    }
  );
};

