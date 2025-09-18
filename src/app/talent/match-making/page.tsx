"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import InProgress from "./components/in-progress";
import OppMatchResults from "./components/opp-match-results";


export default function MatchMakingPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isMatchesLoading, setIsMatchesLoading] = useState<boolean>(false);
  const [oppMatches, setOppMatches] = useState<[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    const processUser = async () => {
      const user = await supabase.auth.getUser();
      const user_id = user.data.user?.id;
      const { data, error } = await supabase
        .from("talents")
        .select("*")
        .eq("id", user_id)
        .maybeSingle();
      console.log("id", user_id);
      if (!data || error) {
        console.error("Error fetching user:", error);
      }
      const userData = data;
      console.log("User:", userData);
      if (userData.embedding) {
        // router.push("/talent/home");
        await processMatchMaking();
        return;
      }
      // Fetch resume file from Supabase storage
      const { data: resumeData, error: resumeError } = await supabase.storage
        .from("resumes")
        .download(userData.resume_url);

      if (resumeError) {
        console.error("Error downloading resume:", resumeError);
        return;
      }

      // Convert blob to File object
      const resumeFile = new File(
        [resumeData],
        userData.resume_url.split("/").pop() || "resume.pdf",
        {
          type: "application/pdf",
        }
      );

      console.log("Resume file loaded:", resumeFile);
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch("/api/extract-resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        alert("Failed to extract resume text");
        return null;
      }
      const extractedData = await res.json();
      console.log(
        "Response from resume extraction fetcheddddd:",
        extractedData
      );
      const allText = [
        extractedData!,
        userData.bio,
        userData.work_style_pref.join(", "),
        userData.industry_pref.join(", "),
        userData.location_pref,
        // userData.skills.join(", ") || " ",
      ].join(" ");
      console.log("All text:", allText);
      const response = await fetch("/api/get-embedding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allText),
      });

      if (!response.ok) {
        console.error(
          "Failed to fetch embeddings:",
          await response.json(),
          "status::",
          response.statusText
        );
        return null;
      }
      const embeddingData = await response.json();
      console.log("Api response refined:", embeddingData.embeddings[0].values);
      await supabase
        .from("talents")
        .update({ embedding: embeddingData.embeddings[0].values })
        .eq("id", user_id);
    };

    const processMatchMaking = async () => {
      setIsMatchesLoading(true);

      const user = await supabase.auth.getUser();
      const user_id = user.data.user?.id;
      const response = await fetch("/api/match-opps", {
        method: "POST",
        body: JSON.stringify({ id: user_id }),
      });

      const matchesResults = await response.json();
      console.log("🚀 Matches results:", matchesResults);
      setOppMatches(matchesResults);
      console.log("fetchedMatchesResults: ", matchesResults);
      setIsMatchesLoading(false);
      setIsScanning(false);
      setShowResults(true);
    };
    processUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {isScanning && <InProgress />}
      {/* {isMatchesLoading && </>} */}
      {showResults && (
        <div className="w-full">
          <OppMatchResults
            opportunities={oppMatches}
            isLoading={isMatchesLoading}
          />
        </div>
      )}
    </div>
  );
}
