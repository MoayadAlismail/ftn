"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent
} from "@/components/ui/select";
import { getEmbeddingsFromApi } from "@/lib/embedding";
import { extractResumeText } from "@/lib/extract-resume"; 

type Profile = {
  full_name: string;
  bio: string;
  education: string;
  //   available: boolean;
};

export default function OnboardingPage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    bio: "",
    education: ""
  });

  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) return;

      const { data: existing, error } = await supabase
        .from("talents")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("Talent check:", existing, error);

      if (existing) {
        router.replace("/talent/home"); // Already onboarded
      } else {
        setEmail(userData.user?.email || "");
      }
    };

    checkOnboarding();
  }, [router]);

  const handleChange = (field: keyof Profile, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!resumeFile) {
      alert("Please upload your resume");
      return;
    }

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const { data: resumeUpload, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(`resume-${userId}.pdf`, resumeFile, {
        upsert: true
      });

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    console.log("Process block started");
    const resumeText = await extractResumeText(resumeFile);
    console.log("Process block halfway done. finished extracting and now embedding");
    const allText = [resumeText!, skills, profile.bio, profile.education].join(" ");
    console.log("All text for embedding:", allText);
    const embedding = await getEmbeddingsFromApi(allText);
    console.log("Embedding fetched:", embedding);
    console.log("Process block finished");
    

    const newTalent = {
      user_id: userId,
      ...profile,
      email,
      skills: skills.split(",").map((skill) => skill.trim()),
      resume_url: resumeUpload.path,
      embedding
    };




    const { error } = await supabase.from("talents").insert([newTalent]);

    if (error) {
      console.error("Error saving profile:", error.message);
    } else {
      router.push("/talent/home"); // placeholder
    }
  };

  return (
    <main className="max-w-xl mx-auto py-12 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Talent Onboarding</h1>

      <div>
        <Label className="mb-2 block">Full Name</Label>
        <Input
          value={profile.full_name}
          onChange={(e) => handleChange("full_name", e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-2 block">Email</Label>
        <Input value={email} readOnly />
      </div>

      <div>
        <Label className="mb-2 block">About You</Label>
        <Textarea
          value={profile.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-2 block">Education Level</Label>
        <Select onValueChange={(value) => handleChange("education", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select education" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High School">High School</SelectItem>
            <SelectItem value="Bachelor">Bachelor's</SelectItem>
            <SelectItem value="Master">Master's</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Skills (comma separated)</Label>
        <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
      </div>

      <div>
        <Label className="mb-2 block">Upload Resume (PDF)</Label>
        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
        />
      </div>

      <Button className="w-full mt-4" onClick={handleSubmit}>
        Save and Continue
      </Button>
    </main>
  );
}
