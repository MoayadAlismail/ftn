"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import { toast } from "sonner";

// Import onboarding components
import ResumeUpload from "@/features/talent/onboarding/components/resume-upload";
import LocationPreference from "@/features/talent/onboarding/components/location-preference";
import SelectIndustries from "@/features/talent/onboarding/components/select-industries";
import SelectOpportunities from "@/features/talent/onboarding/components/select-opportunities";
import AboutYourself from "@/features/talent/onboarding/components/about-yourself";

// Define the onboarding steps
const ONBOARDING_STEPS = [
    {
        id: 'resume',
        title: 'Upload Your Resume',
        description: 'Help us understand your experience and skills',
        component: ResumeUpload
    },
    {
        id: 'location',
        title: 'Location Preferences',
        description: 'Where would you like to work?',
        component: LocationPreference
    },
    {
        id: 'industries',
        title: 'Industry Interests',
        description: 'Which industries interest you most?',
        component: SelectIndustries
    },
    {
        id: 'opportunities',
        title: 'Opportunity Types',
        description: 'What type of work are you looking for?',
        component: SelectOpportunities
    },
    {
        id: 'about',
        title: 'About Yourself',
        description: 'Tell us a bit more about yourself',
        component: AboutYourself
    }
];

interface OnboardingData {
    resumeFile: File | null;
    locationPreference: string[];
    industryPreference: string[];
    workStylePreference: string[];
    bio: string;
}

