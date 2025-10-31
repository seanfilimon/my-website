"use client";

import { usePathname } from "next/navigation";

export function ConditionalContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that should break out of the container
  const breakoutPages = ["/resources", "/github", "/admin"];
  const shouldBreakout = pathname ? breakoutPages.some(page => pathname.startsWith(page)) : false;
  
  if (shouldBreakout) {
    return <>{children}</>;
  }
  
  return (
    <div className="container max-w-7xl mx-auto border-l border-r min-h-screen">
      {children}
    </div>
  );
}

