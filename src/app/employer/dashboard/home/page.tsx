"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  WandSparkles,
  Mail,
  Users2,
  Loader2,
  User,
  FileText,
  Plus,
  ChevronLeft,
} from "lucide-react";
import PostOpp from "./components/post-opp";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const suggestions = [
  "Software engineer intern with Python and React skills",
  "Finance major with experience in data analysis and Excel",
  "Marketing student for a social media internship at a startup",
];

interface Talent {
  id: string;
  name: string;
  email: string;
  bio: string;
  location_pref: string;
  industry_pref: string[];
  work_style_pref: string[];
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
  const [inviteOpenId, setInviteOpenId] = useState<string | null>(null);
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

  const handleOpenInvite = (talentId: string) => {
    setInviteOpenId((prev: string | null) => (prev === talentId ? null : talentId));
  };

  const saveCandidate = async (talentId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const employerId = userData.user?.id;
      if (!employerId) return;
      await supabase.from("saved_candidates").insert({ employer_id: employerId, talent_id: talentId });
      toast.success("Candidate saved");
    } catch {
      toast.error("Unable to save candidate");
    }
  };

  const handleInviteMessageChange = (talentId: any, message: string) => {
    const key = String(talentId);
    setInviteMessages((prev) => ({ ...prev, [key]: message }));
  };

  const handleSendInvite = async (talentId: string) => {
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
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-10">
      {/* Subtle gradient background glow */}
      <div className="pointer-events-none absolute -z-10 inset-0">
        <div className="absolute top-24 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-24 right-10 w-80 h-80 rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      {/* No floating (+) here per request */}

      <AnimatePresence mode="wait">
        {mode === "search" ? (
          <motion.div
            key="search-ui"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Heading */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center text-5xl mb-3">✌️</div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                Find the perfect fit for any role
              </h1>
            </div>

            {/* Search box */}
            <div className="relative overflow-hidden rounded-3xl p-4 sm:p-6 bg-white/80 backdrop-blur border border-transparent shadow-[0_10px_40px_-10px_rgba(148,74,219,0.25)]">
              <ShineBorder
                borderWidth={2}
                duration={16}
                shineColor={["#c084fc", "#a78bfa", "#c084fc"]}
                className="opacity-70"
              />
              <Textarea
                placeholder="Describe your ideal candidate, and we’ll find matching student profile."
                className="min-h-[120px] text-base md:text-lg border-0 focus:border-transparent focus-visible:ring-0 outline-none bg-transparent resize-none rounded-2xl placeholder:text-gray-500/80"
                value={prompt}
                onChange={(e) => setprompt(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <Button
                  className="px-6 md:px-8 h-11 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg"
                  onClick={handleSearch}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Sample searches */}
            <div className="mt-6">
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <WandSparkles className="w-4 h-4 mr-2 text-primary" />
                Or try a sample search:
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestions.map((s, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start h-auto py-3 text-gray-700 border-violet-200 hover:bg-violet-50"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results */}
            {showResults && (
              <div className="mt-10 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Matching Talents</h3>
                  <span className="text-sm text-gray-500">{matches.length} matches found</span>
                </div>
                <div className="grid gap-4">
                  {matches.map((talent, index) => (
                    <motion.div
                      key={talent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:shadow-md transition-shadow">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold">{talent.name}</h4>
                                <div className="flex items-center text-gray-500 text-sm">
                                  <Mail className="w-4 h-4 mr-1" />
                                  <span>{talent.email}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => saveCandidate(String(talent.id))}>Save</Button>
                              <Button
                                size="sm"
                                className="cursor-pointer bg-primary hover:bg-primary/90"
                                onClick={() => handleOpenInvite(talent.id)}
                                disabled={invitedIds.has(String(talent.id))}
                              >
                                {invitedIds.has(String(talent.id)) ? "Invited" : "Invite"}
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-2 bg-gray-50/50 p-3 rounded-md">
                            <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <p className="text-gray-600 text-sm">{talent.bio}</p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <Users2 className="w-4 h-4 text-gray-400 mt-1" />
                              <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">Work Style</div>
                                <div className="flex flex-wrap gap-2">
                                  {talent.work_style_pref.map((pref, i) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      {pref}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {inviteOpenId === talent.id && (
                            <div className="mt-4 border rounded-md p-3 bg-gray-50/50">
                              <div className="text-xs font-medium text-gray-500 mb-2">Message to candidate</div>
                              <Textarea
                                placeholder={`Hi ${talent.name?.split(" ")[0] || "there"}, I think you'd be a great fit...`}
                                className="min-h-[90px]"
                                value={inviteMessages[String(talent.id)] || ""}
                                onChange={(e) => handleInviteMessageChange(talent.id, e.target.value)}
                              />
                              <div className="mt-2 flex items-center gap-2 justify-end">
                                <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setInviteOpenId(null)}>Cancel</Button>
                                <Button size="sm" className="cursor-pointer bg-primary hover:bg-primary/90" onClick={() => handleSendInvite(talent.id)} disabled={invitingId === String(talent.id)}>
                                  {invitingId === String(talent.id) ? (<Loader2 className="h-4 w-4 animate-spin" />) : ("Send Invite")}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="post-ui"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Post a New Opportunity</h2>
            </div>
            <PostOpp />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
