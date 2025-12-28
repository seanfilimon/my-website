"use client";

import * as React from "react";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";
import { useUploadThing } from "@/src/lib/uploadthing-client";
import { cn } from "@/src/lib/utils";
import { Button } from "./button";
import { IoCloudUploadOutline, IoTrashOutline, IoImageOutline, IoFolderOpenOutline } from "react-icons/io5";
import { toast } from "sonner";
import { trpc } from "@/src/lib/trpc/client";
import { AssetPicker } from "@/components/admin/asset-picker";
import { AssetCategory } from "@/src/lib/admin/types";

type UploadEndpoint = "thumbnailUploader" | "coverImageUploader" | "avatarUploader" | "iconUploader" | "galleryUploader" | "fileUploader";

// Map endpoint to asset category
const endpointToCategoryMap: Record<UploadEndpoint, AssetCategory> = {
  thumbnailUploader: "THUMBNAIL",
  coverImageUploader: "COVER_IMAGE",
  avatarUploader: "AVATAR",
  iconUploader: "ICON",
  galleryUploader: "GALLERY",
  fileUploader: "ATTACHMENT",
};

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  endpoint?: UploadEndpoint;
  className?: string;
  disabled?: boolean;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  placeholder?: string;
  /** Optional alt text for the uploaded image */
  alt?: string;
  /** Show the "Choose from Library" button */
  showLibrary?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  endpoint = "thumbnailUploader",
  className,
  disabled = false,
  aspectRatio = "video",
  placeholder = "Upload an image",
  alt,
  showLibrary = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  
  // tRPC mutation to create asset in database
  const createAsset = trpc.asset.create.useMutation();

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: async (res) => {
      if (res?.[0]) {
        const file = res[0];
        
        // Save asset to database
        try {
          // Generate name from filename (remove extension and replace dashes/underscores with spaces)
          const assetName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          
          await createAsset.mutateAsync({
            name: assetName,
            url: file.ufsUrl,
            key: file.key,
            filename: file.name,
            size: file.size,
            mimeType: file.type,
            type: "IMAGE",
            category: endpointToCategoryMap[endpoint],
            alt: alt,
          });
          
          onChange(file.ufsUrl);
          toast.success("Image uploaded successfully");
        } catch (error) {
          console.error("Failed to save asset to database:", error);
          // Still return the URL even if DB save fails
          onChange(file.ufsUrl);
          toast.warning("Image uploaded but failed to save to library");
        }
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadError: (error) => {
      toast.error(error.message || "Failed to upload image");
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsUploading(true);
      await startUpload(acceptedFiles);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"] },
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleSelectFromLibrary = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerOpen(true);
  };

  const handleAssetSelect = (url: string) => {
    onChange(url);
    setPickerOpen(false);
  };

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    auto: "",
  }[aspectRatio];

  return (
    <>
      <div className={cn("w-full", className)}>
        {value ? (
          <div className={cn("relative rounded-lg overflow-hidden border bg-muted", aspectRatioClass)}>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {showLibrary && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectFromLibrary}
                  disabled={disabled}
                >
                  <IoFolderOpenOutline className="size-4" />
                  Change
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <IoTrashOutline className="size-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              {...getRootProps()}
              className={cn(
                "relative rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                aspectRatioClass,
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                (disabled || isUploading) && "opacity-50 cursor-not-allowed",
                !aspectRatioClass && "min-h-[150px]"
              )}
            >
              <input {...getInputProps()} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                {isUploading ? (
                  <>
                    <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </>
                ) : (
                  <>
                    {isDragActive ? (
                      <IoCloudUploadOutline className="size-10 text-primary" />
                    ) : (
                      <IoImageOutline className="size-10 text-muted-foreground" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {isDragActive ? "Drop the image here" : placeholder}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Drag & drop or click to browse
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {showLibrary && !isUploading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleSelectFromLibrary}
                disabled={disabled}
              >
                <IoFolderOpenOutline className="size-4 mr-2" />
                Choose from Library
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Asset Picker Modal */}
      {showLibrary && (
        <AssetPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handleAssetSelect}
          filterType="IMAGE"
          filterCategory={endpointToCategoryMap[endpoint]}
          title="Select Image"
          description="Choose an image from your library or upload a new one."
        />
      )}
    </>
  );
}
