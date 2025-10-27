"use client";

import { useCallback } from "react";
import { useTheme, type Theme } from "@/src/components/providers/theme-provider";

interface ThemeTransitionOptions {
  duration?: number;
  easing?: string;
}

export const useThemeTransition = (options: ThemeTransitionOptions = {}) => {
  const { setTheme } = useTheme();
  const { duration = 400, easing = "ease-in-out" } = options;

  const isAppearanceTransition =
    typeof document !== "undefined" &&
    // @ts-expect-error document.startViewTransition can be undefined
    document.startViewTransition &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Toggle theme with circular radial animation
   * Credit to [@hooray](https://github.com/hooray) and VitePress team
   * @see https://github.com/vuejs/vitepress/pull/2347
   */
  const toggleWithAnimation = useCallback(
    (event?: React.MouseEvent, targetTheme?: Theme) => {
      if (!isAppearanceTransition || !event) {
        if (targetTheme) {
          setTheme(targetTheme);
        }
        return;
      }

      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // @ts-expect-error document.startViewTransition is not in TypeScript types yet
      const transition = document.startViewTransition(async () => {
        if (targetTheme) {
          setTheme(targetTheme);
        }
        // Wait for React to update the DOM
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration,
            easing,
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    },
    [setTheme, duration, easing, isAppearanceTransition]
  );

  return {
    toggleWithAnimation,
    isTransitionSupported: isAppearanceTransition,
  };
};

