# GSAP Animation Library

A comprehensive collection of GSAP animations, transitions, and scroll utilities for Next.js.

## 📦 Structure

```
src/lib/gsap/
├── init.ts              # GSAP initialization & smooth scroll setup
├── animations/          # Reusable animations
│   ├── fade.ts         # Fade animations (in, out, up, down, etc.)
│   ├── reveal.ts       # Reveal animations (slide, text, clip, etc.)
│   ├── scale.ts        # Scale animations (in, out, pulse, etc.)
│   ├── rotate.ts       # Rotation animations (spin, flip, wobble)
│   └── index.ts        # Export all animations
├── transitions/         # Page & component transitions
│   ├── page.ts         # Page transitions (fade, slide, wipe, etc.)
│   ├── modal.ts        # Modal transitions
│   └── index.ts        # Export all transitions
├── scroll/              # Scroll-based effects
│   ├── parallax.ts     # Parallax effects
│   ├── trigger.ts      # ScrollTrigger utilities
│   ├── horizontal.ts   # Horizontal scroll sections
│   ├── reveal.ts       # Scroll-triggered reveals
│   └── index.ts        # Export all scroll utilities
└── index.ts             # Main export file
```

## 🚀 Getting Started

### 1. Initialize GSAP (in your root layout or app component)

```tsx
"use client";

import { useEffect } from "react";
import { initGSAP } from "@/lib/gsap";

export default function RootLayout({ children }) {
  useEffect(() => {
    initGSAP();
  }, []);

  return <html>{children}</html>;
}
```

### 2. Use Smooth Scroll (Optional)

For basic smooth scroll (free):

```tsx
import { initBasicSmoothScroll } from "@/lib/gsap";

useEffect(() => {
  initBasicSmoothScroll();
}, []);
```

For advanced smooth scroll with ScrollSmoother (requires GSAP membership):

```tsx
import { initSmoothScroll } from "@/lib/gsap";

useEffect(() => {
  const smoother = initSmoothScroll({
    smooth: 1.5,
    effects: true,
    smoothTouch: false,
  });

  return () => smoother?.kill();
}, []);
```

## 🎨 Animations

### Fade Animations

```tsx
import { fadeIn, fadeInUp, fadeInLeft, fadeInScale } from "@/lib/gsap/animations";

useEffect(() => {
  fadeInUp(".hero-title", {
    duration: 1,
    delay: 0.2,
    distance: 60,
  });

  fadeInScale(".cards", {
    stagger: 0.1,
    scale: 0.8,
  });
}, []);
```

### Reveal Animations

```tsx
import { slideReveal, textReveal, clipReveal, staggerReveal } from "@/lib/gsap/animations";

useEffect(() => {
  clipReveal(".image", {
    direction: "horizontal",
    duration: 1.5,
  });

  staggerReveal(".list-items", {
    stagger: 0.1,
    from: "start",
  });
}, []);
```

### Scale Animations

```tsx
import { scaleIn, pulse, bounceScale } from "@/lib/gsap/animations";

useEffect(() => {
  bounceScale(".button", {
    scale: 0,
    duration: 1,
  });

  pulse(".icon", {
    scale: 1.1,
    repeat: -1,
  });
}, []);
```

### Rotate Animations

```tsx
import { rotateIn, spin, flip, wobble } from "@/lib/gsap/animations";

useEffect(() => {
  flip(".card", {
    duration: 0.8,
  });

  spin(".loading-icon", {
    duration: 2,
    repeat: -1,
  });
}, []);
```

## 🔄 Transitions

### Page Transitions

```tsx
import { fadePageTransition, slidePageTransition, wipePageTransition } from "@/lib/gsap/transitions";

// Example with Next.js route change
const handlePageTransition = () => {
  slidePageTransition(".current-page", ".next-page", {
    direction: "left",
    duration: 0.8,
  });
};
```

### Modal Transitions

