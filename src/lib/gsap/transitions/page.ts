"use client";

import { gsap } from "gsap";

/**
 * Fade Page Transition
 */
export const fadePageTransition = (
  exitElement: gsap.DOMTarget,
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
  }
) => {
  const { duration = 0.6, ease = "power2.inOut" } = options || {};

  const tl = gsap.timeline();

  tl.to(exitElement, {
    opacity: 0,
    duration: duration / 2,
    ease,
  }).from(
    enterElement,
    {
      opacity: 0,
      duration: duration / 2,
      ease,
    },
    `-=${duration / 4}`
  );

  return tl;
};

/**
 * Slide Page Transition
 */
export const slidePageTransition = (
  exitElement: gsap.DOMTarget,
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    direction?: "left" | "right" | "up" | "down";
  }
) => {
  const { duration = 0.8, ease = "power3.inOut", direction = "left" } = options || {};

  const directionMap = {
    left: { x: "-100%", exitX: "-100%" },
    right: { x: "100%", exitX: "100%" },
    up: { y: "-100%", exitY: "-100%" },
    down: { y: "100%", exitY: "100%" },
  };

  const tl = gsap.timeline();

  const config = directionMap[direction];

  tl.to(exitElement, {
    ...("exitX" in config ? { x: config.exitX } : { y: config.exitY }),
    duration,
    ease,
  }).from(
    enterElement,
    {
      ...("x" in config ? { x: config.x } : { y: config.y }),
      duration,
      ease,
    },
    `-=${duration}`
  );

  return tl;
};

/**
 * Scale Page Transition
 */
export const scalePageTransition = (
  exitElement: gsap.DOMTarget,
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
  }
) => {
  const { duration = 0.8, ease = "power3.inOut" } = options || {};

  const tl = gsap.timeline();

  tl.to(exitElement, {
    scale: 0.8,
    opacity: 0,
    duration: duration / 2,
    ease,
  }).from(
    enterElement,
    {
      scale: 1.2,
      opacity: 0,
      duration: duration / 2,
      ease,
    },
    `-=${duration / 4}`
  );

  return tl;
};

/**
 * Wipe Page Transition
 */
export const wipePageTransition = (
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    direction?: "left" | "right" | "top" | "bottom";
    color?: string;
  }
) => {
  const { duration = 1, ease = "power4.inOut", direction = "left", color = "#000" } = options || {};

  const tl = gsap.timeline();

  // Create wipe overlay
  const wipe = document.createElement("div");
  wipe.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${color};
    z-index: 9999;
  `;

  document.body.appendChild(wipe);

  const directionMap = {
    left: { xPercent: -100, enterX: "-100%" },
    right: { xPercent: 100, enterX: "100%" },
    top: { yPercent: -100, enterY: "-100%" },
    bottom: { yPercent: 100, enterY: "100%" },
  };

  const config = directionMap[direction];
  const isHorizontal = direction === "left" || direction === "right";

  if (isHorizontal && "xPercent" in config) {
    tl.set(wipe, { xPercent: config.xPercent })
      .to(wipe, {
        xPercent: 0,
        duration: duration / 2,
        ease,
      })
      .from(
        enterElement,
        {
          opacity: 0,
          duration: 0.1,
        },
        `-=${duration / 4}`
      )
      .to(wipe, {
        xPercent: -config.xPercent,
        duration: duration / 2,
        ease,
        onComplete: () => {
          wipe.remove();
        },
      });
  } else if ("yPercent" in config) {
    tl.set(wipe, { yPercent: config.yPercent })
      .to(wipe, {
        yPercent: 0,
        duration: duration / 2,
        ease,
      })
      .from(
        enterElement,
        {
          opacity: 0,
          duration: 0.1,
        },
        `-=${duration / 4}`
      )
      .to(wipe, {
        yPercent: -config.yPercent,
        duration: duration / 2,
        ease,
        onComplete: () => {
          wipe.remove();
        },
      });
  }

  return tl;
};

/**
 * Curtain Page Transition
 */
export const curtainPageTransition = (
  enterElement: gsap.DOMTarget,
  options?: {
    duration?: number;
    ease?: string;
    color?: string;
  }
) => {
  const { duration = 1.2, ease = "power4.inOut", color = "#000" } = options || {};

  const tl = gsap.timeline();

  // Create curtain panels
  const leftCurtain = document.createElement("div");
  const rightCurtain = document.createElement("div");

  const curtainStyle = `
    position: fixed;
    top: 0;
    width: 50%;
    height: 100%;
    background-color: ${color};
    z-index: 9999;
  `;

  leftCurtain.style.cssText = curtainStyle + "left: 0;";
  rightCurtain.style.cssText = curtainStyle + "right: 0;";

  document.body.appendChild(leftCurtain);
  document.body.appendChild(rightCurtain);

  tl.set([leftCurtain, rightCurtain], { xPercent: -100 })
    .to([leftCurtain, rightCurtain], {
      xPercent: 0,
      duration: duration / 2,
      ease,
    })
    .from(
      enterElement,
      {
        opacity: 0,
        duration: 0.1,
      },
      `-=${duration / 4}`
    )
    .to([leftCurtain, rightCurtain], {
      xPercent: 100,
      duration: duration / 2,
      ease,
      onComplete: () => {
        leftCurtain.remove();
        rightCurtain.remove();
      },
    });

  return tl;
};

