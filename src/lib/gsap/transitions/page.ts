"use client";

import { gsap } from "gsap";

/**
 * Fade Page Transition with Blur
 */
export const fadePageTransition = (
  exitElement: gsap.DOMTarget,
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 0.6, ease = "power2.out", blur = 10 } = options || {};

  const tl = gsap.timeline();

  tl.to(exitElement, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration: duration / 2,
    ease,
  }).from(
    enterElement,
    {
      opacity: 0,
      filter: `blur(${blur}px)`,
      duration: duration / 2,
      ease,
    },
    `-=${duration / 4}`
  );

  return tl;
};

/**
 * Blur Page Transition (replaces slide)
 */
export const slidePageTransition = (
  exitElement: gsap.DOMTarget,
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 0.8, ease = "power2.out", blur = 15 } = options || {};

  const tl = gsap.timeline();

  tl.to(exitElement, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration: duration / 2,
    ease,
  }).from(
    enterElement,
    {
      opacity: 0,
      filter: `blur(${blur}px)`,
      duration: duration / 2,
      ease,
    },
    `-=${duration / 4}`
  );

  return tl;
};

/**
 * Blur Page Transition (replaces scale)
 */
export const scalePageTransition = (
  exitElement: gsap.DOMTarget,
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 0.8, ease = "power2.out", blur = 10 } = options || {};

  const tl = gsap.timeline();

  tl.to(exitElement, {
    opacity: 0,
    filter: `blur(${blur}px)`,
    duration: duration / 2,
    ease,
  }).from(
    enterElement,
    {
      opacity: 0,
      filter: `blur(${blur}px)`,
      duration: duration / 2,
      ease,
    },
    `-=${duration / 4}`
  );

  return tl;
};

/**
 * Blur Wipe Page Transition
 */
export const wipePageTransition = (
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 0.8, ease = "power2.out", blur = 15 } = options || {};

  const tl = gsap.timeline();

  tl.from(enterElement, {
          opacity: 0,
    filter: `blur(${blur}px)`,
    duration,
        ease,
      });

  return tl;
};

/**
 * Blur Curtain Page Transition
 */
export const curtainPageTransition = (
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 0.8, ease = "power2.out", blur = 15 } = options || {};

  const tl = gsap.timeline();

  tl.from(enterElement, {
        opacity: 0,
    filter: `blur(${blur}px)`,
    duration,
      ease,
    });

  return tl;
};
