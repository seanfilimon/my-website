"use client";

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Custom layout for resources page - breaks out of main container
  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 overflow-hidden bg-background">
      {children}
    </div>
  );
}
