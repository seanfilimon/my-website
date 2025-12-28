"use client";

import { gsap } from "gsap";

/**
 * Blur Reveal Animation
 * Creates a reveal effect with blur transition
 */
export const slideReveal = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    blur?: number;
    ease?: string;
    stagger?: number;
  }
) => {
  const {
    duration = 1.2,
    delay = 0,
    blur = 15,
    ease = "power2.out",
    stagger = 0,
  } = options || {};

  const tl = gsap.timeline({ delay });

  tl.from(element, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration,
    ease,
    stagger,
  });

  return tl;
};

/**
 * Text Reveal Animation with Blur
 * Reveals text with a blur fade effect
 */
export const textReveal = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
    stagger?: number;
  }
) => {
  const {
    duration = 0.8,
    delay = 0,
    ease = "power2.out",
    blur = 8,
    stagger = 0.03,
  } = options || {};

  return gsap.from(element, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Clip Path Reveal Animation
 */
export const clipReveal = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    direction?: "horizontal" | "vertical" | "center";
  }
) => {
  const { duration = 1.5, delay = 0, ease = "power4.inOut", direction = "horizontal" } = options || {};

  const clipPaths = {
    horizontal: {
      from: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    },
    vertical: {
      from: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    },
    center: {
      from: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
      to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    },
  };

  return gsap.fromTo(
    element,
    {
      clipPath: clipPaths[direction].from,
    },
    {
      clipPath: clipPaths[direction].to,
      duration,
      delay,
      ease,
    }
  );
};

/**
 * Stagger Reveal Animation with Blur
 * Reveals multiple elements with a stagger blur effect
 */
export const staggerReveal = (
  elements: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    stagger?: number;
    from?: "start" | "center" | "end" | "edges";
    blur?: number;
  }
) => {
  const {
    duration = 0.8,
    delay = 0,
    ease = "power2.out",
    stagger = 0.1,
    from = "start",
    blur = 10,
  } = options || {};

  return gsap.from(elements, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration,
    delay,
    ease,
    stagger: {
      amount: stagger,
      from,
    },
  });
};

/**
 * Masking Reveal Animation with Blur
 * Creates a blur fade effect to reveal content
 */
export const maskReveal = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 1.5, delay = 0, ease = "power2.out", blur = 15 } = options || {};

  const tl = gsap.timeline({ delay });

  tl.from(element, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration,
    ease,
  });

  return tl;
};
