"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IoAddOutline, IoSearchOutline, IoCreateOutline, IoTrashOutline } from "react-icons/io5";

const mockCategories = [
  { id: 1, name: "Tutorial", slug: "tutorial", count: 28, color: "#3B82F6" },
  { id: 2, name: "Guide", slug: "guide", count: 15, color: "#10B981" },
  { id: 3, name: "Performance", slug: "performance", count: 12, color: "#F59E0B" },
  { id: 4, name: "Advanced", slug: "advanced", count: 8, color: "#8B5CF6" },
];

export default function AdminCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">Manage content categories</p>
        </div>
        <Button className="rounded-sm gap-2">
          <IoAddOutline className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="relative max-w-md">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Slug</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Color</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Content Count</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockCategories.map((category) => (
              <tr key={category.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><p className="font-medium">{category.name}</p></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">/{category.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded" style={{ backgroundColor: category.color }} />
                    <span className="text-sm">{category.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{category.count} items</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-sm"><IoCreateOutline className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="rounded-sm text-destructive"><IoTrashOutline className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

