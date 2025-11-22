"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mail,
    MapPin,
    Briefcase,
    Eye,
    Download,
    Heart,
    HeartOff,
    Building2,
    Calendar
} from "lucide-react";
import CandidateProfileModal from "./candidate-profile-modal";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CandidateCardProps {
    candidate: {
        id: string;
        full_name: string;
        email: string;
        bio?: string;
        location_pref?: string[];
        industry_pref?: string[];
        work_style_pref?: string[];
        resume_url?: string;
        created_at?: string;
        isSaved?: boolean;
    };
    onSaveChange?: (candidateId: string, isSaved: boolean) => void;
    showSaveButton?: boolean;
    compact?: boolean;
}

export default function CandidateCard({
    candidate,
    onSaveChange,
    showSaveButton = true,
    compact = false
}: CandidateCardProps) {
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(candidate.isSaved || false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleSaveToggle = async () => {
        setActionLoading(true);
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
                onSaveChange?.(candidate.id, false);
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
                onSaveChange?.(candidate.id, true);
            }
        } catch (error) {
            console.error('Error toggling save status:', error);
            toast.error('An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResumeDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!candidate.resume_url) {
            toast.error('No resume available for download');
            return;
        }

        try {
            const { data, error } = await supabase.storage
                .from('resumes')
                .download(candidate.resume_url);

            if (error) {
                console.error('Error downloading resume:', error);
                toast.error('Failed to download resume');
                return;
            }

            // Create download link
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${candidate.full_name}_Resume.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Resume downloaded successfully');
        } catch (error) {
            console.error('Error downloading resume:', error);
            toast.error('Failed to download resume');
        }
    };

    const handleContact = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`mailto:${candidate.email}`, '_blank');
    };

    if (compact) {
        return (
            <>
                <Card className="hover:shadow-md hover:-translate-y-0.5 hover:border-gray-400 transition-[transform,box-shadow,border-color] duration-75 cursor-pointer" onClick={() => setProfileModalOpen(true)}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{candidate.full_name}</h3>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">{candidate.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                {showSaveButton && (
                                    <Button
                                        variant={isSaved ? "default" : "outline"}
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveToggle();
                                        }}
                                        disabled={actionLoading}
                                        className="min-w-[80px]"
                                    >
                                        {isSaved ? (
                                            <>
                                                <HeartOff className="h-3 w-3 mr-1" />
                                                Saved
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="h-3 w-3 mr-1" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={(e) => {
                                    e.stopPropagation();
                                    setProfileModalOpen(true);
                                }}>
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <CandidateProfileModal
                    candidate={candidate}
                    isOpen={profileModalOpen}
                    onOpenChange={setProfileModalOpen}
                    onSave={(id) => {
                        setIsSaved(true);
                        onSaveChange?.(id, true);
                    }}
                    onUnsave={(id) => {
                        setIsSaved(false);
                        onSaveChange?.(id, false);
                    }}
                />
            </>
        );
    }

    return (
        <>
            <Card className="hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-400 transition-[transform,box-shadow,border-color] duration-75 cursor-pointer" onClick={() => setProfileModalOpen(true)}>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{candidate.full_name}</h3>
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <Mail className="h-4 w-4 mr-2" />
                                        <span>{candidate.email}</span>
                                    </div>
                                    {candidate.created_at && (
                                        <div className="flex items-center text-gray-500 text-xs mt-1">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            <span>Joined {new Date(candidate.created_at).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {showSaveButton && (
                                    <Button
                                        variant={isSaved ? "default" : "outline"}
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveToggle();
                                        }}
                                        disabled={actionLoading}
                                        className="min-w-[80px]"
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
                                )}
                                <Button size="sm" variant="outline" onClick={(e) => {
                                    e.stopPropagation();
                                    setProfileModalOpen(true);
                                }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                </Button>
                            </div>
                        </div>

                        {/* Bio */}
                        {candidate.bio && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                                    {candidate.bio}
                                </p>
                            </div>
                        )}

                        {/* Preferences */}
                        <div className="space-y-3">
                            {candidate.location_pref && candidate.location_pref.length > 0 && (
                                <div>
                                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Location Preferences
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {candidate.location_pref.slice(0, 3).map((location, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {location}
                                            </Badge>
                                        ))}
                                        {candidate.location_pref.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{candidate.location_pref.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {candidate.industry_pref && candidate.industry_pref.length > 0 && (
                                <div>
                                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Industry Interests
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {candidate.industry_pref.slice(0, 3).map((industry, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {industry}
                                            </Badge>
                                        ))}
                                        {candidate.industry_pref.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{candidate.industry_pref.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {candidate.work_style_pref && candidate.work_style_pref.length > 0 && (
                                <div>
                                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Work Style
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {candidate.work_style_pref.slice(0, 3).map((style, index) => (
                                            <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                {style}
                                            </Badge>
                                        ))}
                                        {candidate.work_style_pref.length > 3 && (
                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                +{candidate.work_style_pref.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-2">
                            <Button size="sm" onClick={handleContact} className="flex-1">
                                <Mail className="h-4 w-4 mr-2" />
                                Contact
                            </Button>
                            {candidate.resume_url && (
                                <Button size="sm" variant="outline" onClick={handleResumeDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Resume
                                </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={(e) => {
                                e.stopPropagation();
                                setProfileModalOpen(true);
                            }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Profile
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <CandidateProfileModal
                candidate={candidate}
                isOpen={profileModalOpen}
                onOpenChange={setProfileModalOpen}
                onSave={(id) => {
                    setIsSaved(true);
                    onSaveChange?.(id, true);
                }}
                onUnsave={(id) => {
                    setIsSaved(false);
                    onSaveChange?.(id, false);
                }}
            />
        </>
    );
}

