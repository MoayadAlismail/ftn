"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  MapPin, 
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
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  phone?: string;
  linkedin_url?: string;
  website_url?: string;
  created_at: string;
  updated_at?: string;
}

export default function TalentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TalentProfile>>({});

  const fetchProfile = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
          phone: editForm.phone,
          linkedin_url: editForm.linkedin_url,
          website_url: editForm.website_url,
          updated_at: new Date().toISOString(),
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
        <p className="text-gray-600">We couldn&apos;t find your profile information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600 mt-1">Manage your professional information</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit2 size={16} />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
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
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={32} className="text-primary" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      value={editForm.full_name || ""}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      className="text-xl font-semibold mb-2"
                      placeholder="Your full name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                {isEditing ? (
                  <Textarea
                    value={editForm.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself, your skills, and career goals..."
                    className="min-h-32"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile.bio || "No bio provided yet."}
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} />
                        <span>{profile.phone || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn Profile
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.linkedin_url || ""}
                        onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 size={16} />
                        {profile.linkedin_url ? (
                          <a 
                            href={profile.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View LinkedIn
                          </a>
                        ) : (
                          <span>Not provided</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Website
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.website_url || ""}
                    onChange={(e) => handleInputChange("website_url", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe size={16} />
                    {profile.website_url ? (
                      <a 
                        href={profile.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    ) : (
                      <span>Not provided</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preferences Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Preference
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.location_pref || ""}
                    onChange={(e) => handleInputChange("location_pref", e.target.value)}
                    placeholder="e.g., San Francisco, CA or Remote"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{profile.location_pref}</span>
                  </div>
                )}
              </div>

              {/* Work Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.work_style_pref?.map((style, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Preferences
                </label>
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
              </div>
            </div>
          </Card>

          {/* Resume Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
            {profile.resume_url ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <FileText className="text-green-600" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Resume Uploaded</p>
                    <p className="text-xs text-green-600">Last updated: {new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload size={16} className="mr-2" />
                  Update Resume
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-3">No resume uploaded</p>
                <Button size="sm" className="w-full">
                  <Upload size={16} className="mr-2" />
                  Upload Resume
                </Button>
              </div>
            )}
          </Card>

          {/* Account Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              {profile.updated_at && (
                <div className="flex items-center gap-2">
                  <Edit2 size={16} />
                  <span>Last updated {new Date(profile.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}