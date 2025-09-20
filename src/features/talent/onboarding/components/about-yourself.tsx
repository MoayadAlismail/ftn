"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const minCharacters = 10;
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const handleCompleteSetup = () => {
    if (bio.length < minCharacters) {
      return;
    }
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

          <div className="space-y-2">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I'm a computer science student passionate about AI and machine learning. I enjoy building projects that solve real-world problems..."
              className="w-full h-24 sm:h-28 lg:h-32 text-sm sm:text-base resize-none"
            />
            <p className="text-xs sm:text-sm text-gray-600 text-left">
              {bio.length} characters (minimum {minCharacters})
            </p>
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
              onClick={handleCompleteSetup}
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
              onClick={handleCompleteSetup}
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
