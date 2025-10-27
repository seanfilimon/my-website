import { useEffect } from "react";

/**
 * Hook to prevent body scroll without causing layout shift
 * Useful for modals and dropdowns
 */
export function usePreventScroll(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Prevent scroll without layout shift
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isActive]);
}

