"use client";

import { gsap } from "gsap";

/**
 * Fade In Animation with Blur
 */
export const fadeIn = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", blur = 10, stagger = 0 } = options || {};

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
 * Fade Out Animation with Blur
 */
export const fadeOut = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", blur = 10, stagger = 0 } = options || {};

  return gsap.to(element, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Fade In with Blur Animation (replaces fadeInUp)
 */
export const fadeInUp = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", blur = 10, stagger = 0 } = options || {};

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
 * Fade In with Blur Animation (replaces fadeInDown)
 */
export const fadeInDown = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", blur = 10, stagger = 0 } = options || {};

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
 * Fade In with Blur Animation (replaces fadeInLeft)
 */
export const fadeInLeft = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", blur = 10, stagger = 0 } = options || {};

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
 * Fade In with Blur Animation (replaces fadeInRight)
 */
export const fadeInRight = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", blur = 10, stagger = 0 } = options || {};

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
 * Fade In with Blur Animation (replaces fadeInScale)
 */
export const fadeInScale = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    blur?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power2.out", blur = 10, stagger = 0 } = options || {};

  return gsap.from(element, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration,
    delay,
    ease,
    stagger,
  });
};
