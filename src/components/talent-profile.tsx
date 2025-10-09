"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  MapPin, 
  Briefcase, 
  Mail, 
  Calendar,
  Edit2,
  Save,
  X,
  Upload,
  FileText,
  Building2,
  Globe,
  Phone,
  Loader2,
  Check
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Constants for onboarding preferences
const INDUSTRIES = [
  "Technology",
  "Finance", 
  "Healthcare",
  "Marketing",
  "Design",
  "Consulting",
  "Education",
  "Non-profit",
  "Media",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Energy",
  "Transportation",
] as const;

const WORK_STYLES = [
  { id: "full-time", label: "Full-time Jobs" },
  { id: "internships", label: "Internships" },
  { id: "bootcamps", label: "Bootcamps" },
  { id: "hackathons", label: "Hackathons" },
] as const;

interface TalentProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  bio: string;
  work_style_pref: string[];
  industry_pref: string[];
  location_pref: string;
  resume_url?: string;
  skills?: string[];
  is_onboarded?: boolean;
  embedding?: any;
  created_at: string;
}

export default function TalentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TalentProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("talents")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        return;
      }

      setProfile(data);
      setEditForm(data);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ ...profile });
  };

  const handleSave = async () => {
    if (!user?.id || !profile) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("talents")
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio,
          location_pref: editForm.location_pref,
          work_style_pref: editForm.work_style_pref,
          industry_pref: editForm.industry_pref,
          skills: editForm.skills,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        return;
      }

      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof TalentProfile, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof TalentProfile, value: string[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleIndustry = (industry: string) => {
    const currentIndustries = editForm.industry_pref || [];
    const isSelected = currentIndustries.includes(industry);
    
    if (isSelected) {
      handleArrayChange('industry_pref', currentIndustries.filter(i => i !== industry));
    } else if (currentIndustries.length < 3) {
      handleArrayChange('industry_pref', [...currentIndustries, industry]);
    }
  };

  const toggleWorkStyle = (workStyleId: string) => {
    const currentWorkStyles = editForm.work_style_pref || [];
    const isSelected = currentWorkStyles.includes(workStyleId);
    
    if (isSelected) {
      handleArrayChange('work_style_pref', currentWorkStyles.filter(w => w !== workStyleId));
    } else {
      handleArrayChange('work_style_pref', [...currentWorkStyles, workStyleId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
        <p className="text-gray-600">We couldn't find your profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your professional information</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2 w-full sm:w-auto">
            <Edit2 size={16} />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header Card */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={32} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={editForm.full_name || ""}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    className="text-xl font-semibold mb-2"
                    placeholder="Your full name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 truncate">{profile.full_name}</h2>
                )}
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Mail size={16} className="flex-shrink-0" />
                  <span className="text-sm truncate">{profile.email}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* About Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            {isEditing ? (
              <Textarea
                value={editForm.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself, your skills, and career goals..."
                className="min-h-32"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">
                {profile.bio || "No bio provided yet."}
              </p>
            )}
          </Card>

          {/* Preferences Card - Full Width */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-6">

              {/* Work Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Style Preferences
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Select the types of opportunities you're interested in:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {WORK_STYLES.map((workStyle) => {
                        const isSelected = editForm.work_style_pref?.includes(workStyle.id) || false;
                        return (
                          <button
                            key={workStyle.id}
                            type="button"
                            onClick={() => toggleWorkStyle(workStyle.id)}
                            className={`p-2.5 text-sm border rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{workStyle.label}</span>
                              {isSelected && <Check size={16} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.work_style_pref?.map((styleId, index) => {
                      const workStyle = WORK_STYLES.find(w => w.id === styleId);
                      return (
                    <span 
                      key={index}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                          {workStyle?.label || styleId}
                    </span>
                      );
                    })}
                </div>
                )}
              </div>

              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Preferences
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Select up to 3 industries that interest you most:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {INDUSTRIES.map((industry) => {
                        const isSelected = editForm.industry_pref?.includes(industry) || false;
                        const isDisabled = !isSelected && (editForm.industry_pref?.length || 0) >= 3;
                        return (
                          <button
                            key={industry}
                            type="button"
                            onClick={() => toggleIndustry(industry)}
                            disabled={isDisabled}
                            className={`p-2.5 text-xs border rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary'
                                : isDisabled
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{industry}</span>
                              {isSelected && <Check size={14} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                  {profile.industry_pref?.map((industry, index) => (
                    <span 
                      key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
                )}
              </div>
            </div>
          </Card>

          {/* Location & Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Preference</h3>
              {isEditing ? (
                <Input
                  value={editForm.location_pref || ""}
                  onChange={(e) => handleInputChange("location_pref", e.target.value)}
                  placeholder="e.g., Riyadh, Jeddah, Remote"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span className="text-sm">
                    {profile.location_pref || "Not specified"}
                  </span>
                </div>
              )}
            </Card>

            {/* Account Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Account</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="flex-shrink-0" />
                <span className="text-sm">Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Resume */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
            {profile.resume_url ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <FileText className="text-green-600 flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800">Resume Uploaded</p>
                    <p className="text-xs text-green-600 truncate">Last updated: {new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload size={14} className="mr-2" />
                  Update Resume
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">No resume uploaded</p>
                <Button size="sm" className="w-full">
                  <Upload size={14} className="mr-2" />
                  Upload Resume
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}