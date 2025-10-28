"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/lib/language/onboarding";

// Import onboarding components
import ResumeUploadStep from "@/features/talent/onboarding/components/resume-upload-step";
import LocationPreference from "@/features/talent/onboarding/components/location-preference";
import SelectIndustries from "@/features/talent/onboarding/components/select-industries";
import SelectOpportunities from "@/features/talent/onboarding/components/select-opportunities";
import AboutYourself from "@/features/talent/onboarding/components/about-yourself";
import { LoadingSpinner } from "@/components/ui/loading-states";

// Define the onboarding steps
const ONBOARDING_STEPS = [
    {
        id: 'resume',
        title: 'Resume Upload (Optional)',
        description: 'Upload your resume to enhance your profile',
        component: ResumeUploadStep
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
    const { language } = useLanguage();
    const t = onboardingTranslations[language];

    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({
        resumeFile: null,
        locationPreference: [],
        industryPreference: [],
        workStylePreference: [],
        bio: ''
    });
    const [isFinalizing, setIsFinalizing] = useState(false);

    useEffect(() => {
        // Auth is handled by middleware - user is guaranteed to be authenticated
        // Resume loading is handled by the ResumeUploadStep component
    }, [user, router]);

    const updateOnboardingData = useCallback((field: keyof OnboardingData, value: any) => {
        setOnboardingData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const setResumeFile = useCallback((file: File | null) => {
        updateOnboardingData('resumeFile', file);
    }, [updateOnboardingData]);

    const setLocationPreference = useCallback((location: string) => {
        updateOnboardingData('locationPreference', [location]);
    }, [updateOnboardingData]);

    const setIndustryPreference = useCallback((industries: string[]) => {
        updateOnboardingData('industryPreference', industries);
    }, [updateOnboardingData]);

    const setWorkStylePreference = useCallback((styles: string[]) => {
        updateOnboardingData('workStylePreference', styles);
    }, [updateOnboardingData]);

    const setBio = useCallback((bio: string) => {
        updateOnboardingData('bio', bio);
    }, [updateOnboardingData]);

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
            toast.error(t.userNotAuthenticated);
            return;
        }
        setIsFinalizing(true);
        startLoading();

        try {
            // Set a timeout for the entire operation (30 seconds)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Operation timed out')), 30000)
            );

            const onboardingPromise = async () => {
                // Upload resume to Supabase storage with retry logic
                let resumeUrl = null;
                if (onboardingData.resumeFile) {
                    let uploadAttempts = 0;
                    const maxAttempts = 3;

                    while (uploadAttempts < maxAttempts) {
                        try {
                            const { data: resumeUpload, error: uploadError } = await supabase.storage
                                .from("resumes")
                                .upload(`resume-${user.id}.pdf`, onboardingData.resumeFile, {
                                    upsert: true,
                                });

                            if (uploadError) {
                                throw uploadError;
                            }

                            resumeUrl = resumeUpload.path;
                            break;
                        } catch (error) {
                            uploadAttempts++;
                            if (uploadAttempts >= maxAttempts) {
                                console.error("Resume upload error after retries:", error);
                                toast.error(t.resumeUploadError);
                                return;
                            }
                            // Wait before retry
                            await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
                        }
                    }
                }

                // Check if profile exists and insert/update accordingly
                let dbAttempts = 0;
                const maxDbAttempts = 3;
                let profileCreated = false;

                while (dbAttempts < maxDbAttempts && !profileCreated) {
                    try {
                        const profileData = {
                            id: user.id,
                            user_id: user.id,
                            email: user.email || "unknown@email.com",
                            full_name: user.user_metadata.name || user.user_metadata.full_name || "Unknown",
                            bio: onboardingData.bio,
                            work_style_pref: onboardingData.workStylePreference,
                            industry_pref: onboardingData.industryPreference,
                            location_pref: onboardingData.locationPreference,
                            resume_url: resumeUrl,
                        };
                        
                        // First check if profile already exists
                        const { data: existingProfile, error: checkError } = await supabase
                            .from("talents")
                            .select("id")
                            .eq("user_id", user.id)
                            .maybeSingle();

                        if (checkError && checkError.code !== 'PGRST116') {
                            throw checkError;
                        }

                        let result;
                        if (existingProfile) {
                            // Profile exists, update it
                            console.log("Updating existing talent profile");
                            result = await supabase
                                .from("talents")
                                .update(profileData)
                                .eq("user_id", user.id);
                        } else {
                            // Profile doesn't exist, insert new one
                            console.log("Creating new talent profile");
                            result = await supabase
                                .from("talents")
                                .insert(profileData);
                        }

                        if (result.error) {
                            throw result.error;
                        }

                        profileCreated = true;
                    } catch (error) {
                        dbAttempts++;

                        if (dbAttempts >= maxDbAttempts) {
                            console.error("Error saving talent profile after retries:", error);
                            toast.error(t.profileSaveError);
                            return;
                        }
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * dbAttempts));
                    }
                }

                // Update user metadata to mark as onboarded (non-blocking but important)
                try {
                    const { error: metadataError } = await supabase.auth.updateUser({
                        data: { is_onboarded: true }
                    });

                    if (metadataError) {
                        console.error("Error updating user metadata:", metadataError);
                        // This is important but not fatal - the profile exists in DB
                    }
                } catch (metadataError) {
                    console.error("Error updating user metadata:", metadataError);
                    // Don't fail the entire process for metadata update failure
                }

                // Clean up localStorage
                localStorage.removeItem("resumeFileBase64");
                localStorage.removeItem("resumeFileName");
                localStorage.removeItem("resumeUploadTimestamp");

                return true;
            };

            // Race between the operation and timeout
            await Promise.race([onboardingPromise(), timeoutPromise]);

            toast.success(t.profileCreatedSuccess);
            router.push("/talent/match-making");
        } catch (error) {
            console.error("Onboarding completion error:", error);
            if (error instanceof Error && error.message === 'Operation timed out') {
                toast.error(t.operationTimedOut);
            } else {
                toast.error(t.unexpectedError);
            }
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
            <div className="max-w-4xl mx-auto px-4 py-8">
                {isFinalizing ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <LoadingSpinner size="lg" className="mb-4 text-primary" />
                        <p className="text-lg text-gray-700">{t.finalizingProfile}</p>
                    </div>
                ) : (
                    <>
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
                            >
                                {currentStepConfig.id === 'resume' && (
                                    <ResumeUploadStep
                                        resumeFile={onboardingData.resumeFile}
                                        setResumeFile={setResumeFile}
                                        next={nextStep}
                                    />
                                )}
                                {currentStepConfig.id === 'location' && (
                                    <LocationPreference
                                        locationPreference={onboardingData.locationPreference[0] || ''}
                                        setLocationPreference={setLocationPreference}
                                        next={nextStep}
                                        {...(currentStep > 0 && { prev: prevStep })}
                                    />
                                )}
                                {currentStepConfig.id === 'industries' && (
                                    <SelectIndustries
                                        industryPreference={onboardingData.industryPreference}
                                        setIndustryPreference={setIndustryPreference}
                                        next={nextStep}
                                        prev={prevStep}
                                    />
                                )}
                                {currentStepConfig.id === 'opportunities' && (
                                    <SelectOpportunities
                                        setResumeFile={setResumeFile}
                                        workStylePreference={onboardingData.workStylePreference}
                                        setWorkStylePreference={setWorkStylePreference}
                                        next={nextStep}
                                        prev={prevStep}
                                    />
                                )}
                                {currentStepConfig.id === 'about' && (
                                    <AboutYourself
                                        bio={onboardingData.bio}
                                        setBio={setBio}
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
                    </>
                )}
            </div>
        </div>
    );
}