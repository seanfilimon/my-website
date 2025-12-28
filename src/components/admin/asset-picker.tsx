"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  IoSearchOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoVideocamOutline,
  IoDocumentOutline,
  IoMusicalNotesOutline,
  IoCloseOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { trpc } from "@/src/lib/trpc/client";
import { AssetType, AssetCategory } from "@/src/lib/admin/types";
import { cn } from "@/src/lib/utils";
import { AssetUploadDialog } from "./asset-upload-dialog";

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Get icon for asset type
function getAssetTypeIcon(type: AssetType) {
  switch (type) {
    case "IMAGE":
      return IoImageOutline;
    case "VIDEO":
      return IoVideocamOutline;
    case "DOCUMENT":
      return IoDocumentOutline;
    case "AUDIO":
      return IoMusicalNotesOutline;
    default:
      return IoDocumentOutline;
  }
}

interface AssetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string, asset?: { id: string; name: string; alt?: string | null }) => void;
  /** Filter by asset type */
  filterType?: AssetType;
  /** Filter by category */
  filterCategory?: AssetCategory;
  /** Title for the dialog */
  title?: string;
  /** Description for the dialog */
  description?: string;
}

export function AssetPicker({
  open,
  onOpenChange,
  onSelect,
  filterType,
  filterCategory,
  title = "Select Asset",
  description = "Choose an existing asset or upload a new one.",
}: AssetPickerProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "ALL">(filterType || "ALL");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "ALL">(filterCategory || "ALL");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Fetch assets
  const { data: assetsData, isLoading, refetch } = trpc.asset.list.useQuery({
    type: typeFilter === "ALL" ? undefined : typeFilter,
    category: categoryFilter === "ALL" ? undefined : categoryFilter,
    search: search || undefined,
    limit: 100,
  });

  const assets = assetsData?.assets || [];

  const handleSelect = useCallback(() => {
    if (selectedAsset) {
      onSelect(selectedAsset.url, {
        id: selectedAsset.id,
        name: selectedAsset.name,
        alt: selectedAsset.alt,
      });
      setSelectedAsset(null);
      onOpenChange(false);
    }
  }, [selectedAsset, onSelect, onOpenChange]);

  const handleAssetClick = useCallback((asset: any) => {
    setSelectedAsset(asset.id === selectedAsset?.id ? null : asset);
  }, [selectedAsset]);

  const handleUploadSuccess = useCallback(() => {
    refetch();
    setUploadDialogOpen(false);
  }, [refetch]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {/* Filters */}
          <div className="flex items-center gap-3 py-2">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-6"
                  onClick={() => setSearch("")}
                >
                  <IoCloseOutline className="size-4" />
                </Button>
              )}
            </div>

            {!filterType && (
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AssetType | "ALL")}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="IMAGE">Images</SelectItem>
                  <SelectItem value="VIDEO">Videos</SelectItem>
                  <SelectItem value="DOCUMENT">Documents</SelectItem>
                  <SelectItem value="AUDIO">Audio</SelectItem>
                </SelectContent>
              </Select>
            )}

            {!filterCategory && (
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AssetCategory | "ALL")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="THUMBNAIL">Thumbnails</SelectItem>
                  <SelectItem value="COVER_IMAGE">Cover Images</SelectItem>
                  <SelectItem value="AVATAR">Avatars</SelectItem>
                  <SelectItem value="ICON">Icons</SelectItem>
                  <SelectItem value="GALLERY">Gallery</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button variant="outline" size="sm" onClick={() => setUploadDialogOpen(true)}>
              <IoCloudUploadOutline className="size-4 mr-2" />
              Upload New
            </Button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Loading assets...</p>
                </div>
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <IoImageOutline className="size-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">No assets found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || typeFilter !== "ALL" || categoryFilter !== "ALL"
                    ? "Try adjusting your filters"
                    : "Upload your first asset to get started"}
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <IoCloudUploadOutline className="size-4 mr-2" />
                  Upload Asset
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {assets.map((asset) => {
                  const TypeIcon = getAssetTypeIcon(asset.type as AssetType);
                  const isImage = asset.type === "IMAGE";
                  const isSelected = selectedAsset?.id === asset.id;

                  return (
                    <button
                      key={asset.id}
                      onClick={() => handleAssetClick(asset)}
                      className={cn(
                        "relative rounded-lg border overflow-hidden text-left transition-all",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {/* Preview */}
                      <div className="aspect-square relative bg-muted">
                        {isImage ? (
                          <Image
                            src={asset.url}
                            alt={asset.name}
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <TypeIcon className="size-8 text-muted-foreground" />
                          </div>
                        )}

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="size-8 rounded-full bg-primary flex items-center justify-center">
                              <IoCheckmarkOutline className="size-5 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <p className="text-xs font-medium truncate" title={asset.name}>
                          {asset.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(asset.size)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {selectedAsset ? (
                  <span>Selected: <strong>{selectedAsset.name}</strong></span>
                ) : (
                  <span>{assets.length} assets available</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSelect} disabled={!selectedAsset}>
                  Select Asset
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <AssetUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleUploadSuccess}
        defaultCategory={filterCategory || "OTHER"}
      />
    </>
  );
}
