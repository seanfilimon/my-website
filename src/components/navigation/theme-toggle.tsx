"use client";

import { Button } from "@/components/ui/button";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "@/src/hooks/use-theme";
import { useThemeTransition } from "@/src/hooks/use-theme-transition";

export function ThemeToggle() {
  const { theme, mounted } = useTheme();
  const { toggleWithAnimation } = useThemeTransition({
    duration: 500,
    easing: "ease-in-out",
  });

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = theme === "dark" ? "light" : "dark";
    toggleWithAnimation(event, newTheme);
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-sm"
        disabled
      >
        <IoMoonOutline className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className="rounded-sm"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <IoSunnyOutline className="h-5 w-5" />
      ) : (
        <IoMoonOutline className="h-5 w-5" />
      )}
    </Button>
  );
}

