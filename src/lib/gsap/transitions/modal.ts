"use client";

import { gsap } from "gsap";

/**
 * Modal Fade Transition with Blur
 */
export const modalFadeTransition = (
  modal: gsap.DOMTarget,
  overlay?: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 0.3, ease = "power2.out", blur = 10 } = options || {};

  const tl = gsap.timeline();

  if (overlay) {
    tl.from(overlay, {
      opacity: 0,
      duration,
      ease,
    });
  }

  tl.from(
    modal,
    {
      opacity: 0,
      filter: `blur(${blur}px)`,
      duration,
      ease,
    },
    overlay ? `-=${duration / 2}` : 0
  );

  return tl;
};

/**
 * Modal Blur Transition (replaces scale)
 */
export const modalScaleTransition = (
  modal: gsap.DOMTarget,
  overlay?: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 0.4, ease = "power2.out", blur = 10 } = options || {};

  const tl = gsap.timeline();

  if (overlay) {
    tl.from(overlay, {
      opacity: 0,
      duration: duration * 0.6,
      ease: "power2.out",
    });
  }

  tl.from(
    modal,
    {
      opacity: 0,
      filter: `blur(${blur}px)`,
      duration,
      ease,
    },
    overlay ? `-=${duration / 2}` : 0
  );

  return tl;
};

/**
 * Modal Blur Transition (replaces slide)
 */
export const modalSlideTransition = (
  modal: gsap.DOMTarget,
  overlay?: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    blur?: number;
  }
) => {
  const { duration = 0.5, ease = "power2.out", blur = 10 } = options || {};

  const tl = gsap.timeline();

  if (overlay) {
    tl.from(overlay, {
      opacity: 0,
      duration: duration * 0.6,
      ease: "power2.out",
    });
  }

  tl.from(
    modal,
    {
      opacity: 0,
      filter: `blur(${blur}px)`,
      duration,
      ease,
    },
    overlay ? `-=${duration / 2}` : 0
  );

  return tl;
};
