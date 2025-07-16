"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TalentHomePage() {
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTalent = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data, error } = await supabase
        .from("talents")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      if (error) console.error(error);
      setTalent(data);
      setLoading(false);
    };

    fetchTalent();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); 
  };

  if (loading) return <p className="p-6">Loading your profile...</p>;

  if (!talent)
    return <p className="p-6 text-red-500">No profile found. Please complete onboarding.</p>;

  return (
    <main className="max-w-2xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">🎓 Talent Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, {talent.full_name || "Talent"} 👋</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Bio:</strong> {talent.bio || "Not added yet"}</p>
          <p><strong>Skills:</strong> {talent.skills?.join(", ") || "None listed"}</p>
          <p><strong>Resume Uploaded:</strong> {talent.resume_url ? "✅ Yes" : "❌ No"}</p>
        </CardContent>
      </Card>
    </main>
  );
}
