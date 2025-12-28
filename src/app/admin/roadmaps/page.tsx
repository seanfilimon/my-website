"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoAddOutline,
  IoSearchOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoEyeOutline
} from "react-icons/io5";

const mockRoadmaps = [
  { id: 1, name: "Next.js Learning Path", resource: "Next.js", steps: 15, status: "Published", updatedAt: "2 days ago" },
  { id: 2, name: "React Mastery Roadmap", resource: "React", steps: 12, status: "Published", updatedAt: "1 week ago" },
  { id: 3, name: "TypeScript Fundamentals", resource: "TypeScript", steps: 10, status: "Draft", updatedAt: "3 days ago" },
];

export default function AdminRoadmapsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Roadmaps</h1>
          <p className="text-muted-foreground">Manage learning paths and roadmaps</p>
        </div>
        <Button asChild className="rounded-sm gap-2">
          <Link href="/admin/roadmaps/new">
            <IoAddOutline className="h-4 w-4" />
            New Roadmap
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search roadmaps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Roadmap Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Resource</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Steps</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Updated</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockRoadmaps.map((roadmap) => (
              <tr key={roadmap.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><p className="font-medium">{roadmap.name}</p></td>
                <td className="px-4 py-3 text-sm">{roadmap.resource}</td>
                <td className="px-4 py-3 text-sm">{roadmap.steps} steps</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-sm ${roadmap.status === 'Published' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}`}>
                    {roadmap.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{roadmap.updatedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-sm"><IoEyeOutline className="h-4 w-4" /></Button>
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


