"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User } from "lucide-react";
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

  const handleCompleteSetup = () => {
    setIsCompleting(true);
    console.log("Bio:", bio);
    console.log("Resume File:", resumeFile);
    console.log("Work Style Preference:", workStylePreference);
    console.log("Industry Preference:", industryPreference);
    console.log("Location Preference:", locationPreference);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 px-4 mt-10">
      <Card className="w-full max-w-2xl p-8 space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>الخطوة 4 من 4</span>
            <span>100% مكتمل</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 text-center">
          {/* Icon */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <User size={40} className="text-primary" />
            <h1 className="text-2xl font-semibold">أخبرنا عن نفسك</h1>
            <p className="text-gray-600">
              اكتب نبذة مختصرة لمساعدتنا في إيجاد مطابقات أفضل لك
            </p>
          </div>

          <div className="space-y-2">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="أنا طالب علوم حاسب شغوف بالذكاء الاصطناعي والتعلم الآلي. أستمتع ببناء مشاريع تحل مشاكل حقيقية..."
              className="w-xl h-32"
            />
            <p className="text-sm text-gray-600 text-right">
              {bio.length} حرف (الحد الأدنى {minCharacters})
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button className="cursor-pointer" variant="outline" onClick={prev}>
            السابق
          </Button>
          <Button
            className="cursor-pointer flex items-center gap-2"
            onClick={handleCompleteSetup}
            disabled={bio.length < minCharacters || isCompleting}
          >
            {isCompleting && (<Loader2 className="h-4 w-4 animate-spin" />)}
            إكمال الإعداد &larr;
          </Button>
        </div>
      </Card>
    </div>
  );
}
