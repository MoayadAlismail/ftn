"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    User,
    Mail,
    MapPin,
    Briefcase,
    Download,
    ExternalLink,
    Heart,
    HeartOff,
    FileText,
    Calendar,
    Building2,
    GraduationCap
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CandidateProfile {
    id: string;
    full_name: string;
    email: string;
    bio: string;
    location_pref: string[];
    industry_pref: string[];
    work_style_pref: string[];
    resume_url?: string;
    created_at: string;
    // Additional computed fields
    isSaved?: boolean;
    skills?: string[];
    experience?: string;
    education?: string;
}

interface CandidateProfileModalProps {
    candidate: Partial<CandidateProfile>;
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSave?: (candidateId: string) => void;
    onUnsave?: (candidateId: string) => void;
}

export default function CandidateProfileModal({
    candidate,
    trigger,
    isOpen,
    onOpenChange,
    onSave,
    onUnsave
}: CandidateProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [fullProfile, setFullProfile] = useState<CandidateProfile | null>(null);
    const [isSaved, setIsSaved] = useState(candidate.isSaved || false);
    const [resumeDownloading, setResumeDownloading] = useState(false);

    useEffect(() => {
        if (isOpen && candidate.id) {
            loadFullProfile();
            checkSavedStatus();
        }
    }, [isOpen, candidate.id]);

    const loadFullProfile = async () => {
        if (!candidate.id) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('talents')
                .select(`
          *,
          user_id
        `)
                .eq('id', candidate.id)
                .single();

            if (error) {
                console.error('Error loading profile:', error);
                toast.error('Failed to load full profile');
                return;
            }

            setFullProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const checkSavedStatus = async () => {
        if (!candidate.id) return;

        try {
            const { data: userData } = await supabase.auth.getUser();
            const employerId = userData.user?.id;

            if (!employerId) return;

            const { data, error } = await supabase
                .from('saved_candidates')
                .select('id')
                .eq('employer_id', employerId)
                .eq('talent_id', candidate.id)
                .maybeSingle();

            if (!error) {
                setIsSaved(!!data);
            }
        } catch (error) {
            console.error('Error checking saved status:', error);
        }
    };

    const handleSaveToggle = async () => {
        if (!candidate.id) return;

        try {
            const { data: userData } = await supabase.auth.getUser();
            const employerId = userData.user?.id;

            if (!employerId) {
                toast.error('Please log in to save candidates');
                return;
            }

            if (isSaved) {
                // Unsave candidate
                const { error } = await supabase
                    .from('saved_candidates')
                    .delete()
                    .eq('employer_id', employerId)
                    .eq('talent_id', candidate.id);

                if (error) {
                    console.error('Error unsaving candidate:', error);
                    toast.error('Failed to remove from saved');
                    return;
                }

                setIsSaved(false);
                toast.success('Candidate removed from saved');
                onUnsave?.(candidate.id);
            } else {
                // Save candidate
                const { error } = await supabase
                    .from('saved_candidates')
                    .insert({
                        employer_id: employerId,
                        talent_id: candidate.id,
                        saved_at: new Date().toISOString()
                    });

                if (error) {
                    console.error('Error saving candidate:', error);
                    toast.error('Failed to save candidate');
                    return;
                }

                setIsSaved(true);
                toast.success('Candidate saved successfully');
                onSave?.(candidate.id);
            }
        } catch (error) {
            console.error('Error toggling save status:', error);
            toast.error('An error occurred');
        }
    };

    const handleResumeDownload = async () => {
        if (!fullProfile?.resume_url) {
            toast.error('No resume available for download');
            return;
        }

        setResumeDownloading(true);
        try {
            const { data, error } = await supabase.storage
                .from('resumes')
                .download(fullProfile.resume_url);

            if (error) {
                console.error('Error downloading resume:', error);
                toast.error('Failed to download resume');
                return;
            }

            // Create download link
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fullProfile.full_name}_Resume.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Resume downloaded successfully');
        } catch (error) {
            console.error('Error downloading resume:', error);
            toast.error('Failed to download resume');
        } finally {
            setResumeDownloading(false);
        }
    };

    const handleContact = () => {
        if (fullProfile?.email) {
            window.open(`mailto:${fullProfile.email}`, '_blank');
        }
    };

    const profile = fullProfile || candidate;

    const ModalContent = () => (
        <ScrollArea className="max-h-[80vh]">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                            <div className="flex items-center text-gray-600 mt-1">
                                <Mail className="h-4 w-4 mr-2" />
                                <span>{profile.email}</span>
                            </div>
                            {profile.created_at && (
                                <div className="flex items-center text-gray-500 text-sm mt-1">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={isSaved ? "default" : "outline"}
                            size="sm"
                            onClick={handleSaveToggle}
                            className="min-w-[100px]"
                        >
                            {isSaved ? (
                                <>
                                    <HeartOff className="h-4 w-4 mr-2" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Heart className="h-4 w-4 mr-2" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <Button onClick={handleContact} className="flex-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Candidate
                    </Button>
                    {fullProfile?.resume_url && (
                        <Button
                            variant="outline"
                            onClick={handleResumeDownload}
                            disabled={resumeDownloading}
                        >
                            {resumeDownloading ? (
                                <>
                                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Resume
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <Separator />

                {/* Bio Section */}
                {profile.bio && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <FileText className="h-5 w-5 mr-2" />
                                About
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Preferences Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Location Preferences */}
                    {profile.location_pref && profile.location_pref.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Location Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.location_pref.map((location, index) => (
                                        <Badge key={index} variant="outline">
                                            {location}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Industry Preferences */}
                    {profile.industry_pref && profile.industry_pref.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Building2 className="h-5 w-5 mr-2" />
                                    Industry Interests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.industry_pref.map((industry, index) => (
                                        <Badge key={index} variant="secondary">
                                            {industry}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Work Style Preferences */}
                    {profile.work_style_pref && profile.work_style_pref.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Briefcase className="h-5 w-5 mr-2" />
                                    Work Style
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.work_style_pref.map((style, index) => (
                                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {style}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Skills (if available) */}
                    {profile.skills && profile.skills.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <GraduationCap className="h-5 w-5 mr-2" />
                                    Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, index) => (
                                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Additional Information */}
                {(profile.experience || profile.education) && (
                    <div className="space-y-4">
                        <Separator />

                        {profile.experience && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Experience</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{profile.experience}</p>
                                </CardContent>
                            </Card>
                        )}

                        {profile.education && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Education</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{profile.education}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );

    if (trigger) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Candidate Profile</DialogTitle>
                    </DialogHeader>
                    <ModalContent />
                </DialogContent>
            </Dialog>
        );
    }

    // If no trigger, assume it's controlled externally
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Candidate Profile</DialogTitle>
                </DialogHeader>
                <ModalContent />
            </DialogContent>
        </Dialog>
    );
}

