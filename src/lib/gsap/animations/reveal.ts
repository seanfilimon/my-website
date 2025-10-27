"use client";

import { gsap } from "gsap";

/**
 * Slide In Reveal Animation
 * Creates a reveal effect with a sliding overlay
 */
export const slideReveal = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    direction?: "left" | "right" | "top" | "bottom";
    ease?: string;
    stagger?: number;
  }
) => {
  const {
    duration = 1.2,
    delay = 0,
    direction = "left",
    ease = "power4.inOut",
    stagger = 0,
  } = options || {};

  const directionMap = {
    left: { x: "-100%" },
    right: { x: "100%" },
    top: { y: "-100%" },
    bottom: { y: "100%" },
  };

  const tl = gsap.timeline({ delay });

  tl.set(element, { overflow: "hidden" });
  tl.from(element, {
    ...directionMap[direction],
    duration,
    ease,
    stagger,
  });

  return tl;
};

/**
 * Text Reveal Animation
 * Reveals text character by character or word by word
 */
export const textReveal = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    splitBy?: "chars" | "words" | "lines";
    stagger?: number;
  }
) => {
  const {
    duration = 0.8,
    delay = 0,
    ease = "power3.out",
    stagger = 0.03,
  } = options || {};

  return gsap.from(element, {
    opacity: 0,
    y: 20,
    rotationX: -90,
    transformOrigin: "0% 50% -50",
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
 * Stagger Reveal Animation
 * Reveals multiple elements with a stagger effect
 */
export const staggerReveal = (
  elements: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    stagger?: number;
    from?: "start" | "center" | "end" | "edges";
    y?: number;
    x?: number;
  }
) => {
  const {
    duration = 0.8,
    delay = 0,
    ease = "power3.out",
    stagger = 0.1,
    from = "start",
    y = 60,
    x = 0,
  } = options || {};

  return gsap.from(elements, {
    opacity: 0,
    y,
    x,
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
 * Masking Reveal Animation
 * Creates a masking effect to reveal content
 */
export const maskReveal = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
  }
) => {
  const { duration = 1.5, delay = 0, ease = "power4.inOut" } = options || {};

  const tl = gsap.timeline({ delay });

  tl.set(element, { position: "relative", overflow: "hidden" });
  tl.from(element, {
    y: "100%",
    duration,
    ease,
  });

  return tl;
};

