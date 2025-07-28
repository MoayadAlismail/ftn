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
  locationPreference: string;
  prev: () => void;
}

export default function AboutYourself({
  bio,
  resumeFile,
  workStylePreference,
  industryPreference,
  locationPreference,
  setBio,
  prev,
}: AboutYourselfProps) {
  const minCharacters = 10;
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const handleCompleteSetup = async () => {
    setIsCompleting(true);
    console.log("Bio:", bio);
    console.log("Resume File:", resumeFile);
    console.log("Work Style Preference:", workStylePreference);
    console.log("Industry Preference:", industryPreference);
    console.log("Location Preference:", locationPreference);
    const user = await supabase.auth.getUser();
    const user_id = user.data.user?.id;
    const { data: resumeUpload } = await supabase.storage
      .from("resumes")
      .upload(`resume-${user_id}.pdf`, resumeFile!, {
        upsert: true,
      });
    const { data, error } = await supabase.from("talents").insert({
      id: user_id,
      user_id: user_id,
      email: user.data.user?.email || "sample@email.com",
      full_name: user.data.user?.user_metadata.name || "John Doe",
      bio: bio,
      work_style_pref: workStylePreference,
      industry_pref: industryPreference,
      location_pref: locationPreference,
      resume_url: resumeUpload?.path,
    });
    if (error) {
      console.error("Error inserting user:", error);
    } else {
      console.log("User inserted:", data);
    }
    setIsCompleting(false);
    router.push("/talent/match-making");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 px-4 mt-10">
      <Card className="w-full max-w-2xl p-8 space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step 4 of 4</span>
            <span>100% Complete</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-blue-600 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 text-center">
          {/* Icon */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <User size={40} className="text-blue-600" />
            <h1 className="text-2xl font-semibold">Tell us about yourself</h1>
            <p className="text-gray-600">
              Write a brief bio to help us match you better
            </p>
          </div>

          <div className="space-y-2">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I'm a computer science student passionate about AI and machine learning. I enjoy building projects that solve real-world problems..."
              className="w-xl h-32"
            />
            <p className="text-sm text-gray-600 text-left">
              {bio.length} characters (minimum {minCharacters})
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button className="cursor-pointer" variant="outline" onClick={prev}>
            Back
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
      </Card>
    </div>
  );
}
