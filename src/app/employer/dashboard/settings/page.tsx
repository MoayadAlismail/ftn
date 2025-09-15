"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Shield, User2, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 900);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your profile, notifications, and security.</p>
      </div>

      {/* Profile - Mobile Optimized */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <User2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <div className="text-base sm:text-lg font-semibold">Profile</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input placeholder="Full name" className="h-10 sm:h-11" />
          <Input placeholder="Company role" className="h-10 sm:h-11" />
          <Input placeholder="Company name" className="h-10 sm:h-11" />
          <Input type="url" placeholder="Company website" className="h-10 sm:h-11" />
        </div>
        <div className="mt-3 sm:mt-4">
          <Textarea placeholder="Company description" className="min-h-[80px] sm:min-h-[100px]" />
        </div>
        <div className="mt-3 sm:mt-4 flex justify-end">
          <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </Card>

      {/* Notifications - Mobile Optimized */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <div className="text-base sm:text-lg font-semibold">Notifications</div>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-gray-700">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            Email me when candidates apply to my opportunity
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" />
            Product updates and tips
          </label>
        </div>
      </Card>

      {/* Security - Mobile Optimized */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <div className="text-base sm:text-lg font-semibold">Security</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input type="password" placeholder="New password" className="h-10 sm:h-11" />
          <Input type="password" placeholder="Confirm password" className="h-10 sm:h-11" />
        </div>
        <div className="mt-3 sm:mt-4 flex justify-end">
          <Button variant="outline" className="w-full sm:w-auto">Update password</Button>
        </div>
      </Card>
    </div>
  );
}

