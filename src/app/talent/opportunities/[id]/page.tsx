"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    ArrowLeft,
    MapPin,
    Briefcase,
    Clock,
    Building2,
    Bookmark,
    Share2,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyLogo } from "@/components/ui/company-logo";
import LoadingAnimation from "@/components/loadingAnimation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { opportunitiesTranslations } from "@/lib/language/opportunities";

// Profile completion modal components
import LocationPreference from "@/features/talent/onboarding/components/location-preference";
import SelectIndustries from "@/features/talent/onboarding/components/select-industries";
import SelectOpportunities from "@/features/talent/onboarding/components/select-opportunities";
import AboutYourself from "@/features/talent/onboarding/components/about-yourself";

interface OpportunityDetails {
    id: string;
    title: string;
    company_name: string;
    company_logo_url?: string;
    location: string;
    industry: string;
    workstyle: string;
    skills: string[];
    description: string;
    responsibilities?: string[];
    requirements?: string[];
    benefits?: string[];
    salary_range?: string;
    job_type?: string;
    experience_level?: string;
    created_at: string;
}

interface ProfileCompletion {
    isComplete: boolean;
    missingFields: string[];
    hasResume: boolean;
    hasLocation: boolean;
    hasIndustries: boolean;
    hasWorkStyle: boolean;
    hasBio: boolean;
}

