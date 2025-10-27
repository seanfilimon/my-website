"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

interface ResourcesLayoutClientProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function ResourcesLayoutClient({ children, sidebar }: ResourcesLayoutClientProps) {
  const pathname = usePathname();
  const hasAnimated = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Animate sidebar only once when first entering resources section
  useEffect(() => {
    if (!sidebarRef.current || hasAnimated.current) {
      setIsReady(true);
      return;
    }

    hasAnimated.current = true;

    // Initial state
    gsap.set(sidebarRef.current, { x: -288, opacity: 0 });

    // Animate in
    gsap.to(sidebarRef.current, {
      x: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power3.out",
      delay: 0.1,
      onComplete: () => setIsReady(true)
    });
  }, []);

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Sidebar wrapper with animation */}
      <div ref={sidebarRef} className={!isReady ? 'opacity-0' : ''}>
        {sidebar}
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0 h-full">
        {children}
      </div>
    </div>
  );
}

