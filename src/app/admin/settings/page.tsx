"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  IoSaveOutline,
  IoNotificationsOutline,
  IoLockClosedOutline,
  IoColorPaletteOutline,
  IoGlobeOutline,
  IoCodeSlashOutline,
  IoMailOutline
} from "react-icons/io5";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Sean Filimon");
  const [siteDescription, setSiteDescription] = useState("Developer, Creator, Builder");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 max-w-4xl">
        {/* General Settings */}
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <IoGlobeOutline className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">General Settings</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Site Description</label>
              <input
                type="text"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Site URL</label>
              <input
                type="text"
                defaultValue="https://seanfilimon.com"
                className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button className="rounded-sm gap-2">
              <IoSaveOutline className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Email Settings */}
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <IoMailOutline className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Email Settings</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Contact Email</label>
              <input
                type="email"
                defaultValue="contact@seanfilimon.com"
                className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Newsletter Email</label>
              <input
                type="email"
                defaultValue="newsletter@seanfilimon.com"
                className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button className="rounded-sm gap-2">
              <IoSaveOutline className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <IoColorPaletteOutline className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Appearance</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <select className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Dark</option>
                <option>Light</option>
                <option>System</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  defaultValue="#6366f1"
                  className="h-10 w-20 rounded-sm border cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue="#6366f1"
                  className="flex-1 px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <Button className="rounded-sm gap-2">
              <IoSaveOutline className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <IoNotificationsOutline className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive email updates</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">New Comments</p>
                <p className="text-xs text-muted-foreground">Get notified of new comments</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly Reports</p>
                <p className="text-xs text-muted-foreground">Receive weekly analytics</p>
              </div>
              <input type="checkbox" className="h-5 w-5" />
            </div>
            <Button className="rounded-sm gap-2">
              <IoSaveOutline className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Security */}
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <IoLockClosedOutline className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Security</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 text-sm border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button className="rounded-sm gap-2">
              <IoLockClosedOutline className="h-4 w-4" />
              Update Password
            </Button>
          </div>
        </div>

        {/* API Settings */}
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <IoCodeSlashOutline className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">API Settings</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">API Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="sk_live_••••••••••••••••"
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-sm bg-muted"
                />
                <Button variant="outline" className="rounded-sm">
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">API Access</p>
                <p className="text-xs text-muted-foreground">Enable API access for third-party apps</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