export default function OpportunityDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { authUser } = useAuth();
    const { language } = useLanguage();
    const t = opportunitiesTranslations[language];
    const opportunityId = params?.id as string;

    const [opportunity, setOpportunity] = useState<OpportunityDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionStep, setCompletionStep] = useState(0);

    // Profile completion data
    const [locationPreference, setLocationPreference] = useState<string[]>([]);
    const [industryPreference, setIndustryPreference] = useState<string[]>([]);
    const [workStylePreference, setWorkStylePreference] = useState<string[]>([]);
    const [bio, setBio] = useState("");

    useEffect(() => {
        if (opportunityId) {
            loadOpportunityDetails();
            checkIfSaved();
            checkProfileCompletion();
        }
    }, [opportunityId]);

    const checkProfileCompletion = async () => {
        if (!authUser?.id) return;

        try {
            const { data: talentData } = await supabase
                .from('talents')
                .select('*')
                .eq('user_id', authUser.id)
                .single();

            if (!talentData) return;

            const hasResume = !!talentData.resume_url;
            const hasLocation = talentData.location_pref && talentData.location_pref.length > 0;
            const hasIndustries = talentData.industry_pref && talentData.industry_pref.length > 0;
            const hasWorkStyle = talentData.work_style_pref && talentData.work_style_pref.length > 0;
            const hasBio = !!talentData.bio && talentData.bio.trim().length > 0;

            const missingFields = [];
            if (!hasResume) missingFields.push('Resume');
            if (!hasLocation) missingFields.push('Location Preference');
            if (!hasIndustries) missingFields.push('Industry Interests');
            if (!hasWorkStyle) missingFields.push('Work Style');
            if (!hasBio) missingFields.push('Bio');

            const isComplete = hasResume && hasLocation && hasIndustries && hasWorkStyle && hasBio;

            setProfileCompletion({
                isComplete,
                missingFields,
                hasResume,
                hasLocation,
                hasIndustries,
                hasWorkStyle,
                hasBio
            });

            // Load existing data
            if (hasLocation) setLocationPreference(talentData.location_pref);
            if (hasIndustries) setIndustryPreference(talentData.industry_pref);
            if (hasWorkStyle) setWorkStylePreference(talentData.work_style_pref);
            if (hasBio) setBio(talentData.bio);
        } catch (error) {
            console.error('Error checking profile completion:', error);
        }
    };

    const loadOpportunityDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('opportunities')
                .select('*')
                .eq('id', opportunityId)
                .single();

            if (error) throw error;

            setOpportunity(data);
        } catch (error) {
            console.error('Error loading opportunity:', error);
            toast.error('Failed to load opportunity details');
        } finally {
            setLoading(false);
        }
    };

    const checkIfSaved = async () => {
        if (!authUser?.id) return;

        try {
            const { data: talentData } = await supabase
                .from('talents')
                .select('id')
                .eq('user_id', authUser.id)
                .single();

            if (!talentData) return;

            const { data } = await supabase
                .from('saved_opportunities')
                .select('id')
                .eq('talent_id', talentData.id)
                .eq('opportunity_id', opportunityId)
                .maybeSingle();

            setIsSaved(!!data);
        } catch (error) {
            console.error('Error checking saved status:', error);
        }
    };

    const handleSaveToggle = async () => {
        if (!authUser?.id) {
            toast.error('Please log in to save opportunities');
            return;
        }

        setSaving(true);
        try {
            const { data: talentData } = await supabase
                .from('talents')
                .select('id')
                .eq('user_id', authUser.id)
                .single();

            if (!talentData) {
                toast.error('Talent profile not found');
                return;
            }

            if (isSaved) {
                await supabase
                    .from('saved_opportunities')
                    .delete()
                    .eq('talent_id', talentData.id)
                    .eq('opportunity_id', opportunityId);

                setIsSaved(false);
                toast.success('Opportunity removed from saved');
            } else {
                await supabase
                    .from('saved_opportunities')
                    .insert({
                        talent_id: talentData.id,
                        opportunity_id: opportunityId,
                        saved_at: new Date().toISOString()
                    });

                setIsSaved(true);
                toast.success('Opportunity saved');
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            toast.error('Failed to update saved status');
        } finally {
            setSaving(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${opportunity?.title} at ${opportunity?.company_name}`,
                    text: opportunity?.description,
                    url: url
                });
                toast.success('Shared successfully');
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        }
    };

    const handleApply = () => {
        if (!profileCompletion?.isComplete) {
            setShowCompletionModal(true);
            return;
        }
        router.push(`/talent/apply/${opportunityId}`);
    };

    const handleProfileStepComplete = async () => {
        // Move to next incomplete step
        const steps = [
            { check: profileCompletion?.hasLocation, index: 0 },
            { check: profileCompletion?.hasIndustries, index: 1 },
            { check: profileCompletion?.hasWorkStyle, index: 2 },
            { check: profileCompletion?.hasBio, index: 3 }
        ];

        const currentIncompleteIndex = steps.findIndex((step, idx) => idx > completionStep && !step.check);
        
        if (currentIncompleteIndex !== -1) {
            setCompletionStep(currentIncompleteIndex);
        } else {
            // All steps complete, save and proceed
            await saveProfileData();
            setShowCompletionModal(false);
            router.push(`/talent/apply/${opportunityId}`);
        }
    };

    const saveProfileData = async () => {
        if (!authUser?.id) return;

        try {
            const { data: talentData } = await supabase
                .from('talents')
                .select('id')
                .eq('user_id', authUser.id)
                .single();

            if (!talentData) return;

            await supabase
                .from('talents')
                .update({
                    location_pref: locationPreference,
                    industry_pref: industryPreference,
                    work_style_pref: workStylePreference,
                    bio: bio
                })
                .eq('id', talentData.id);

            toast.success('Profile updated successfully');
            await checkProfileCompletion();
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingAnimation size="lg" text="Loading opportunity details..." />
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity not found</h2>
                <p className="text-gray-600 mb-6">This opportunity may have been removed or doesn't exist.</p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const postedTime = formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true });

    const incompleteSections = [
        { name: 'Location Preference', complete: profileCompletion?.hasLocation },
        { name: 'Industry Interests', complete: profileCompletion?.hasIndustries },
        { name: 'Work Style', complete: profileCompletion?.hasWorkStyle },
        { name: 'About Yourself', complete: profileCompletion?.hasBio }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Opportunities
            </Button>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <Card>
                        <CardContent className="p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <CompanyLogo 
                                    logoUrl={opportunity.company_logo_url}
                                    companyName={opportunity.company_name}
                                    size="lg"
                                    className="flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {opportunity.title}
                                    </h1>
                                    <p className="text-xl text-gray-700 mb-4">
                                        {opportunity.company_name}
                                    </p>

                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            <span>{opportunity.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={16} />
                                            <span>{opportunity.workstyle}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} />
                                            <span>{postedTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} />
                                            <span>{opportunity.industry}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardContent className="p-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">About this opportunity</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {opportunity.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Responsibilities */}
                    {opportunity.responsibilities && opportunity.responsibilities.length > 0 && (
                        <Card>
                            <CardContent className="p-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                                <ul className="space-y-2">
                                    {opportunity.responsibilities.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-700">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Requirements */}
                    {opportunity.requirements && opportunity.requirements.length > 0 && (
                        <Card>
                            <CardContent className="p-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                                <ul className="space-y-2">
                                    {opportunity.requirements.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-700">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Benefits */}
                    {opportunity.benefits && opportunity.benefits.length > 0 && (
                        <Card>
                            <CardContent className="p-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                                <ul className="space-y-2">
                                    {opportunity.benefits.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-700">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Sticky Action Card */}
                    <div className="lg:sticky lg:top-6 space-y-6">
                        <Card>
                            <CardContent className="p-8 space-y-8">
                                {/* Profile Completion Warning */}
                                {!profileCompletion?.isComplete && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                                                    Complete your profile to apply
                                                </h3>
                                                <p className="text-xs text-yellow-700">
                                                    You need to complete your profile before applying to opportunities.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button 
                                    onClick={handleApply}
                                    size="lg"
                                    className="w-full"
                                >
                                    Apply Now
                                </Button>
                                
                                <div className="flex gap-3">
                                    <Button 
                                        variant={isSaved ? "default" : "outline"}
                                        onClick={handleSaveToggle}
                                        disabled={saving}
                                        className="flex-1"
                                    >
                                        <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                                        {isSaved ? 'Saved' : 'Save'}
                                    </Button>
                                    <Button variant="outline" onClick={handleShare} className="flex-1">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Get Hired Quicker Banner */}
                        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                            <CardContent className="p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Get hired quicker.</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Let our experts optimize your profile and match you with the right opportunities faster.
                                    </p>
                                    <Button 
                                        variant="default"
                                        className="w-full bg-primary hover:bg-primary/90"
                                        onClick={() => router.push('/talent/services')}
                                    >
                                        Learn More
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Required Skills */}
                        {opportunity.skills && opportunity.skills.length > 0 && (
                            <Card>
                                <CardContent className="p-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {opportunity.skills.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Profile Completion Checklist */}
                        {!profileCompletion?.isComplete && (
                            <Card>
                                <CardContent className="p-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            {profileCompletion?.hasResume ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-gray-400" />
                                            )}
                                            <span className={`text-sm ${profileCompletion?.hasResume ? 'text-gray-900' : 'text-gray-500'}`}>
                                                Resume Uploaded
                                            </span>
                                        </div>
                                        {incompleteSections.map((section, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                {section.complete ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-gray-400" />
                                                )}
                                                <span className={`text-sm ${section.complete ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {section.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Completion Modal */}
            <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Complete Your Profile</DialogTitle>
                        <DialogDescription>
                            Please complete the following information to apply for this opportunity.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {!profileCompletion?.hasResume && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                                            Resume Required
                                        </h3>
                                        <p className="text-xs text-yellow-700 mb-3">
                                            You need to upload your resume before applying.
                                        </p>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                                                setShowCompletionModal(false);
                                                router.push('/talent/profile');
                                            }}
                                        >
                                            Go to Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {completionStep === 0 && !profileCompletion?.hasLocation && (
                            <LocationPreference
                                locationPreference={locationPreference[0] || ''}
                                setLocationPreference={(loc) => setLocationPreference([loc])}
                                next={handleProfileStepComplete}
                                prev={() => setShowCompletionModal(false)}
                            />
                        )}

                        {completionStep === 1 && !profileCompletion?.hasIndustries && (
                            <SelectIndustries
                                industryPreference={industryPreference}
                                setIndustryPreference={setIndustryPreference}
                                next={handleProfileStepComplete}
                                prev={() => setCompletionStep(0)}
                            />
                        )}

                        {completionStep === 2 && !profileCompletion?.hasWorkStyle && (
                            <SelectOpportunities
                                setResumeFile={() => {}}
                                workStylePreference={workStylePreference}
                                setWorkStylePreference={setWorkStylePreference}
                                next={handleProfileStepComplete}
                                prev={() => setCompletionStep(1)}
                            />
                        )}

                        {completionStep === 3 && !profileCompletion?.hasBio && (
                            <AboutYourself
                                bio={bio}
                                setBio={setBio}
                                resumeFile={null}
                                workStylePreference={workStylePreference}
                                industryPreference={industryPreference}
                                locationPreference={locationPreference}
                                prev={() => setCompletionStep(2)}
                                onComplete={async () => {
                                    await saveProfileData();
                                    setShowCompletionModal(false);
                                    router.push(`/talent/apply/${opportunityId}`);
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
