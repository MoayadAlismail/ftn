"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { generateBioFromResume } from "@/lib/generate-bio";
import { extractResumeText } from "@/lib/extract-resume";
import { Loader2, User, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/lib/language/onboarding";

interface AboutYourselfProps {
  bio: string;
  setBio: (bio: string) => void;
  resumeFile: File | null;
  workStylePreference: string[];
  industryPreference: string[];
  locationPreference: string[];
  prev: () => void;
  onComplete: () => void;
}

export default function AboutYourself({
  bio,
  resumeFile,
  workStylePreference,
  industryPreference,
  locationPreference,
  setBio,
  prev,
  onComplete,
}: AboutYourselfProps) {
  const { language } = useLanguage();
  const t = onboardingTranslations[language];
  const minCharacters = 10;
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const router = useRouter();
  
  // Check if resume is available and not expired
  const hasResume = (() => {
    if (resumeFile) return true;
    
    const resumeData = localStorage.getItem("resumeFileBase64");
    const resumeTimestamp = localStorage.getItem("resumeUploadTimestamp");
    
    if (!resumeData || !resumeTimestamp) return false;
    
    // Check if resume is older than 1 hour (3600000 ms)
    const now = Date.now();
    const uploadTime = parseInt(resumeTimestamp);
    const isExpired = now - uploadTime > 3600000;
    
    if (isExpired) {
      // Clean up expired data
      localStorage.removeItem("resumeFileBase64");
      localStorage.removeItem("resumeFileName");
      localStorage.removeItem("resumeUploadTimestamp");
      return false;
    }
    
    return true;
  })();

  const handleGenerateBio = async () => {
    let file = resumeFile;
    if (!file) {
      const resumeData = localStorage.getItem("resumeFileBase64");
      const resumeTimestamp = localStorage.getItem("resumeUploadTimestamp");
      if (!resumeData || !resumeTimestamp) {
        toast.error(t.noResumeFound);
        return;
      }
      // Convert base64 to File
      const base64Response = resumeData.split(',')[1];
      const binaryString = window.atob(base64Response);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      file = new File([blob], 'resume.pdf', { type: 'application/pdf' });
    }
    setIsGeneratingBio(true);
    try {
      const resumeText = await extractResumeText(file);
      if (!resumeText) {
        toast.error("Failed to extract text from resume");
        return;
      }
      const result = await generateBioFromResume({
        resumeText,
        workStylePreference,
        industryPreference,
        locationPreference,
      });
      if (result.success && result.bio) {
        setBio(result.bio);
        toast.success(t.bioGeneratedSuccess);
      } else {
        toast.error(result.error || t.bioGeneratedError);
      }
    } catch (error) {
      console.error("Error generating bio:", error);
      toast.error(t.bioGenerationError);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleCompleteSetup = () => {
    if (bio.length < minCharacters) {
      return;
    }
    onComplete();
  };

  const handleSkip = () => {
    // Skip validation and complete setup with empty or current bio
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <span>{t.stepOf} 5 {t.of} 5</span>
            <span>100% {t.complete}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-5 text-center">
          {/* Icon */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <User size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">{t.aboutTitle}</h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {t.aboutDescription}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t.aboutPlaceholder}
                className="w-full h-24 sm:h-28 lg:h-32 text-sm sm:text-base resize-none flex-1"
              />
              <div className="flex sm:flex-col gap-2">
                <div className="relative group">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateBio}
                    disabled={!hasResume || isGeneratingBio}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    {isGeneratingBio ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isGeneratingBio ? t.generating : t.aiGenerate}
                  </Button>
                  {!hasResume && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      {t.uploadResumeTooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs sm:text-sm text-gray-600">
                {bio.length} {t.characters} ({t.minimum} {minCharacters})
              </p>
              {hasResume ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  {t.resumeUploaded}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  {t.noResumeUploaded}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="block sm:hidden space-y-3 pt-4">
          <Button className="cursor-pointer w-full" variant="outline" onClick={prev}>
            {t.back}
          </Button>
          <div className="flex gap-2">
            <Button
              className="cursor-pointer flex-1"
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isCompleting}
            >
              {t.skipForNow}
            </Button>
            <Button
              className="cursor-pointer flex-1 flex items-center justify-center gap-2"
              onClick={handleCompleteSetup}
              disabled={bio.length < minCharacters || isCompleting}
            >
              {isCompleting && <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />}
              <span className="text-xs sm:text-sm">{t.completeSetup}</span>
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex justify-between pt-4">
          <Button className="cursor-pointer" variant="outline" onClick={prev}>
            {t.back}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              className="cursor-pointer"
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isCompleting}
            >
              {t.skipForNow}
            </Button>
            <Button
              className="cursor-pointer flex items-center gap-2"
              onClick={handleCompleteSetup}
              disabled={bio.length < minCharacters || isCompleting}
            >
              {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.completeSetupArrow}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
