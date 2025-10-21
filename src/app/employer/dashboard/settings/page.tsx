"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Shield, User2, Loader2, Upload, X, Image as ImageIcon, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { employerTranslations } from "@/lib/language";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CompanyLogo } from "@/components/ui/company-logo";

export default function SettingsPage() {
  const { language } = useLanguage();
  const t = employerTranslations[language];
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    companyName: "",
    companyWebsite: "",
    companyDescription: "",
  });
  
  // Logo state
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [employerId, setEmployerId] = useState<string | null>(null);

  useEffect(() => {
    loadEmployerData();
  }, [user]);

  const loadEmployerData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data: employerData, error } = await supabase
        .from("employers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (employerData) {
        setEmployerId(employerData.id);
        setFormData({
          name: employerData.name || "",
          role: employerData.company_role || "",
          companyName: employerData.company_name || "",
          companyWebsite: employerData.company_website || "",
          companyDescription: employerData.description || "",
        });
        setCurrentLogoUrl(employerData.company_logo_url);
      }
    } catch (error) {
      console.error("Error loading employer data:", error);
      toast.error(t.failedToLoadData || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t.invalidFileType || 'Please upload an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t.fileTooLarge || 'File size must be less than 10MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteCurrentLogo = async () => {
    if (!user?.id || !currentLogoUrl) return;

    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("company-logos")
        .remove([currentLogoUrl]);

      if (deleteError) throw deleteError;

      // Update database
      const { error: updateError } = await supabase
        .from("employers")
        .update({ company_logo_url: null })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setCurrentLogoUrl(null);
      toast.success(t.logoDeleted || "Logo deleted successfully");
    } catch (error) {
      console.error("Error deleting logo:", error);
      toast.error(t.failedToDeleteLogo || "Failed to delete logo");
    }
  };

  const onSave = async () => {
    if (!user?.id) {
      toast.error(t.userNotAuthenticated || "User not authenticated");
      return;
    }

    setSaving(true);
    try {
      let logoUrl = currentLogoUrl;

      // Upload new logo if selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${user.id}/company-logo.${fileExt}`;
        
        const { data: logoUpload, error: uploadError } = await supabase.storage
          .from("company-logos")
          .upload(filePath, logoFile, {
            upsert: true,
            contentType: logoFile.type
          });
        
        if (uploadError) {
          console.error("Logo upload error:", uploadError);
          toast.error(t.logoUploadError || 'Failed to upload company logo');
        } else {
          logoUrl = logoUpload.path;
          setCurrentLogoUrl(logoUrl);
          setLogoFile(null);
          setLogoPreview("");
        }
      }

      // Update employer data
      const { error: updateError } = await supabase
        .from("employers")
        .update({
          name: formData.name,
          company_role: formData.role,
          company_name: formData.companyName,
          company_website: formData.companyWebsite,
          description: formData.companyDescription,
          company_logo_url: logoUrl,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Update all opportunities with new logo
      if (logoFile && employerId) {
        await supabase
          .from("opportunities")
          .update({ company_logo_url: logoUrl })
          .eq("user_id", employerId);
      }

      toast.success(t.settingsSaved || "Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t.failedToSaveSettings || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.settingsTitle}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">{t.settingsSubtitle}</p>
      </div>

      {/* Company Logo - New Section */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <div className="text-base sm:text-lg font-semibold">{t.companyLogo || 'Company Logo'}</div>
        </div>
        
        <div className="space-y-4">
          {/* Current Logo Display */}
          {currentLogoUrl && !logoPreview && (
            <div className="flex items-center gap-4">
              <CompanyLogo 
                logoUrl={currentLogoUrl}
                companyName={formData.companyName}
                size="lg"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">{t.currentLogo || 'Current logo'}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteCurrentLogo}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X size={16} className="mr-2" />
                  {t.deleteLogo || 'Delete Logo'}
                </Button>
              </div>
            </div>
          )}

          {/* Logo Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {currentLogoUrl && !logoPreview ? (t.uploadNewLogo || 'Upload New Logo') : (t.uploadLogo || 'Upload Logo')}
            </label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : !currentLogoUrl ? (
                <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
              ) : null}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logoUpload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <Upload size={16} className="mr-2" />
                  {logoPreview ? (t.changeLogo || 'Change Logo') : (t.uploadLogo || 'Upload Logo')}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {t.logoRequirements || 'PNG, JPG or SVG. Max 10MB.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile - Mobile Optimized */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <User2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <div className="text-base sm:text-lg font-semibold">{t.profile}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={t.fullNamePlaceholderSettings} 
            className="h-10 sm:h-11" 
          />
          <Input 
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            placeholder={t.companyRolePlaceholder} 
            className="h-10 sm:h-11" 
          />
          <Input 
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder={t.companyNameSettingsPlaceholder} 
            className="h-10 sm:h-11" 
          />
          <Input 
            name="companyWebsite"
            value={formData.companyWebsite}
            onChange={handleInputChange}
            type="url" 
            placeholder={t.companyWebsitePlaceholder} 
            className="h-10 sm:h-11" 
          />
        </div>
        <div className="mt-3 sm:mt-4">
          <Textarea 
            name="companyDescription"
            value={formData.companyDescription}
            onChange={handleInputChange}
            placeholder={t.companyDescriptionPlaceholder} 
            className="min-h-[80px] sm:min-h-[100px]" 
          />
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

