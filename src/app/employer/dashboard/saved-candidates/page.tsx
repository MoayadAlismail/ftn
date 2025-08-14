"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import LoadingAnimation from "@/components/loadingAnimation";

interface SavedCandidate {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
}

export default function SavedCandidatesPage() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<SavedCandidate[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const employerId = userData.user?.id;
      if (!employerId) {
        setLoading(false);
        return;
      }

      // Fetch saved candidate relations
      const { data: saves, error } = await supabase
        .from("saved_candidates")
        .select("talent_id")
        .eq("employer_id", employerId);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const ids = (saves || []).map((s) => s.talent_id);
      if (ids.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      const { data: talents } = await supabase
        .from("talents")
        .select("id, full_name, email, bio")
        .in("id", ids);

      setCandidates(talents || []);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Candidates</h1>
        <p className="text-gray-600 mt-1">Profiles you bookmarked to revisit later.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingAnimation size="md" text="Loading saved candidates" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center text-gray-600 py-12">No saved candidates yet.</div>
      ) : (
        <div className="space-y-4">
          {candidates.map((c) => (
            <Card key={c.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{c.full_name}</div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Mail className="w-4 h-4 mr-1" />
                      <span>{c.email}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${c.email}`}>Contact</a>
                </Button>
              </div>
              {c.bio && <p className="mt-3 text-sm text-gray-700">{c.bio}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

