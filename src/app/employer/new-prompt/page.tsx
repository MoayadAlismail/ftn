"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function NewPromptPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    // 1. Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    // 2. Fetch all talents
    const { data: talents, error: talentsError } = await supabase
      .from("talents")
      .select("*");

    if (talentsError) {
      alert("Failed to load talents");
      setLoading(false);
      return;
    }

    // 3. Call Gemini API to match
    const response = await fetch("/api/match", {
      method: "POST",
      body: JSON.stringify({ prompt, talents }),
    });

    const { matches } = await response.json();

    // 4. Store the prompt in Supabase
    const { data: newPrompt, error: promptError } = await supabase
      .from("prompts")
      .insert({
        prompt,
        employer_id: userId,
      })
      .select()
      .single();

    if (promptError) {
      alert("Failed to save prompt");
      setLoading(false);
      return;
    }

    // 5. Store prompt_results
    const rows = matches.map((match: any) => ({
      prompt_id: newPrompt.id,
      talent_id: match.id,
    }));

    await supabase.from("prompt_results").insert(rows);

    setLoading(false);
    router.push(`/employer/prompt/${newPrompt.id}`);
  };

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
    </main>
  );
}
