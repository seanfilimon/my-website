"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  IoLayersOutline,
  IoDocumentTextOutline,
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

interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  order: number;
  _count: {
    resources: number;
  };
}

interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  order: number;
  _count: {
    articles: number;
    blogs: number;
  };
}

// Sortable row component for Resource Categories
function SortableResourceRow({
  category,
  onEdit,
  onDelete,
}: {
  category: ResourceCategory;
  onEdit: (category: ResourceCategory) => void;
  onDelete: (category: ResourceCategory) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

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
      <td className="px-4 py-3 font-medium">{category.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{category.slug}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: category.color || "#6366f1" }} />
          <span className="text-sm text-muted-foreground">{category.color || "#6366f1"}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
        {category.description || "—"}
      </td>
      <td className="px-4 py-3 text-sm">{category._count.resources}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
            <IoCreateOutline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(category)}
            disabled={category._count.resources > 0}
          >
            <IoTrashOutline className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Sortable row component for Content Categories
function SortableContentRow({
  category,
  onEdit,
  onDelete,
}: {
  category: ContentCategory;
  onEdit: (category: ContentCategory) => void;
  onDelete: (category: ContentCategory) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemCount = category._count.articles + category._count.blogs;

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
      <td className="px-4 py-3 font-medium">{category.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{category.slug}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: category.color || "#6366f1" }} />
          <span className="text-sm text-muted-foreground">{category.color || "#6366f1"}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
        {category.description || "—"}
      </td>
      <td className="px-4 py-3 text-sm">{itemCount} items</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
            <IoCreateOutline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(category)}
            disabled={itemCount > 0}
          >
            <IoTrashOutline className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<"resource" | "content">("resource");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | ContentCategory | null>(null);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("#6366f1");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // tRPC
  const utils = trpc.useUtils();
  
  // Resource Categories
  const { data: resourceCategories, isLoading: resourceLoading } = trpc.resource.listCategories.useQuery();
  const createResourceCategory = trpc.resource.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Resource category created!");
      utils.resource.listCategories.invalidate();
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message || "Failed to create category"),
  });
  const updateResourceCategory = trpc.resource.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Resource category updated!");
      utils.resource.listCategories.invalidate();
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message || "Failed to update category"),
  });
  const deleteResourceCategory = trpc.resource.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Resource category deleted!");
      utils.resource.listCategories.invalidate();
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => toast.error(error.message || "Failed to delete category"),
  });
  const reorderResourceCategories = trpc.resource.reorderCategories.useMutation({
    onSuccess: () => {
      utils.resource.listCategories.invalidate();
    },
    onError: (error) => toast.error(error.message || "Failed to reorder categories"),
  });

  // Content Categories
  const { data: contentCategories, isLoading: contentLoading } = trpc.resource.listContentCategories.useQuery();
  const createContentCategory = trpc.resource.createContentCategory.useMutation({
    onSuccess: () => {
      toast.success("Content category created!");
      utils.resource.listContentCategories.invalidate();
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message || "Failed to create category"),
  });
  const updateContentCategory = trpc.resource.updateContentCategory.useMutation({
    onSuccess: () => {
      toast.success("Content category updated!");
      utils.resource.listContentCategories.invalidate();
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message || "Failed to update category"),
  });
  const deleteContentCategory = trpc.resource.deleteContentCategory.useMutation({
    onSuccess: () => {
      toast.success("Content category deleted!");
      utils.resource.listContentCategories.invalidate();
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => toast.error(error.message || "Failed to delete category"),
  });
  const reorderContentCategories = trpc.resource.reorderContentCategories.useMutation({
    onSuccess: () => {
      utils.resource.listContentCategories.invalidate();
    },
    onError: (error) => toast.error(error.message || "Failed to reorder categories"),
  });

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormColor("#6366f1");
    setSelectedCategory(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEditDialog = (category: ResourceCategory | ContentCategory) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || "");
    setFormColor(category.color || "#6366f1");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: ResourceCategory | ContentCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    const data = {
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      color: formColor,
    };
    if (activeTab === "resource") {
      createResourceCategory.mutate(data);
    } else {
      createContentCategory.mutate(data);
    }
  };

  const handleUpdate = () => {
    if (!selectedCategory || !formName.trim()) {
      toast.error("Name is required");
      return;
    }
    const data = {
      id: selectedCategory.id,
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      color: formColor,
    };
    if (activeTab === "resource") {
      updateResourceCategory.mutate(data);
    } else {
      updateContentCategory.mutate(data);
    }
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    if (activeTab === "resource") {
      deleteResourceCategory.mutate({ id: selectedCategory.id });
    } else {
      deleteContentCategory.mutate({ id: selectedCategory.id });
    }
  };

  // Handle drag end for resource categories
  const handleResourceDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !resourceCategories) return;

    const oldIndex = resourceCategories.findIndex((c) => c.id === active.id);
    const newIndex = resourceCategories.findIndex((c) => c.id === over.id);
    
    const reordered = arrayMove(resourceCategories, oldIndex, newIndex);
    const items = reordered.map((item, index) => ({ id: item.id, order: index }));
    
    reorderResourceCategories.mutate({ items });
  };

  // Handle drag end for content categories
  const handleContentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !contentCategories) return;

    const oldIndex = contentCategories.findIndex((c) => c.id === active.id);
    const newIndex = contentCategories.findIndex((c) => c.id === over.id);
    
    const reordered = arrayMove(contentCategories, oldIndex, newIndex);
    const items = reordered.map((item, index) => ({ id: item.id, order: index }));
    
    reorderContentCategories.mutate({ items });
  };

  // Filter categories by search query
  const filteredResourceCategories = resourceCategories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredContentCategories = contentCategories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isPending = activeTab === "resource" 
    ? createResourceCategory.isPending || updateResourceCategory.isPending || deleteResourceCategory.isPending
    : createContentCategory.isPending || updateContentCategory.isPending || deleteContentCategory.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage resource and content categories. Drag to reorder.
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm" className="gap-2">
          <IoAddOutline className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "resource" | "content")}>
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="resource" className="gap-2">
              <IoLayersOutline className="h-4 w-4" />
              Resource Categories
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <IoDocumentTextOutline className="h-4 w-4" />
              Content Categories
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative w-64">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Resource Categories Tab */}
        <TabsContent value="resource" className="mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleResourceDragEnd}
          >
            <div className="border rounded-lg overflow-hidden bg-card">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="w-10"></th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Slug</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Color</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Description</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Resources</th>
                    <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {resourceLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredResourceCategories.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        {searchQuery ? "No categories found" : "No resource categories yet"}
                      </td>
                    </tr>
                  ) : (
                    <SortableContext
                      items={filteredResourceCategories.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredResourceCategories.map((category) => (
                        <SortableResourceRow
                          key={category.id}
                          category={category}
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
        </TabsContent>

        {/* Content Categories Tab */}
        <TabsContent value="content" className="mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleContentDragEnd}
          >
            <div className="border rounded-lg overflow-hidden bg-card">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="w-10"></th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Slug</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Color</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Description</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Content</th>
                    <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contentLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredContentCategories.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        {searchQuery ? "No categories found" : "No content categories yet"}
                      </td>
                    </tr>
                  ) : (
                    <SortableContext
                      items={filteredContentCategories.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredContentCategories.map((category) => (
                        <SortableContentRow
                          key={category.id}
                          category={category}
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
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create {activeTab === "resource" ? "Resource" : "Content"} Category
            </DialogTitle>
            <DialogDescription>
              {activeTab === "resource" 
                ? "Add a category like Frontend, Backend, or DevOps for organizing resources."
                : "Add a category like Tutorial, Guide, or Reference for organizing content."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="createName">Name*</Label>
              <Input
                id="createName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={activeTab === "resource" ? "Frontend" : "Tutorial"}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="createDescription">Description</Label>
              <Textarea
                id="createDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={activeTab === "resource" ? "Frontend development technologies..." : "Step-by-step learning content..."}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="createColor">Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="createColor"
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="editName">Name*</Label>
              <Input
                id="editName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editColor">Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="editColor"
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
