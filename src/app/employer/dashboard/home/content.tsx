"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShineBorder } from "@/components/magicui/shine-border";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  WandSparkles,
  Mail,
  Users2,
  Loader2,
  User,
  FileText,
  Filter,
  RefreshCw,
  Sparkles,
  List
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import CandidateProfileModal from "@/features/employer/dashboard/components/candidate-profile-modal";
import { useLanguage } from "@/contexts/LanguageContext";
import { employerTranslations } from "@/lib/language";

const suggestions = [
  "Software engineer intern with Python and React skills",
  "Finance major with experience in data analysis and Excel",
  "Marketing student for a social media internship at a startup",
];

interface Talent {
  id: any;
  name?: string;
  full_name?: string;
  email: string;
  bio: string;
  location_pref: string | string[];
  industry_pref: string[];
  work_style_pref: string[];
  skills?: string[];
  resume_url?: string;
  created_at?: string;
}

export default function EmployerDashboardHomeContent() {
  const { user, authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = employerTranslations[language];
  
  // Talent display states
  const [allTalents, setAllTalents] = useState<Talent[]>([]);
  const [displayedTalents, setDisplayedTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  
  // AI Match states
  const [prompt, setprompt] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [workStyleFilter, setWorkStyleFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Shared states
  const [inviteOpenId, setInviteOpenId] = useState<any | null>(null);
  const [inviteMessages, setInviteMessages] = useState<Record<string, string>>({});
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [savedCandidatesIds, setSavedCandidatesIds] = useState<Set<String>>(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState<Talent | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchSavedCandidates = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("saved_candidates")
        .select("talent_id")
        .eq("employer_id", user.id);
      console.log("saved candidates:", data);
      setSavedCandidatesIds(
        new Set(data?.map((item) => String(item.talent_id)) || [])
      );
    };
    fetchSavedCandidates();
  }, [user]);

  useEffect(() => {
    const fetchInvitedCandidates = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("invites")
        .select("talent_id")
        .eq("employer_id", user.id);
      console.log("invited candidates:", data);
      setInvitedIds(new Set(data?.map((item) => String(item.talent_id)) || []));
    };
    fetchInvitedCandidates();
  }, [user]);

  // Load all talents on mount
  useEffect(() => {
    loadAllTalents();
  }, []);

  // Apply filters when search or filter values change (only in browse mode)
  useEffect(() => {
    if (!isAIMode) {
      applyFilters();
    }
  }, [allTalents, searchQuery, locationFilter, industryFilter, workStyleFilter, isAIMode]);

  const loadAllTalents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('talents')
        .select(`
          id,
          full_name,
          email,
          bio,
          location_pref,
          industry_pref,
          work_style_pref,
          skills,
          resume_url,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedTalents: Talent[] = (data || []).map(talent => ({
        id: talent.id,
        name: talent.full_name || 'Candidate',
        full_name: talent.full_name || 'Candidate',
        email: talent.email || '',
        bio: talent.bio || '',
        location_pref: talent.location_pref || [],
        industry_pref: talent.industry_pref || [],
        work_style_pref: talent.work_style_pref || [],
        skills: talent.skills || [],
        resume_url: talent.resume_url,
        created_at: talent.created_at
      }));

      setAllTalents(transformedTalents);
      setDisplayedTalents(transformedTalents);
    } catch (error) {
      console.error('Error loading talents:', error);
      toast.error(t.failedToLoadTalents);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTalents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(talent =>
        talent.name?.toLowerCase().includes(query) ||
        talent.email.toLowerCase().includes(query) ||
        talent.bio.toLowerCase().includes(query) ||
        talent.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter(talent => {
        const locations = Array.isArray(talent.location_pref) ? talent.location_pref : [talent.location_pref];
        return locations.some(loc => loc && loc.toString().toLowerCase().includes(locationFilter.toLowerCase()));
      });
    }

    // Industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(talent =>
        talent.industry_pref.some(ind => ind.toLowerCase() === industryFilter.toLowerCase())
      );
    }

    // Work Style filter
    if (workStyleFilter !== "all") {
      filtered = filtered.filter(talent =>
        talent.work_style_pref.some(ws => ws.toLowerCase() === workStyleFilter.toLowerCase())
      );
    }

    setDisplayedTalents(filtered);
  };

  const getUniqueLocations = () => {
    const locations = new Set<string>();
    allTalents.forEach(talent => {
      const locs = Array.isArray(talent.location_pref) ? talent.location_pref : [talent.location_pref];
      locs.forEach(loc => {
        if (loc && typeof loc === 'string') locations.add(loc);
      });
    });
    return Array.from(locations).sort();
  };

  const getUniqueIndustries = () => {
    const industries = new Set<string>();
    allTalents.forEach(talent => {
      talent.industry_pref.forEach(ind => {
        if (ind) industries.add(ind);
      });
    });
    return Array.from(industries).sort();
  };

  const getUniqueWorkStyles = () => {
    const workStyles = new Set<string>();
    allTalents.forEach(talent => {
      talent.work_style_pref.forEach(ws => {
        if (ws) workStyles.add(ws);
      });
    });
    return Array.from(workStyles).sort();
  };

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setprompt(suggestion);
  }, []);

  const handleAISearch = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error(t.pleaseDescribeCandidate);
      return;
    }

    setLoading(true);
    setIsAIMode(true);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        body: JSON.stringify(prompt),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const matchesResults = await response.json();
      console.log("AI Search matches:", matchesResults);
      
      // Ensure we have an array to work with
      const resultsArray = Array.isArray(matchesResults) ? matchesResults : [];
      
      // Transform AI results to match Talent interface
      const transformedMatches: Talent[] = resultsArray.map((talent: any) => ({
        id: talent.id,
        name: talent.full_name || 'Candidate',
        full_name: talent.full_name || 'Candidate',
        email: talent.email || '',
        bio: talent.bio || '',
        location_pref: talent.location_pref || [],
        industry_pref: talent.industry_pref || [],
        work_style_pref: talent.work_style_pref || [],
        skills: talent.skills || [],
        resume_url: talent.resume_url,
        created_at: talent.created_at
      }));

      setDisplayedTalents(transformedMatches);
      
      if (transformedMatches.length === 0) {
        toast.info(t.noMatchingCandidates);
      }
    } catch (error) {
      console.error("AI Search error:", error);
      toast.error(t.aiSearchFailed);
      setIsAIMode(false);
    } finally {
      setLoading(false);
    }
  }, [prompt, t]);

  const handleClearAISearch = () => {
    setprompt("");
    setIsAIMode(false);
    applyFilters(); // Go back to filtered view
  };

  const handleOpenInvite = useCallback((talentId: any) => {
    setInviteOpenId((prev: any | null) =>
      prev === talentId ? null : talentId
    );
  }, []);

  const saveCandidate = async (talentId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const employerId = userData.user?.id;
      console.log("employer id:", employerId);
      if (!employerId) return;
      await supabase
        .from("saved_candidates")
        .insert({ employer_id: employerId, talent_id: talentId });
      setSavedCandidatesIds((prev) => new Set(prev).add(talentId));
      toast.success(t.candidateSaved);
    } catch (e) {
      toast.error(t.unableToSaveCandidate);
    }
  };

  const handleViewProfile = useCallback((talent: Talent) => {
    setSelectedCandidate(talent);
    setIsProfileModalOpen(true);
  }, []);

  const handleCloseProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
    setSelectedCandidate(null);
  }, []);

  const handleInviteMessageChange = useCallback(
    (talentId: any, message: string) => {
      const key = String(talentId);
      setInviteMessages((prev) => ({ ...prev, [key]: message }));
    },
    []
  );

  const handleSendInvite = async (talentId: any) => {
    try {
      const key = String(talentId);
      const message = (inviteMessages[key] || "").trim();
      if (!message) {
        toast.error(t.pleaseEnterMessage);
        return;
      }
      setInvitingId(key);
      const employerId = user!.id;
      const { error } = await supabase
        .from("invites")
        .insert([{ employer_id: employerId, talent_id: talentId, message }]);
      if (error) {
        toast.error(error.message || t.failedToSendInvite);
        return;
      }
      setInvitedIds((prev) => new Set(prev).add(key));
      setInviteOpenId(null);
      toast.success(t.inviteSent);
    } catch (e) {
      toast.error(t.somethingWentWrong);
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-4 md:space-y-0 md:flex md:items-start md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {t.findTalent}
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {t.findTalentSubtitle}
          </p>
        </div>
      </div>

      {/* AI Search Box - Compact */}
      <div className="relative overflow-hidden rounded-xl p-3 md:p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
        <div className="flex gap-2 md:gap-3">
          <div className="flex-1 relative">
            <WandSparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-violet-600" />
            <Input
              placeholder={t.aiSearchPlaceholder}
              value={prompt}
              onChange={(e) => setprompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
              className="pl-10 h-12 md:h-12 border-violet-200 focus:border-violet-400 bg-white"
            />
          </div>
          <Button
            className="px-4 md:px-6 h-12 md:h-12 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
            onClick={handleAISearch}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t.search}</span>
              </>
            )}
          </Button>
          {isAIMode && (
              <Button
              variant="outline"
              size="sm"
              onClick={handleClearAISearch}
              className="h-12 md:h-12"
            >
              {t.clear}
              </Button>
          )}
          </div>

          {/* Sample searches */}
        {!isAIMode && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <WandSparkles className="w-3.5 h-3.5 text-violet-600" />
              <span className="font-medium">{t.orTrySampleSearch}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-2 px-3 text-xs text-gray-700 border-violet-200 hover:bg-violet-50 hover:border-violet-300 whitespace-normal break-words"
                  onClick={() => handleSuggestionClick(s)}
                >
                  <span className="leading-tight">{s}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
          </div>

      {/* Filters Section */}
      {!isAIMode && (
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {t.searchCandidates}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t.filters}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t.location}
                    </label>
                    <Select
                      value={locationFilter}
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={t.allLocations} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allLocations}</SelectItem>
                        {getUniqueLocations().map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t.industry}
                    </label>
                    <Select
                      value={industryFilter}
                      onValueChange={setIndustryFilter}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={t.allIndustries} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allIndustries}</SelectItem>
                        {getUniqueIndustries().map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t.workStyle}
                    </label>
                    <Select
                      value={workStyleFilter}
                      onValueChange={setWorkStyleFilter}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={t.allWorkStyles} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allWorkStyles}</SelectItem>
                        {getUniqueWorkStyles().map((workStyle) => (
                          <SelectItem key={workStyle} value={workStyle}>
                            {workStyle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
      ) : displayedTalents.length === 0 ? (
        <Card>
          <CardContent className="py-8 md:py-12 text-center px-4">
            <Users2 className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              {allTalents.length === 0
                ? t.noCandidatesYet
                : t.noCandidatesMatchFilters}
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              {allTalents.length === 0
                ? ""
                : t.tryAdjustingFilters}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {t.matchingTalents}
            </h2>
            <span className="text-sm text-gray-600">
              {displayedTalents.length} {displayedTalents.length === 1 ? t.candidate : t.candidates}
            </span>
          </div>

          <div className="space-y-4">
            {displayedTalents.map((talent, index) => (
                    <motion.div
                      key={talent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
              <Card
                className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewProfile(talent)}
              >
                {/* Mobile Layout - Stack vertically */}
                <div className="block sm:hidden space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold truncate">
                        {talent.name}
                      </h4>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{talent.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="flex gap-2 bg-gray-50/50 p-3 rounded-md">
                    <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {talent.bio}
                    </p>
                  </div>

                  {/* Work Style */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500">
                      {t.workStyleLabel}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {talent.work_style_pref.map((pref, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons - Mobile */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="w-full cursor-pointer bg-primary hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInvite(talent.id);
                      }}
                      disabled={invitedIds.has(String(talent.id))}
                    >
                      {invitedIds.has(String(talent.id)) ? t.invited : t.invite}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveCandidate(String(talent.id));
                      }}
                      disabled={savedCandidatesIds.has(String(talent.id))}
                    >
                      {savedCandidatesIds.has(String(talent.id))
                        ? t.saved
                        : t.save}
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout - Original horizontal layout */}
                <div className="hidden sm:block space-y-4">
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
                              <Button
                                variant="outline"
                                size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveCandidate(String(talent.id));
                        }}
                        disabled={savedCandidatesIds.has(String(talent.id))}
                              >
                                {savedCandidatesIds.has(String(talent.id))
                                  ? t.saved
                                  : t.save}
                              </Button>
                              <Button
                                size="sm"
                                className="cursor-pointer bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInvite(talent.id);
                        }}
                                disabled={invitedIds.has(String(talent.id))}
                              >
                                {invitedIds.has(String(talent.id))
                                  ? t.invited
                                  : t.invite}
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
                                <div className="text-xs font-medium text-gray-500 mb-1">
                                  {t.workStyleLabel}
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
                          </div>

                {/* Invite Message Section - Works for both mobile and desktop */}
                          {inviteOpenId === talent.id && (
                            <div className="mt-4 border rounded-md p-3 bg-gray-50/50">
                              <div className="text-xs font-medium text-gray-500 mb-2">
                                {t.messageToCandidate}
                              </div>
                              <Textarea
                                placeholder={`Hi ${
                                  talent.name?.split(" ")[0] || "there"
                                }, I think you'd be a great fit...`}
                      className="min-h-[70px] sm:min-h-[90px] text-sm"
                                value={inviteMessages[String(talent.id)] || ""}
                                onChange={(e) =>
                        handleInviteMessageChange(talent.id, e.target.value)
                                }
                              />
                    <div className="mt-2 flex flex-col sm:flex-row items-center gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                        className="w-full sm:w-auto cursor-pointer"
                                  onClick={() => setInviteOpenId(null)}
                                >
                                  {t.cancel}
                                </Button>
                                <Button
                                  size="sm"
                        className="w-full sm:w-auto cursor-pointer bg-primary hover:bg-primary/90"
                                  onClick={() => handleSendInvite(talent.id)}
                                  disabled={invitingId === String(talent.id)}
                                >
                                  {invitingId === String(talent.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    t.sendInvite
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
        </>
      )}

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        candidate={{
          id: selectedCandidate?.id || "",
          full_name: selectedCandidate?.name || "",
          email: selectedCandidate?.email || "",
          bio: selectedCandidate?.bio || "",
          location_pref: selectedCandidate?.location_pref || [],
          industry_pref: selectedCandidate?.industry_pref || [],
          work_style_pref: selectedCandidate?.work_style_pref || [],
          resume_url: selectedCandidate?.resume_url,
          created_at: selectedCandidate?.created_at || "",
        }}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        onSave={(candidateId: string) => saveCandidate(candidateId)}
        onUnsave={(candidateId: string) => {
          // Handle unsave if needed
          console.log("Unsave candidate:", candidateId);
        }}
      />
    </div>
  );
}
