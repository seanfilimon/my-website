"use client";

import { gsap } from "gsap";

/**
 * Fade In Animation
 */
export const fadeIn = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    y?: number;
    x?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", y = 0, x = 0, stagger = 0 } = options || {};

  return gsap.from(element, {
    opacity: 0,
    y,
    x,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Fade Out Animation
 */
export const fadeOut = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    y?: number;
    x?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", y = 0, x = 0, stagger = 0 } = options || {};

  return gsap.to(element, {
    opacity: 0,
    y,
    x,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Fade In Up Animation
 */
export const fadeInUp = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    distance?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power3.out", distance = 60, stagger = 0 } = options || {};

  return gsap.from(element, {
    opacity: 0,
    y: distance,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Fade In Down Animation
 */
export const fadeInDown = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    distance?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power3.out", distance = 60, stagger = 0 } = options || {};

  return gsap.from(element, {
    opacity: 0,
    y: -distance,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Fade In Left Animation
 */
export const fadeInLeft = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    distance?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power3.out", distance = 60, stagger = 0 } = options || {};

  return gsap.from(element, {
    opacity: 0,
    x: -distance,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Fade In Right Animation
 */
export const fadeInRight = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    distance?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power3.out", distance = 60, stagger = 0 } = options || {};

  return gsap.from(element, {
    opacity: 0,
    x: distance,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Fade In Scale Animation
 */
export const fadeInScale = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    scale?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "back.out(1.7)", scale = 0.8, stagger = 0 } = options || {};

  return gsap.from(element, {
    opacity: 0,
    scale,
    duration,
    delay,
    ease,
    stagger,
  });
};

