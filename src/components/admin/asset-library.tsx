"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IoSearchOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoVideocamOutline,
  IoDocumentOutline,
  IoMusicalNotesOutline,
  IoEllipsisVertical,
  IoCopyOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoGridOutline,
  IoListOutline,
} from "react-icons/io5";
import { trpc } from "@/src/lib/trpc/client";
import { AssetType, AssetCategory } from "@/src/lib/admin/types";
import { cn } from "@/src/lib/utils";
import { AssetUploadDialog } from "./asset-upload-dialog";

type ViewMode = "grid" | "table";

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

// Asset type colors
const typeColors: Record<AssetType, string> = {
  IMAGE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  VIDEO: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  DOCUMENT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  AUDIO: "bg-green-500/10 text-green-500 border-green-500/20",
  OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

interface AssetCardProps {
  asset: {
    id: string;
    name: string;
    title?: string | null;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    type: AssetType;
    category: AssetCategory;
    createdAt: Date;
  };
  onEdit: () => void;
  onDelete: () => void;
  onCopyUrl: () => void;
}

function AssetCard({ asset, onEdit, onDelete, onCopyUrl }: AssetCardProps) {
  const TypeIcon = getAssetTypeIcon(asset.type);
  const isImage = asset.type === "IMAGE";

  return (
    <div className="group relative rounded-lg border bg-card overflow-hidden hover:border-primary/50 transition-colors">
      {/* Preview */}
      <div className="aspect-square relative bg-muted">
        {isImage ? (
          <Image
            src={asset.url}
            alt={asset.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <TypeIcon className="size-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <IoPencilOutline className="size-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={onCopyUrl}>
            <IoCopyOutline className="size-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <IoTrashOutline className="size-4" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate" title={asset.name}>
              {asset.name}
            </p>
            <p className="text-xs text-muted-foreground truncate" title={asset.filename}>
              {asset.filename}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <IoEllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <IoPencilOutline className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyUrl}>
                <IoCopyOutline className="size-4 mr-2" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <IoTrashOutline className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", typeColors[asset.type])}>
            {asset.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(asset.size)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface EditAssetDialogProps {
  asset: {
    id: string;
    name: string;
    title?: string | null;
    alt?: string | null;
    caption?: string | null;
    category: AssetCategory;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; title?: string; alt?: string; caption?: string; category: AssetCategory }) => void;
  isSaving: boolean;
}

function EditAssetDialog({ asset, open, onOpenChange, onSave, isSaving }: EditAssetDialogProps) {
  const [name, setName] = useState(asset?.name || "");
  const [title, setTitle] = useState(asset?.title || "");
  const [alt, setAlt] = useState(asset?.alt || "");
  const [caption, setCaption] = useState(asset?.caption || "");
  const [category, setCategory] = useState<AssetCategory>(asset?.category || "OTHER");

  // Reset form when asset changes
  useState(() => {
    if (asset) {
      setName(asset.name);
      setTitle(asset.title || "");
      setAlt(asset.alt || "");
      setCaption(asset.caption || "");
      setCategory(asset.category);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, title, alt, caption, category });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Update the asset metadata and details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Asset name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="SEO title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Image alt text for accessibility"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Image caption"
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !name.trim()}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssetLibrary() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [deletingAsset, setDeletingAsset] = useState<any>(null);

  // Fetch assets
  const { data: assetsData, isLoading, refetch } = trpc.asset.list.useQuery({
    type: typeFilter === "ALL" ? undefined : typeFilter,
    category: categoryFilter === "ALL" ? undefined : categoryFilter,
    search: search || undefined,
    limit: 100,
  });

  const assets = assetsData?.assets || [];

  // Mutations
  const updateAsset = trpc.asset.update.useMutation({
    onSuccess: () => {
      toast.success("Asset updated");
      setEditingAsset(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update asset");
    },
  });

  const deleteAsset = trpc.asset.delete.useMutation({
    onSuccess: () => {
      toast.success("Asset deleted");
      setDeletingAsset(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete asset");
    },
  });

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  }, []);

  const handleEdit = useCallback((asset: any) => {
    setEditingAsset(asset);
  }, []);

  const handleDelete = useCallback((asset: any) => {
    setDeletingAsset(asset);
  }, []);

  const handleSaveEdit = useCallback((data: any) => {
    if (!editingAsset) return;
    updateAsset.mutate({ id: editingAsset.id, ...data });
  }, [editingAsset, updateAsset]);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingAsset) return;
    deleteAsset.mutate({ id: deletingAsset.id });
  }, [deletingAsset, deleteAsset]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm shrink-0 z-40">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Asset Library</h1>
            <Badge variant="secondary">{assets.length} assets</Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <IoGridOutline className="size-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("table")}
              >
                <IoListOutline className="size-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <IoRefreshOutline className="size-4" />
            </Button>
            <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
              <IoCloudUploadOutline className="size-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b px-6 py-3 flex items-center gap-4 bg-muted/30">
        <div className="relative flex-1 max-w-sm">
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
        
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AssetType | "ALL")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="IMAGE">Images</SelectItem>
            <SelectItem value="VIDEO">Videos</SelectItem>
            <SelectItem value="DOCUMENT">Documents</SelectItem>
            <SelectItem value="AUDIO">Audio</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AssetCategory | "ALL")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="THUMBNAIL">Thumbnails</SelectItem>
            <SelectItem value="COVER_IMAGE">Cover Images</SelectItem>
            <SelectItem value="AVATAR">Avatars</SelectItem>
            <SelectItem value="ICON">Icons</SelectItem>
            <SelectItem value="GALLERY">Gallery</SelectItem>
            <SelectItem value="ATTACHMENT">Attachments</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading assets...</p>
            </div>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
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
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset as any}
                onEdit={() => handleEdit(asset)}
                onDelete={() => handleDelete(asset)}
                onCopyUrl={() => handleCopyUrl(asset.url)}
              />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => {
                  const TypeIcon = getAssetTypeIcon(asset.type as AssetType);
                  const isImage = asset.type === "IMAGE";
                  
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="size-10 rounded overflow-hidden bg-muted relative">
                          {isImage ? (
                            <Image
                              src={asset.url}
                              alt={asset.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <TypeIcon className="size-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[200px]" title={asset.name}>
                            {asset.name}
                          </p>
                          {asset.title && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {asset.title}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate max-w-[150px]" title={asset.filename}>
                          {asset.filename}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", typeColors[asset.type as AssetType])}>
                          {asset.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {asset.category.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(asset.size)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(asset.createdAt), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleEdit(asset)}
                          >
                            <IoPencilOutline className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleCopyUrl(asset.url)}
                          >
                            <IoCopyOutline className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(asset)}
                          >
                            <IoTrashOutline className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <AssetUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => {
          refetch();
          setUploadDialogOpen(false);
        }}
      />

      {/* Edit Dialog */}
      <EditAssetDialog
        asset={editingAsset}
        open={!!editingAsset}
        onOpenChange={(open) => !open && setEditingAsset(null)}
        onSave={handleSaveEdit}
        isSaving={updateAsset.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAsset} onOpenChange={(open) => !open && setDeletingAsset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingAsset?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAsset.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
