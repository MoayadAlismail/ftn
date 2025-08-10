"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { variants } from "@/constants/constants";
import {
  Search,
  WandSparkles,
  Briefcase,
  Mail,
  Users2,
  Loader2,
  User,
  FileText,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PostOpp from "./components/post-opp";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const suggestions = [
  "Software engineer intern with Python and React skills",
  "Finance major with experience in data analysis and Excel",
  "Marketing student for a social media internship at a startup",
];

interface Talent {
  id: any;
  name: string;
  email: string;
  bio: string;
  location_pref: string;
  industry_pref: string[];
  work_style_pref: string[];
}

export default function EmployerDashboardHome() {
  // Initialize with URL search params to prevent flash
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get("activeTab") || "find";
    }
    return "find";
  });

  const [prompt, setprompt] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<Talent[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [inviteOpenId, setInviteOpenId] = useState<any | null>(null);
  const [inviteMessages, setInviteMessages] = useState<Record<string, string>>({});
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("activeTab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  const handleSuggestionClick = (suggestion: string) => {
    setprompt(suggestion);
  };

  const handleSearch = async () => {
    setLoading(true);
    setShowResults(true);
    if (!prompt.trim()) return;

    // const { data: userData } = await supabase.auth.getUser();
    // const userId = userData.user?.id;

    const response = await fetch("/api/match", {
      method: "POST",
      body: JSON.stringify(prompt),
    });

    const matchesResults = await response.json();
    console.log("🚀 Matches results:", matchesResults);
    setMatches(matchesResults);
    console.log("fetchedMatchesResults: ", matchesResults);
    setLoading(false);
  };

  const handleOpenInvite = (talentId: any) => {
    setInviteOpenId((prev: any | null) => (prev === talentId ? null : talentId));
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
    <div className="container flex flex-col gap-2 mx-auto max-w-5xl">
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="min-w-full flex flex-row mb-3 items-center justify-center rounded-none">
          <TabsTrigger
            value="find"
            className="text-sm rounded-none cursor-pointer"
          >
            Find Candidates
          </TabsTrigger>
          <TabsTrigger
            value="post"
            className="text-sm rounded-none cursor-pointer"
          >
            Post an Opportunity
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === "find" && (
              <motion.div
                key="find"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.25 }}
                className="absolute w-full"
              >
                <Card className="p-6 rounded-none mb-6">
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                      <Search className="mr-1" />
                      <h2 className="text-xl font-bold">AI Candidate Finder</h2>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Describe your ideal candidate, and we&apos;ll find
                      matching student profiles
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="e.g., Looking for a proactive computer science student skilled in Python and React for a summer internship. Should have experience with cloud platforms like AWS..."
                      className="min-h-[120px]"
                      value={prompt}
                      onChange={(e) => setprompt(e.target.value)}
                    />
                    <div className="flex flex-row items-center text-xs text-gray-500 font-medium">
                      <span>
                        <WandSparkles size={13} className="mr-1" />
                      </span>
                      Or try a sample search:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="cursor-pointer border"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                    <Button
                      className="w-full cursor-pointer bg-primary hover:bg-primary/90"
                      onClick={handleSearch}
                    >
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Find Matching Candidates
                    </Button>
                  </div>
                </Card>
                {showResults && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">
                          Matching Talents
                        </h3>
                        <span className="text-sm text-gray-500">
                          {matches.length} matches found
                        </span>
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid gap-4"
                      >
                        {matches.map((talent, index) => (
                          <motion.div
                            key={talent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.1,
                            }}
                          >
                            <Card className="p-6 hover:shadow-md transition-shadow">
                              <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-semibold">
                                        {talent.name}
                                      </h4>
                                      <div className="flex items-center text-gray-500 text-sm">
                                        <Mail className="w-4 h-4 mr-1" />
                                        <span>{talent.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                      View Profile
                                    </Button>
                                    <Button
                                      variant="default"
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
                                  <p className="text-gray-600 text-sm">
                                    {talent.bio}
                                  </p>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-start gap-2">
                                    <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
                                    <div>
                                      <div className="text-xs font-medium text-gray-500 mb-1">
                                        Industry Preferences
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {talent.industry_pref.map((pref, i) => (
                                          <span
                                            key={i}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                          >
                                            {pref}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2">
                                    <Users2 className="w-4 h-4 text-gray-400 mt-1" />
                                    <div>
                                      <div className="text-xs font-medium text-gray-500 mb-1">
                                        Work Style
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {talent.work_style_pref.map((pref, i) => (
                                          <span
                                            key={i}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                                          >
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
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer"
                                        onClick={() => setInviteOpenId(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="cursor-pointer bg-primary hover:bg-primary/90"
                                        onClick={() => handleSendInvite(talent.id)}
                                        disabled={invitingId === String(talent.id)}
                                      >
                                        {invitingId === String(talent.id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          "Send Invite"
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === "post" && (
              <motion.div
                key="post"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.25 }}
                className="absolute w-full"
              >
                <PostOpp />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}