```tsx
import { modalScaleTransition, modalSlideTransition } from "@/lib/gsap/transitions";

const showModal = () => {
  modalScaleTransition(".modal", ".modal-overlay", {
    duration: 0.4,
    scale: 0.8,
  });
};
```

## 📜 Scroll Effects

### Parallax

```tsx
import { parallax, parallaxScale, parallaxLayers } from "@/lib/gsap/scroll";

useEffect(() => {
  parallax(".parallax-image", {
    speed: 0.5,
  });

  parallaxScale(".scale-on-scroll", {
    scale: 1.2,
  });

  parallaxLayers([
    { element: ".layer-1", speed: 0.2 },
    { element: ".layer-2", speed: 0.5 },
    { element: ".layer-3", speed: 0.8 },
  ]);
}, []);
```

### ScrollTrigger

```tsx
import { scrollTriggerAnimation, pinElement, scrubAnimation } from "@/lib/gsap/scroll";

useEffect(() => {
  scrollTriggerAnimation(
    ".fade-in-element",
    { opacity: 1, y: 0 },
    {
      start: "top 80%",
      toggleActions: "play none none reverse",
    }
  );

  pinElement(".sticky-section", {
    start: "top top",
    end: "+=500",
  });
}, []);
```

### Horizontal Scroll

```tsx
import { horizontalScroll, horizontalGallery } from "@/lib/gsap/scroll";

useEffect(() => {
  horizontalScroll(".scroll-container", ".scroll-sections", {
    scrub: 1,
    pin: true,
  });

  horizontalGallery(".gallery-container", ".gallery-items", {
    spacing: 30,
    snap: true,
  });
}, []);
```

### Scroll Reveals

```tsx
import { scrollFadeIn, scrollStaggerReveal, scrollCounter } from "@/lib/gsap/scroll";

useEffect(() => {
  scrollStaggerReveal(".grid-items", {
    stagger: 0.1,
    y: 60,
  });

  scrollCounter(".counter", {
    start: 0,
    end: 1000,
    duration: 2,
  });
}, []);
```

## 🛠 Utilities

### Cleanup ScrollTrigger

```tsx
import { cleanupScrollTrigger } from "@/lib/gsap";

useEffect(() => {
  // Your scroll animations

  return () => {
    cleanupScrollTrigger();
  };
}, []);
```

### Refresh ScrollTrigger

```tsx
import { refreshScrollTrigger } from "@/lib/gsap";

// Call after dynamic content loads
refreshScrollTrigger();
```

### Scroll to Element

```tsx
import { scrollTo } from "@/lib/gsap";

const handleClick = () => {
  scrollTo("#section", {
    duration: 1.5,
    ease: "power3.inOut",
  });
};
```

## 💡 Tips

1. **Always clean up animations**: Use `return () => { ... }` in useEffect to kill animations
2. **Refresh ScrollTrigger**: Call `refreshScrollTrigger()` after loading dynamic content
3. **Use markers for debugging**: Add `markers: true` to ScrollTrigger options
4. **Client-side only**: All GSAP code should run in `"use client"` components
5. **Performance**: Use `will-change` CSS property for animated elements

## 📚 Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [GSAP Eases Visualizer](https://greensock.com/ease-visualizer/)

## 🎯 Common Use Cases

### Landing Page Hero

```tsx
useEffect(() => {
  const tl = gsap.timeline();
  
  tl.from(".hero-title", { opacity: 0, y: 60, duration: 1 })
    .from(".hero-subtitle", { opacity: 0, y: 40, duration: 0.8 }, "-=0.5")
    .from(".hero-cta", { opacity: 0, scale: 0.8, duration: 0.6 }, "-=0.3");
}, []);
```

### Scroll-triggered Cards

```tsx
useEffect(() => {
  scrollStaggerReveal(".card", {
    stagger: 0.15,
    y: 80,
    start: "top 85%",
  });
}, []);
```

### Infinite Marquee

```tsx
useEffect(() => {
  infiniteHorizontalScroll(".marquee", 1);
}, []);
```

