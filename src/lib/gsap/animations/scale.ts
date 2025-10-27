"use client";

import { gsap } from "gsap";

/**
 * Scale In Animation
 */
export const scaleIn = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    scale?: number;
    stagger?: number;
  }
) => {
  const { duration = 0.8, delay = 0, ease = "back.out(1.7)", scale = 0, stagger = 0 } = options || {};

  return gsap.from(element, {
    scale,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Scale Out Animation
 */
export const scaleOut = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    scale?: number;
    stagger?: number;
  }
) => {
  const { duration = 0.8, delay = 0, ease = "back.in(1.7)", scale = 0, stagger = 0 } = options || {};

  return gsap.to(element, {
    scale,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Pulse Animation
 */
export const pulse = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    scale?: number;
    repeat?: number;
    yoyo?: boolean;
  }
) => {
  const { duration = 0.5, delay = 0, ease = "power2.inOut", scale = 1.1, repeat = -1, yoyo = true } = options || {};

  return gsap.to(element, {
    scale,
    duration,
    delay,
    ease,
    repeat,
    yoyo,
  });
};

/**
 * Bounce Scale Animation
 */
export const bounceScale = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    scale?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, scale = 0, stagger = 0 } = options || {};

  return gsap.from(element, {
    scale,
    duration,
    delay,
    ease: "elastic.out(1, 0.5)",
    stagger,
  });
};

/**
 * Scale and Rotate Animation
 */
export const scaleRotate = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    scale?: number;
    rotation?: number;
    stagger?: number;
  }
) => {
  const {
    duration = 1,
    delay = 0,
    ease = "back.out(1.7)",
    scale = 0,
    rotation = 180,
    stagger = 0,
  } = options || {};

  return gsap.from(element, {
    scale,
    rotation,
    duration,
    delay,
    ease,
    stagger,
  });
};

/**
 * Scale with Opacity Animation
 */
export const scaleOpacity = (
  element: gsap.DOMTarget,
  options?: {
    duration?: number;
    delay?: number;
    ease?: string;
    scale?: number;
    opacity?: number;
    stagger?: number;
  }
) => {
  const { duration = 1, delay = 0, ease = "power3.out", scale = 0.5, opacity = 0, stagger = 0 } = options || {};

  return gsap.from(element, {
    scale,
    opacity,
    duration,
    delay,
    ease,
    stagger,
  });
};