export default function TalentOnboarding() {
    const router = useRouter();
    const { user } = useAuth();
    const { startLoading, stopLoading } = useLoading();

    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({
        resumeFile: null,
        locationPreference: [],
        industryPreference: [],
        workStylePreference: [],
        bio: ''
    });

    useEffect(() => {
        // Auth is handled by middleware - user is guaranteed to be authenticated

        // Check if already onboarded
        const checkOnboardingStatus = async () => {
            const { data, error } = await supabase
                .from('talents')
                .select('id')
                .eq('user_id', user!.id)
                .maybeSingle();

            if (data && !error) {
                // User already onboarded, redirect to dashboard
                router.push('/talent/dashboard');
            }
        };

        checkOnboardingStatus();
    }, [user, router]);

    useEffect(() => {
        // Check for existing resume data from localStorage
        const resumeData = localStorage.getItem("resumeFileBase64");
        const resumeTimestamp = localStorage.getItem("resumeUploadTimestamp");

        if (resumeData && resumeTimestamp) {
            // Check if resume data is not expired (1 hour)
            const now = Date.now();
            const uploadTime = parseInt(resumeTimestamp);
            const isExpired = (now - uploadTime) > 3600000; // 1 hour

            if (!isExpired) {
                // Convert base64 back to file if needed
                try {
                    const byteCharacters = atob(resumeData.split(',')[1]);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const file = new File([byteArray], "resume.pdf", { type: "application/pdf" });

                    setOnboardingData(prev => ({ ...prev, resumeFile: file }));
                    // Skip to next step if resume already uploaded
                    setCurrentStep(1);
                } catch (error) {
                    console.error("Error parsing resume data:", error);
                    localStorage.removeItem("resumeFileBase64");
                    localStorage.removeItem("resumeUploadTimestamp");
                }
            } else {
                // Remove expired data
                localStorage.removeItem("resumeFileBase64");
                localStorage.removeItem("resumeUploadTimestamp");
            }
        }
    }, []);

    const updateOnboardingData = (field: keyof OnboardingData, value: any) => {
        setOnboardingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const nextStep = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const completeOnboarding = async () => {
        if (!user) {
            toast.error("User not authenticated");
            return;
        }

        startLoading();

        try {
            // Upload resume to Supabase storage
            let resumeUrl = null;
            if (onboardingData.resumeFile) {
                const { data: resumeUpload, error: uploadError } = await supabase.storage
                    .from("resumes")
                    .upload(`resume-${user.id}.pdf`, onboardingData.resumeFile, {
                        upsert: true,
                    });

                if (uploadError) {
                    console.error("Resume upload error:", uploadError);
                    toast.error("Failed to upload resume");
                    return;
                }

                resumeUrl = resumeUpload.path;
            }

            // Insert talent profile into database
            const { data, error } = await supabase.from("talents").insert({
                id: user.id,
                user_id: user.id,
                email: user.email || "unknown@email.com",
                full_name: user.user_metadata.name || user.user_metadata.full_name || "Unknown",
                bio: onboardingData.bio,
                work_style_pref: onboardingData.workStylePreference,
                industry_pref: onboardingData.industryPreference,
                location_pref: onboardingData.locationPreference,
                resume_url: resumeUrl,
            });

            if (error) {
                console.error("Error inserting talent profile:", error);
                toast.error("Failed to create profile");
                return;
            }

            // Update user metadata to mark as onboarded
            const { error: metadataError } = await supabase.auth.updateUser({
                data: { is_onboarded: true }
            });

            if (metadataError) {
                console.error("Error updating user metadata:", metadataError);
                // Don't fail the entire process for metadata update failure
            }

            // Clean up localStorage
            localStorage.removeItem("resumeFileBase64");
            localStorage.removeItem("resumeUploadTimestamp");

            toast.success("Profile created successfully!");
            router.push("/talent/match-making");
        } catch (error) {
            console.error("Onboarding completion error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            stopLoading();
        }
    };

    const currentStepConfig = ONBOARDING_STEPS[currentStep];

    const stepVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-sm" />
                            </div>
                            <span className="text-xl font-semibold text-gray-900">FTN</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {currentStepConfig.title}
                            </h1>
                            <span className="text-sm text-gray-500">
                                {Math.round(((currentStep + 1) / ONBOARDING_STEPS.length) * 100)}% complete
                            </span>
                        </div>
                        <p className="text-gray-600 mb-4">{currentStepConfig.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <AnimatePresence mode="wait" custom={1}>
                        <motion.div
                            key={currentStep}
                            custom={1}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="p-8"
                        >
                            {currentStepConfig.id === 'resume' && (
                                <ResumeUpload
                                    resumeFile={onboardingData.resumeFile}
                                    setResumeFile={(file: File | null) => updateOnboardingData('resumeFile', file)}
                                    next={nextStep}
                                />
                            )}
                            {currentStepConfig.id === 'location' && (
                                <LocationPreference
                                    locationPreference={onboardingData.locationPreference[0] || ''}
                                    setLocationPreference={(location: string) => updateOnboardingData('locationPreference', [location])}
                                    next={nextStep}
                                    prev={prevStep}
                                />
                            )}
                            {currentStepConfig.id === 'industries' && (
                                <SelectIndustries
                                    industryPreference={onboardingData.industryPreference}
                                    setIndustryPreference={(industries: string[]) => updateOnboardingData('industryPreference', industries)}
                                    next={nextStep}
                                    prev={prevStep}
                                />
                            )}
                            {currentStepConfig.id === 'opportunities' && (
                                <SelectOpportunities
                                    setResumeFile={(file: File | null) => updateOnboardingData('resumeFile', file)}
                                    workStylePreference={onboardingData.workStylePreference}
                                    setWorkStylePreference={(styles: string[]) => updateOnboardingData('workStylePreference', styles)}
                                    next={nextStep}
                                    prev={prevStep}
                                />
                            )}
                            {currentStepConfig.id === 'about' && (
                                <AboutYourself
                                    bio={onboardingData.bio}
                                    setBio={(bio: string) => updateOnboardingData('bio', bio)}
                                    resumeFile={onboardingData.resumeFile}
                                    workStylePreference={onboardingData.workStylePreference}
                                    industryPreference={onboardingData.industryPreference}
                                    locationPreference={onboardingData.locationPreference}
                                    prev={prevStep}
                                    onComplete={completeOnboarding}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Step Navigation */}
                <div className="flex justify-center mt-8 space-x-2">
                    {ONBOARDING_STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 rounded-full transition-colors duration-200 ${index === currentStep
                                ? 'bg-blue-500'
                                : index < currentStep
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}