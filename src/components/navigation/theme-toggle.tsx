"use client";

import { Button } from "@/components/ui/button";
import { IoMoonOutline } from "react-icons/io5";

export function ThemeToggle() {
  // Fixed dark theme - no toggle functionality
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-sm"
      disabled
      aria-label="Dark theme active"
    >
      <IoMoonOutline className="h-5 w-5" />
    </Button>
  );
}

