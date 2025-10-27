"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Horizontal Scroll Section
 */
export const horizontalScroll = (
  container: gsap.DOMTarget,
  sections: gsap.DOMTarget,
  options?: {
    start?: string;
    end?: string;
    scrub?: number;
    pin?: boolean;
    markers?: boolean;
  }
) => {
  const { start = "top top", scrub = 1, pin = true, markers = false } = options || {};

  const containerEl = gsap.utils.toArray(container)[0] as HTMLElement;
  const sectionsEl = gsap.utils.toArray(sections);

  const scrollWidth = sectionsEl.reduce((acc: number, section) => {
    return acc + (section as HTMLElement).offsetWidth;
  }, 0);

  return gsap.to(sections, {
    x: () => -(scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start,
      end: () => `+=${scrollWidth}`,
      scrub,
      pin,
      markers,
      anticipatePin: 1,
    },
  });
};

/**
 * Horizontal Gallery Scroll
 */
export const horizontalGallery = (
  container: gsap.DOMTarget,
  items: gsap.DOMTarget,
  options?: {
    spacing?: number;
    scrub?: number;
    snap?: boolean;
  }
) => {
  const { spacing = 30, scrub = 1, snap = true } = options || {};

  const itemsArray = gsap.utils.toArray(items) as HTMLElement[];
  const totalWidth = itemsArray.reduce((acc, item) => acc + item.offsetWidth + spacing, -spacing);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: () => `+=${totalWidth}`,
      scrub,
      pin: true,
      ...(snap && { snap: 1 / (itemsArray.length - 1) }),
    },
  });

  tl.to(items, {
    x: -totalWidth,
    ease: "none",
  });

  return tl;
};

/**
 * Infinite Horizontal Scroll
 */
export const infiniteHorizontalScroll = (
  container: gsap.DOMTarget,
  speed: number = 1
) => {
  const containerEl = gsap.utils.toArray(container)[0] as HTMLElement;
  const items = gsap.utils.toArray(containerEl.children);

  // Clone items for infinite effect
  items.forEach((item) => {
    const clone = (item as HTMLElement).cloneNode(true);
    containerEl.appendChild(clone);
  });

  const totalWidth = items.reduce((acc: number, item) => acc + (item as HTMLElement).offsetWidth, 0);

  return gsap.to(containerEl, {
    x: -totalWidth,
    duration: totalWidth / (speed * 100),
    ease: "none",
    repeat: -1,
  });
};

