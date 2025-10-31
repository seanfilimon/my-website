"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  IoAddOutline,
  IoSearchOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoMailOutline,
  IoShieldCheckmarkOutline,
  IoPersonOutline
} from "react-icons/io5";

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    joinedAt: "Jan 15, 2024",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Editor",
    status: "Active",
    joinedAt: "Feb 20, 2024",
    lastActive: "1 day ago"
  },
  {
    id: 3,
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "Viewer",
    status: "Inactive",
    joinedAt: "Mar 10, 2024",
    lastActive: "2 weeks ago"
  },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button className="rounded-sm gap-2">
          <IoAddOutline className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Role</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Joined</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Last Active</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <IoPersonOutline className="h-5 w-5" />
                    </div>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <IoMailOutline className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm ${
                    user.role === 'Admin' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400' :
                    user.role === 'Editor' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                    'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                  }`}>
                    {user.role === 'Admin' && <IoShieldCheckmarkOutline className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-sm ${
                    user.status === 'Active' 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{user.joinedAt}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{user.lastActive}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-sm">
                      <IoCreateOutline className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-sm text-destructive">
                      <IoTrashOutline className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-2">Total Users</p>
          <p className="text-3xl font-bold">127</p>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-2">Active This Month</p>
          <p className="text-3xl font-bold">89</p>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-2">New This Week</p>
          <p className="text-3xl font-bold">12</p>
        </div>
      </div>
    </div>
  );
}

