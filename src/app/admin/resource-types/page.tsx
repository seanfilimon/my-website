"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  IoAddOutline,
  IoSearchOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoReorderThreeOutline,
} from "react-icons/io5";
import { toast } from "sonner";
import { trpc } from "@/src/lib/trpc/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ResourceType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  _count: {
    resources: number;
  };
}

// Sortable row component
function SortableRow({
  type,
  onEdit,
  onDelete,
}: {
  type: ResourceType;
  onEdit: (type: ResourceType) => void;
  onDelete: (type: ResourceType) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-muted/30 transition-colors">
      <td className="px-2 py-3 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <IoReorderThreeOutline className="h-5 w-5 text-muted-foreground" />
        </button>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{type.name}</p>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {type.slug}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
        {type.description || "—"}
      </td>
      <td className="px-4 py-3 text-sm">
        {type._count.resources} resources
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-sm"
            onClick={() => onEdit(type)}
          >
            <IoCreateOutline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-sm text-destructive"
            onClick={() => onDelete(type)}
            disabled={type._count.resources > 0}
            title={type._count.resources > 0 ? "Cannot delete type with resources" : "Delete type"}
          >
            <IoTrashOutline className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminResourceTypesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // tRPC
  const utils = trpc.useUtils();
  const { data: resourceTypes, isLoading } = trpc.resource.listTypes.useQuery();

  const createType = trpc.resource.createType.useMutation({
    onSuccess: () => {
      toast.success("Resource type created!");
      utils.resource.listTypes.invalidate();
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create type");
    },
  });

  const updateType = trpc.resource.updateType.useMutation({
    onSuccess: () => {
      toast.success("Resource type updated!");
      utils.resource.listTypes.invalidate();
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update type");
    },
  });

  const deleteType = trpc.resource.deleteType.useMutation({
    onSuccess: () => {
      toast.success("Resource type deleted!");
      utils.resource.listTypes.invalidate();
      setDeleteDialogOpen(false);
      setSelectedType(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete type");
    },
  });

  const reorderTypes = trpc.resource.reorderTypes.useMutation({
    onSuccess: () => {
      utils.resource.listTypes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder types");
    },
  });

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setSelectedType(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEditDialog = (type: ResourceType) => {
    setSelectedType(type);
    setFormName(type.name);
    setFormDescription(type.description || "");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (type: ResourceType) => {
    setSelectedType(type);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    createType.mutate({
      name: formName.trim(),
      description: formDescription.trim() || undefined,
    });
  };

  const handleUpdate = () => {
    if (!selectedType || !formName.trim()) {
      toast.error("Name is required");
      return;
    }
    updateType.mutate({
      id: selectedType.id,
      name: formName.trim(),
      description: formDescription.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedType) return;
    deleteType.mutate({ id: selectedType.id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !resourceTypes) return;

    const oldIndex = resourceTypes.findIndex((t) => t.id === active.id);
    const newIndex = resourceTypes.findIndex((t) => t.id === over.id);
    
    const reordered = arrayMove(resourceTypes, oldIndex, newIndex);
    const items = reordered.map((item, index) => ({ id: item.id, order: index }));
    
    reorderTypes.mutate({ items });
  };

  // Filter types by search query
  const filteredTypes = resourceTypes?.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resource Types</h1>
          <p className="text-muted-foreground">
            Manage resource types like Framework, Library, Language, Tool. Drag to reorder.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-sm gap-2">
          <IoAddOutline className="h-4 w-4" />
          Add Type
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="w-10"></th>
                <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Description</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Resources</th>
                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {searchQuery ? "No types found matching your search" : "No resource types yet. Create one to get started."}
                  </td>
                </tr>
              ) : (
                <SortableContext
                  items={filteredTypes.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTypes.map((type) => (
                    <SortableRow
                      key={type.id}
                      type={type}
                      onEdit={openEditDialog}
                      onDelete={openDeleteDialog}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
          </table>
        </div>
      </DndContext>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Resource Type</DialogTitle>
            <DialogDescription>
              Add a new type like Framework, Library, Language, or Tool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="createName">Name*</Label>
              <Input
                id="createName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Framework"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="createDescription">Description</Label>
              <Textarea
                id="createDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Software frameworks and development platforms..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createType.isPending}>
              {createType.isPending ? "Creating..." : "Create Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resource Type</DialogTitle>
            <DialogDescription>
              Update the resource type details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="editName">Name*</Label>
              <Input
                id="editName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Framework"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Software frameworks and development platforms..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateType.isPending}>
              {updateType.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource Type?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedType?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteType.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
