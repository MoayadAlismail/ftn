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

interface AboutYourselfProps {
  bio: string;
  setBio: (bio: string) => void;
  resumeFile: File | null;
  resumeText: string | null; // Add pre-extracted resume text
  workStylePreference: string[];
  industryPreference: string[];
  locationPreference: string[];
  prev: () => void;
  onComplete: () => void;
}

export default function AboutYourself({
  bio,
  resumeFile,
  resumeText,
  workStylePreference,
  industryPreference,
  locationPreference,
  setBio,
  prev,
  onComplete,
}: AboutYourselfProps) {
  const minCharacters = 10;
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const router = useRouter();

  const handleGenerateBio = async () => {
    // Use pre-extracted resume text for fast bio generation
    if (!resumeText) {
      toast.error("Resume text not available. Please try refreshing the page.");
      return;
    }

    setIsGeneratingBio(true);
    
    try {
      // Generate bio using AI
      const result = await generateBioFromResume({
        resumeText,
        workStylePreference,
        industryPreference,
        locationPreference,
      });

      if (result.success && result.bio) {
        setBio(result.bio);
        toast.success("Bio generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate bio");
      }
    } catch (error) {
      console.error("Error generating bio:", error);
      toast.error("An error occurred while generating the bio");
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
            <span>Step 4 of 4</span>
            <span>100% Complete</span>
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
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">Tell us about yourself</h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Write a brief bio to help us match you better
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I'm a computer science student passionate about AI and machine learning. I enjoy building projects that solve real-world problems..."
                className="w-full h-24 sm:h-28 lg:h-32 text-sm sm:text-base resize-none flex-1"
              />
              <div className="flex sm:flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBio}
                  disabled={isGeneratingBio}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  {isGeneratingBio ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGeneratingBio ? "Generating..." : "AI Generate"}
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs sm:text-sm text-gray-600">
                {bio.length} characters (minimum {minCharacters})
              </p>
              {localStorage.getItem("resumeFileBase64") && (
                <p className="text-xs text-blue-600">
                  Resume uploaded ✓
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="block sm:hidden space-y-3 pt-4">
          <Button className="cursor-pointer w-full" variant="outline" onClick={prev}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              className="cursor-pointer flex-1"
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isCompleting}
            >
              Skip for now
            </Button>
            <Button
              className="cursor-pointer flex-1 flex items-center justify-center gap-2"
              onClick={handleCompleteSetup}
              disabled={bio.length < minCharacters || isCompleting}
            >
              {isCompleting && <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />}
              <span className="text-xs sm:text-sm">Complete Setup</span>
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex justify-between pt-4">
          <Button className="cursor-pointer" variant="outline" onClick={prev}>
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              className="cursor-pointer"
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isCompleting}
            >
              Skip for now
            </Button>
            <Button
              className="cursor-pointer flex items-center gap-2"
              onClick={handleCompleteSetup}
              disabled={bio.length < minCharacters || isCompleting}
            >
              {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Complete Setup &rarr;
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
