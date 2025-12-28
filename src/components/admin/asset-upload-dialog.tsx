"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";
import { useUploadThing } from "@/src/lib/uploadthing-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IoCloudUploadOutline,
  IoImageOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { trpc } from "@/src/lib/trpc/client";
import { AssetCategory } from "@/src/lib/admin/types";
import { cn } from "@/src/lib/utils";

interface AssetUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultCategory?: AssetCategory;
}

type UploadStep = "upload" | "details" | "complete";

export function AssetUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultCategory = "OTHER",
}: AssetUploadDialogProps) {
  const [step, setStep] = useState<UploadStep>("upload");
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    key: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<AssetCategory>(defaultCategory);

  // Create asset mutation
  const createAsset = trpc.asset.create.useMutation({
    onSuccess: () => {
      toast.success("Asset uploaded successfully");
      setStep("complete");
      setTimeout(() => {
        resetAndClose();
        onSuccess();
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save asset");
    },
  });

  const { startUpload } = useUploadThing("fileUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        const file = res[0];
        setUploadedFile({
          url: file.ufsUrl,
          key: file.key,
          name: file.name,
          size: file.size,
          type: file.type,
        });
        // Auto-fill name from filename
        setName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        setStep("details");
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadError: (error) => {
      toast.error(error.message || "Failed to upload file");
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsUploading(true);
      await startUpload(acceptedFiles);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
      "video/*": [".mp4", ".webm", ".mov"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const resetAndClose = () => {
    setStep("upload");
    setUploadedFile(null);
    setName("");
    setTitle("");
    setAlt("");
    setCaption("");
    setCategory(defaultCategory);
    setIsUploading(false);
    setUploadProgress(0);
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!uploadedFile || !name.trim()) return;

    // Determine asset type from mime type
    let assetType: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "OTHER" = "OTHER";
    if (uploadedFile.type.startsWith("image/")) assetType = "IMAGE";
    else if (uploadedFile.type.startsWith("video/")) assetType = "VIDEO";
    else if (uploadedFile.type.startsWith("audio/")) assetType = "AUDIO";
    else if (uploadedFile.type === "application/pdf") assetType = "DOCUMENT";

    createAsset.mutate({
      name: name.trim(),
      title: title.trim() || undefined,
      url: uploadedFile.url,
      key: uploadedFile.key,
      filename: uploadedFile.name,
      size: uploadedFile.size,
      mimeType: uploadedFile.type,
      type: assetType,
      category,
      alt: alt.trim() || undefined,
      caption: caption.trim() || undefined,
    });
  };

  const isImage = uploadedFile?.type.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Upload Asset"}
            {step === "details" && "Asset Details"}
            {step === "complete" && "Upload Complete"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Drag and drop a file or click to browse."}
            {step === "details" && "Add details to help organize your asset."}
            {step === "complete" && "Your asset has been saved to the library."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div
            {...getRootProps()}
            className={cn(
              "relative rounded-lg border-2 border-dashed transition-colors cursor-pointer min-h-[200px]",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              {isUploading ? (
                <>
                  <div className="size-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </>
              ) : (
                <>
                  {isDragActive ? (
                    <IoCloudUploadOutline className="size-12 text-primary" />
                  ) : (
                    <IoImageOutline className="size-12 text-muted-foreground" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {isDragActive ? "Drop the file here" : "Drop file here or click to browse"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Images, videos, PDFs up to 16MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {step === "details" && uploadedFile && (
          <div className="space-y-4">
            {/* Preview */}
            {isImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={uploadedFile.url}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Form */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Asset name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="SEO title (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input
                    id="alt"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Alt text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THUMBNAIL">Thumbnail</SelectItem>
                      <SelectItem value="COVER_IMAGE">Cover Image</SelectItem>
                      <SelectItem value="AVATAR">Avatar</SelectItem>
                      <SelectItem value="ICON">Icon</SelectItem>
                      <SelectItem value="GALLERY">Gallery</SelectItem>
                      <SelectItem value="ATTACHMENT">Attachment</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption (optional)"
                />
              </div>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="flex flex-col items-center justify-center py-8">
            <IoCheckmarkCircleOutline className="size-16 text-green-500 mb-4" />
            <p className="text-sm text-muted-foreground">Asset saved to library</p>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
          )}
          {step === "details" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || createAsset.isPending}>
                {createAsset.isPending ? "Saving..." : "Save Asset"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
