"use client";

import { gsap } from "gsap";

/**
 * Rotate In Animation
 */
export const rotateIn = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    rotation?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power3.out", rotation = 180, stagger = 0 } = options || {};

  return gsap.from(element, {
    rotation,
    opacity: 0,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Rotate Out Animation
 */
export const rotateOut = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    rotation?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power3.in", rotation = 180, stagger = 0 } = options || {};

  return gsap.to(element, {
    rotation,
    opacity: 0,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Continuous Rotation Animation
 */
export const spin = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    rotation?: number;
    repeat?: number;
  }
) => {
  const { duration = 2, delay = 0, ease = "none", rotation = 360, repeat = -1 } = options || {};

  return gsap.to(element, {
    rotation,
    duration,
    delay,
    ease,
    repeat,
  });
};

/**
 * Flip Animation
 */
export const flip = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    rotationY?: number;
    stagger?: number;
  }
) => {
  const { duration = 0.8, delay = 0, ease = "power2.inOut", rotationY = 180, stagger = 0 } = options || {};

  return gsap.from(element, {
    rotationY,
    opacity: 0,
    duration,
    delay,
    ease,
    stagger,
    transformPerspective: 1000,
  });
};

/**
 * Wobble Animation
 */
export const wobble = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    rotation?: number;
    repeat?: number;
  }
) => {
  const { duration = 0.5, delay = 0, rotation = 5, repeat = 5 } = options || {};

  return gsap.to(element, {
    rotation,
    duration,
    delay,
    ease: "power1.inOut",
    yoyo: true,
    repeat,
  });
};

