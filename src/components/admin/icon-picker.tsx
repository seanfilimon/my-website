"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/src/lib/utils";
import { IoImageOutline, IoTextOutline, IoTrashOutline } from "react-icons/io5";
import { AssetPicker } from "./asset-picker";

type IconMode = "emoji" | "image";

interface IconPickerProps {
  /** Text/emoji icon value */
  icon: string;
  /** Image URL for custom icon */
  iconUrl?: string | null;
  /** Callback when icon changes */
  onIconChange: (icon: string) => void;
  /** Callback when iconUrl changes */
  onIconUrlChange: (iconUrl: string | null) => void;
  /** Disable the picker */
  disabled?: boolean;
  /** Class name for the container */
  className?: string;
}

export function IconPicker({
  icon,
  iconUrl,
  onIconChange,
  onIconUrlChange,
  disabled = false,
  className,
}: IconPickerProps) {
  // Determine initial mode based on whether iconUrl is set
  const [mode, setMode] = useState<IconMode>(iconUrl ? "image" : "emoji");
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleModeChange = (newMode: IconMode) => {
    setMode(newMode);
    // Clear the other value when switching modes
    if (newMode === "emoji") {
      onIconUrlChange(null);
    }
  };

  const handleAssetSelect = (url: string) => {
    onIconUrlChange(url);
    setPickerOpen(false);
  };

  const handleRemoveImage = () => {
    onIconUrlChange(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Icon Type</Label>
        <div className="flex items-center border rounded-md">
          <Button
            type="button"
            variant={mode === "emoji" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-r-none gap-1.5"
            onClick={() => handleModeChange("emoji")}
            disabled={disabled}
          >
            <IoTextOutline className="size-4" />
            Emoji
          </Button>
          <Button
            type="button"
            variant={mode === "image" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-l-none gap-1.5"
            onClick={() => handleModeChange("image")}
            disabled={disabled}
          >
            <IoImageOutline className="size-4" />
            Image
          </Button>
        </div>
      </div>

      {/* Emoji/Text Input */}
      {mode === "emoji" && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-lg border bg-muted flex items-center justify-center text-2xl"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {icon || "📦"}
            </div>
            <Input
              value={icon}
              onChange={(e) => onIconChange(e.target.value)}
              placeholder="▲ or 📦"
              className="flex-1"
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter an emoji or short text (1-2 characters work best)
          </p>
        </div>
      )}

      {/* Image Upload */}
      {mode === "image" && (
        <div className="space-y-2">
          {iconUrl ? (
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg border bg-muted overflow-hidden relative">
                <Image
                  src={iconUrl}
                  alt="Icon"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate max-w-[200px]">
                  Custom icon selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to change or remove
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPickerOpen(true)}
                  disabled={disabled}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={disabled}
                >
                  <IoTrashOutline className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full h-16 border-dashed"
              onClick={() => setPickerOpen(true)}
              disabled={disabled}
            >
              <div className="flex flex-col items-center gap-1">
                <IoImageOutline className="size-6 text-muted-foreground" />
                <span className="text-sm">Choose icon from library</span>
              </div>
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            Select an image from your asset library to use as the icon
          </p>
        </div>
      )}

      {/* Asset Picker Modal */}
      <AssetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAssetSelect}
        filterType="IMAGE"
        filterCategory="ICON"
        title="Select Icon"
        description="Choose an icon image from your library or upload a new one."
      />
    </div>
  );
}
