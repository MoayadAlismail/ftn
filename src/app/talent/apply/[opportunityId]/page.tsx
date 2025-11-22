"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Check,
    Info,
    Calendar,
    Building2,
    MapPin,
    ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Opportunity } from "@/features/talent/opportunities/components/opportunity-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationsTranslations, opportunitiesTranslations } from "@/lib/language";
import { useTalentProfile } from "@/hooks/useTalentProfile";
import { useAuth } from "@/contexts/AuthContext";

// Mock data - in real app, this would come from API
const MOCK_OPPORTUNITY: Opportunity = {
    id: "1",
    title: "Senior Frontend Developer",
    company_name: "TechCorp Saudi",
    location: "Riyadh",
    industry: "Technology",
    workstyle: "Hybrid",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
    description: "We are looking for a Senior Frontend Developer to join our dynamic team.",
    created_at: "2024-01-15T10:00:00Z",
    matchScore: 92
};


export default function TalentApplicationPage() {
    const params = useParams();
    const router = useRouter();
    const opportunityId = params.opportunityId as string;
    const { user } = useAuth();

    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState<'application' | 'confirmation'>('application');

    // Application form data
    const [coverLetter, setCoverLetter] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [availability, setAvailability] = useState('');

    const { language } = useLanguage();
    const t = applicationsTranslations[language];
    const opportunityT = opportunitiesTranslations[language];
    const { hasResume, isLoading: profileLoading } = useTalentProfile();

    // Check for resume requirement
    useEffect(() => {
        if (!profileLoading && !hasResume && user) {
            toast.error(opportunityT.noResumeCannotApply);
            router.push("/talent/profile");
        }
    }, [hasResume, profileLoading, user, router, opportunityT.noResumeCannotApply]);

    useEffect(() => {
        loadOpportunity();
    }, [opportunityId]);

    const loadOpportunity = async () => {
        setLoading(true);
        try {
            // In real app, fetch from API
            await new Promise(resolve => setTimeout(resolve, 500));
            setOpportunity(MOCK_OPPORTUNITY);
        } catch (error) {
            console.error('Error loading opportunity:', error);
            toast.error(t.failedToLoadOpportunityToast);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmitApplication = async () => {
        if (!coverLetter.trim()) {
            toast.error(t.coverLetterMissingToast);
            return;
        }

        setProcessing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStep('confirmation');
            toast.success(t.applicationSubmissionSuccessToast);
        } catch (error) {
            toast.error(t.applicationSubmissionFailToast);
        } finally {
            setProcessing(false);
        }
    };

    const handleScheduleCalendly = () => {
        // Open Calendly in a new window/tab
        const calendlyUrl = 'https://calendly.com/ftn-find/consultation';
        window.open(calendlyUrl, '_blank', 'width=800,height=700');

        // After a short delay, show success message
        setTimeout(() => {
            toast.success(t.meetingSchedulingToast);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">{t.notFoundTitle}</h2>
                    <p className="text-gray-600 mt-2">{t.notFoundDesc}</p>
                    <Button onClick={() => router.back()} className="mt-4">{t.goBack}</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-4 md:space-y-6">
            {/* Header - Mobile Optimized */}
            <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="w-fit">{t.goBack}</Button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{t.applyForPosition}</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        {opportunity.title} at {opportunity.company_name}
                    </p>
                </div>
            </div>

            {/* Progress Steps - Mobile Optimized */}
            <Card>
                <CardContent className="pt-4 md:pt-6">
                    {/* Mobile Layout - Stacked */}
                    <div className="block md:hidden space-y-4">
                        {[
                            { key: 'application', label: t.applicationStep, icon: Info },
                            { key: 'confirmation', label: t.confirmationStep, icon: Check }
                        ].map((stepItem, index) => {
                            const Icon = stepItem.icon;
                            const isActive = step === stepItem.key;
                            const isCompleted = ['application', 'confirmation'].indexOf(step) > index;

                            return (
                                <div key={stepItem.key} className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isCompleted ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                        {stepItem.label}
                                    </span>
                                    {isActive && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {t.currentStep}
                                        </span>
                                    )}
                                    {isCompleted && (
                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                            ✓ {t.doneStep}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden md:flex items-center justify-between">
                        {[
                            { key: 'application', label: t.applicationStep, icon: Info },
                            { key: 'confirmation', label: t.confirmationStep, icon: Check }
                        ].map((stepItem, index) => {
                            const Icon = stepItem.icon;
                            const isActive = step === stepItem.key;
                            const isCompleted = ['application', 'confirmation'].indexOf(step) > index;

                            return (
                                <div key={stepItem.key} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isCompleted ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={`ml-3 font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                        {stepItem.label}
                                    </span>
                                    {index < 1 && (
                                        <div className={`mx-4 h-0.5 w-16 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                    {step === 'application' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 lg:space-y-6"
                        >
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg md:text-xl">{t.applicationDetails}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="coverLetter" className="text-sm font-medium">{t.coverLetter}</Label>
                                        <Textarea
                                            id="coverLetter"
                                            placeholder={t.coverLetterPlaceholder}
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            className="min-h-[120px] md:min-h-[150px] mt-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="portfolio" className="text-sm font-medium">{t.portfolioLabel}</Label>
                                        <Input
                                            id="portfolio"
                                            type="url"
                                            placeholder={t.portfolioPlaceholder}
                                            value={portfolioUrl}
                                            onChange={(e) => setPortfolioUrl(e.target.value)}
                                            className="mt-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="availability" className="text-sm font-medium">{t.availabilityLabel}</Label>
                                        <Input
                                            id="availability"
                                            placeholder={t.availabilityPlaceholder}
                                            value={availability}
                                            onChange={(e) => setAvailability(e.target.value)}
                                            className="mt-2 text-sm"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSubmitApplication}
                                        disabled={processing}
                                        className="w-full h-12"
                                        size="lg"
                                    >
                                        {processing ? t.submitting : t.submitApplication}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'confirmation' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 lg:space-y-6"
                        >
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <div className="mb-6">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">{t.applicationSubmittedTitle}</h2>
                                        <p className="text-sm md:text-base text-gray-600 px-4">{t.applicationSubmittedDesc.replace('{company}', opportunity.company_name)}</p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6 mb-6">
                                        <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-2">{t.scheduleConsultation}</h3>
                                        <p className="text-sm md:text-base text-blue-800 mb-4">{t.scheduleConsultationDesc}</p>
                                        <Button
                                            onClick={handleScheduleCalendly}
                                            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                                            size="lg"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {t.scheduleMeeting}
                                        </Button>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/talent/opportunities')}
                                            className="w-full md:w-auto"
                                        >
                                            {t.browseMoreJobs}
                                        </Button>
                                        <Button
                                            onClick={() => router.push('/talent/opportunities')}
                                            className="w-full md:w-auto"
                                        >
                                            {t.viewMoreJobs}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4 lg:space-y-6">
                    {/* Opportunity Summary */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base md:text-lg">{t.applicationDetails}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-base md:text-lg leading-tight">{opportunity.title}</h3>
                                <p className="text-sm md:text-base text-gray-600">{opportunity.company_name}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                                    <span>{opportunity.location} • {opportunity.workstyle}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <Building2 className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                                    <span>{opportunity.industry}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {opportunity.skills?.slice(0, 4).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>

                            {opportunity.matchScore && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs md:text-sm font-medium text-green-800">
                                            {opportunity.matchScore}% {t.match}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Support */}
                    <Card>
                        <CardContent className="pt-4 md:pt-6">
                            <div className="text-center text-sm text-gray-600">
                                <p className="mb-2">{t.needHelp}</p>
                                <Button variant="link" className="text-sm p-0 h-auto text-blue-600 hover:text-blue-800">{t.contactSupport}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
