"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function NewPromptPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const response = await fetch("/api/match", {
      method: "POST",
      body: JSON.stringify(prompt)
    });
    
    const matchesResults = await response.json();
    console.log("🚀 Matches results:", matchesResults);
    setMatches(matchesResults);
    console.log("fetchedMatchesResults: ", matchesResults);
    setLoading(false);
  };

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const { data: matches, error: matchesError } = await supabase
        .from('talents')
        .select();
      if (matchesError) { 
        console.log("matchesError: ", matchesError);
      }
      setMatches(matches || []);
      console.log("matches: ", matches);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  return (
    <main className="max-w-2xl mx-auto py-16 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Create a Prompt</h1>
      <Textarea
        placeholder="Describe the ideal candidate you're looking for..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={6}
      />
      <Button disabled={loading} onClick={handleSubmit}>
        {loading ? "Matching..." : "Run AI Match"}
      </Button>

      {matches && matches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Matching Talents</h2>
          <ul className="space-y-4">
            {matches.map((talent: any) => (
              <li
                key={talent.id}
                className="border rounded-lg p-4 flex flex-col gap-1 bg-gray-50"
              >
                <div className="font-bold text-lg">
                  {talent.full_name || "Unnamed Talent"}
                </div>
                {talent.email && (
                  <div className="text-sm text-gray-600">{talent.email}</div>
                )}
                {talent.skills && (
                  <div className="text-sm">
                    <span className="font-medium">Skills:</span>{" "}
                    {Array.isArray(talent.skills)
                      ? talent.skills.join(", ")
                      : talent.skills}
                  </div>
                )}
                {talent.bio && (
                  <div className="text-sm text-gray-700 mt-1">{talent.bio}</div>
                )}
                {talent.similarity && (
                  <div className="text-sm text-green-700 mt-1">
                    Similarity: {(talent.similarity * 100).toFixed(2)}%
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {matches && matches.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          No matching talents found for this prompt.
        </div>
      )}
    </main>
  );
}
