"use client";

import { gsap } from "gsap";

/**
 * Modal Fade Transition
 */
export const modalFadeTransition = (
  modal: gsap.DOMTarget,
  overlay?: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
  }
) => {
  const { duration = 0.3, ease = "power2.out" } = options || {};

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
      duration,
      ease,
    },
    overlay ? `-=${duration / 2}` : 0
  );

  return tl;
};

/**
 * Modal Scale Transition
 */
export const modalScaleTransition = (
  modal: gsap.DOMTarget,
  overlay?: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    scale?: number;
  }
) => {
  const { duration = 0.4, ease = "back.out(1.7)", scale = 0.8 } = options || {};

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
      scale,
      duration,
      ease,
    },
    overlay ? `-=${duration / 2}` : 0
  );

  return tl;
};

/**
 * Modal Slide Transition
 */
export const modalSlideTransition = (
  modal: gsap.DOMTarget,
  overlay?: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    direction?: "up" | "down" | "left" | "right";
  }
) => {
  const { duration = 0.5, ease = "power3.out", direction = "up" } = options || {};

  const directionMap = {
    up: { y: "100%" },
    down: { y: "-100%" },
    left: { x: "100%" },
    right: { x: "-100%" },
  };

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
      ...directionMap[direction],
      duration,
      ease,
    },
    overlay ? `-=${duration / 2}` : 0
  );

  return tl;
};

