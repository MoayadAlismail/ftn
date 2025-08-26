"use client";

import { Suspense } from "react";
import EmployerDashboardHomeSkeleton from "./skeleton";
import EmployerDashboardHomeContent from "./content";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useRouter } from "next/navigation";
import PostOpp from "./components/post-opp";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Talent {
  id: any;
  name?: string;
  full_name?: string;
  email: string;
  bio: string;
  location_pref: string | string[];
  industry_pref: string[];
  work_style_pref: string[];
  resume_url?: string;
  created_at?: string;
}

export default function EmployerDashboardHome() {
  const router = useRouter();

  const [mode, setMode] = useState<"search" | "post">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("activeTab") || params.get("mode");
      return q === "post" ? "post" : "search";
    }
    return "search";
  });

  const [prompt, setprompt] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<Talent[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [inviteOpenId, setInviteOpenId] = useState<any | null>(null);
  const [inviteMessages, setInviteMessages] = useState<Record<string, string>>({});
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("activeTab", mode === "post" ? "post" : "find");
    window.history.replaceState({}, "", url.toString());
  }, [mode]);

  const handleSuggestionClick = (suggestion: string) => {
    setprompt(suggestion);
  };

  const handleSearch = async () => {
    setLoading(true);
    setShowResults(true);
    if (!prompt.trim()) return;

    const response = await fetch("/api/match", {
      method: "POST",
      body: JSON.stringify(prompt),
    });

    const matchesResults = await response.json();
    setMatches(matchesResults);
    setLoading(false);
  };

  const handleOpenInvite = (talentId: any) => {
    setInviteOpenId((prev: any | null) => (prev === talentId ? null : talentId));
  };

  const saveCandidate = async (talentId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const employerId = userData.user?.id;
      if (!employerId) return;
      await supabase.from("saved_candidates").insert({ employer_id: employerId, talent_id: talentId });
      toast.success("Candidate saved");
    } catch (e) {
      toast.error("Unable to save candidate");
    }
  };

  const handleInviteMessageChange = (talentId: any, message: string) => {
    const key = String(talentId);
    setInviteMessages((prev) => ({ ...prev, [key]: message }));
  };

  const handleSendInvite = async (talentId: any) => {
    try {
      const key = String(talentId);
      const message = (inviteMessages[key] || "").trim();
      if (!message) {
        toast.error("Please enter a message");
        return;
      }
      setInvitingId(key);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.id) {
        toast.error("You must be signed in as an employer");
        return;
      }
      const employerId = userData.user.id;
      const { error } = await supabase
        .from("invites")
        .insert([{ employer_id: employerId, talent_id: talentId, message }]);
      if (error) {
        toast.error(error.message || "Failed to send invite");
        return;
      }
      setInvitedIds((prev) => new Set(prev).add(key));
      setInviteOpenId(null);
      toast.success("Invite sent");
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <Suspense fallback={<EmployerDashboardHomeSkeleton />}>
      <EmployerDashboardHomeContent />
    </Suspense>
  );
}
