"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Shield, User2, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { employerTranslations } from "@/lib/language";

export default function SettingsPage() {
  const { language } = useLanguage();
  const t = employerTranslations[language];
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 900);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.settingsTitle}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">{t.settingsSubtitle}</p>
      </div>

      {/* Profile - Mobile Optimized */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <User2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <div className="text-base sm:text-lg font-semibold">{t.profile}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input placeholder={t.fullNamePlaceholderSettings} className="h-10 sm:h-11" />
          <Input placeholder={t.companyRolePlaceholder} className="h-10 sm:h-11" />
          <Input placeholder={t.companyNameSettingsPlaceholder} className="h-10 sm:h-11" />
          <Input type="url" placeholder={t.companyWebsitePlaceholder} className="h-10 sm:h-11" />
        </div>
        <div className="mt-3 sm:mt-4">
          <Textarea placeholder={t.companyDescriptionPlaceholder} className="min-h-[80px] sm:min-h-[100px]" />
        </div>
        <div className="mt-3 sm:mt-4 flex justify-end">
          <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.saveChanges}
          </Button>
        </div>
      </Card>

      {/* Notifications - Mobile Optimized */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <div className="text-base sm:text-lg font-semibold">{t.notifications}</div>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-gray-700">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            {t.emailMeWhenCandidatesApply}
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" />
            {t.productUpdatesAndTips}
          </label>
        </div>
      </Card>

      {/* Security - Mobile Optimized */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <div className="text-base sm:text-lg font-semibold">{t.security}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input type="password" placeholder={t.newPasswordPlaceholder} className="h-10 sm:h-11" />
          <Input type="password" placeholder={t.confirmPasswordPlaceholder} className="h-10 sm:h-11" />
        </div>
        <div className="mt-3 sm:mt-4 flex justify-end">
          <Button variant="outline" className="w-full sm:w-auto">{t.updatePassword}</Button>
        </div>
      </Card>
    </div>
  );
}

