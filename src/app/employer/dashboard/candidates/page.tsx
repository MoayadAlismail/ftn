"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  RefreshCw,
  Loader2,
  Calendar,
  Filter,
  Search,
  Users,
  Download,
  Send,
  BookmarkCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import LoadingAnimation from "@/components/loadingAnimation";
import CandidateCard from "@/features/employer/dashboard/components/candidate-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { employerTranslations } from "@/lib/language";

interface SavedCandidate {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  location_pref?: string[];
  industry_pref?: string[];
  work_style_pref?: string[];
  resume_url?: string;
  created_at?: string;
  saved_at?: string;
}

function CandidatesPageContent() {
  const { user, authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = employerTranslations[language];
  const router = useRouter();
  
  // Shared states
  const [activeTab, setActiveTab] = useState("saved");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Saved candidates states
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const [filteredSavedCandidates, setFilteredSavedCandidates] = useState<SavedCandidate[]>([]);
  const [savedSearchQuery, setSavedSearchQuery] = useState("");
  const [savedFilterBy, setSavedFilterBy] = useState("all");

  // Load saved candidates
  const loadSavedCandidates = useCallback(async (showRefreshToast = false) => {
    try {
      const employerId = user!.id;
      
      if (!employerId) {
        toast.error(t.loginToViewSaved);
        return;
      }

      // Fetch saved candidate relations with timestamp
      const { data: saves, error: savesError } = await supabase
        .from("saved_candidates")
        .select("talent_id, created_at")
        .eq("employer_id", employerId)
        .order("created_at", { ascending: false });

      if (savesError) {
        console.error("Error fetching saves:", savesError);
        if (!showRefreshToast) toast.error(t.failedToLoadSavedCandidates);
        return;
      }

      if (!saves || saves.length === 0) {
        setSavedCandidates([]);
        setFilteredSavedCandidates([]);
        return;
      }

      const talentIds = saves.map((s) => s.talent_id);

      // Fetch detailed talent information
      const { data: talents, error: talentsError } = await supabase
        .from("talents")
        .select(`*`)
        .in("id", talentIds);

      if (talentsError) {
        console.error("Error fetching talents:", talentsError);
        if (!showRefreshToast) toast.error(t.failedToLoadCandidateDetails);
        return;
      }

      // Merge saved timestamp with talent data
      const enrichedCandidates = (talents || []).map((talent) => {
        const saveData = saves.find((s) => s.talent_id === talent.id);
        return {
          ...talent,
          location_pref: Array.isArray(talent.location_pref)
            ? talent.location_pref
            : talent.location_pref
            ? String(talent.location_pref)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          industry_pref: Array.isArray(talent.industry_pref)
            ? talent.industry_pref
            : talent.industry_pref
            ? String(talent.industry_pref)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          work_style_pref: Array.isArray(talent.work_style_pref)
            ? talent.work_style_pref
            : talent.work_style_pref
            ? String(talent.work_style_pref)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          saved_at: saveData?.created_at,
          isSaved: true,
        };
      });

      setSavedCandidates(enrichedCandidates);
      setFilteredSavedCandidates(enrichedCandidates);
    } catch (error) {
      console.error("Error loading candidates:", error);
      if (!showRefreshToast) toast.error(t.errorLoadingCandidates);
    }
  }, [user?.id, t]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadSavedCandidates();
      setLoading(false);
    };
    
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadSavedCandidates]);

  // Filter saved candidates
  useEffect(() => {
    let filtered = [...savedCandidates];

    // Apply search filter
    if (savedSearchQuery.trim()) {
      const query = savedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.full_name.toLowerCase().includes(query) ||
          candidate.email.toLowerCase().includes(query) ||
          candidate.bio?.toLowerCase().includes(query) ||
          candidate.industry_pref?.some((industry) =>
            industry.toLowerCase().includes(query)
          ) ||
          candidate.location_pref?.some((location) =>
            location.toLowerCase().includes(query)
          )
      );
    }

    // Apply additional filters
    if (savedFilterBy !== "all") {
      switch (savedFilterBy) {
        case "recent":
          filtered = filtered.filter((candidate) => {
            if (!candidate.saved_at) return false;
            const savedDate = new Date(candidate.saved_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return savedDate >= weekAgo;
          });
          break;
        case "with-resume":
          filtered = filtered.filter((candidate) => candidate.resume_url);
          break;
        case "remote":
          filtered = filtered.filter((candidate) =>
            candidate.work_style_pref?.some((style) =>
              style.toLowerCase().includes("remote")
            )
          );
          break;
      }
    }

    setFilteredSavedCandidates(filtered);
  }, [savedCandidates, savedSearchQuery, savedFilterBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedCandidates(true);
    setRefreshing(false);
    toast.success(t.dataRefreshed);
  };

  const handleCandidateUnsave = (candidateId: string) => {
    const updatedCandidates = savedCandidates.filter((c) => c.id !== candidateId);
    setSavedCandidates(updatedCandidates);
    setFilteredSavedCandidates(updatedCandidates);
  };

  const handleExportSaved = () => {
    const csvContent = [
      [
        "Name",
        "Email",
        "Bio",
        "Location Preferences",
        "Industry Preferences",
        "Work Style",
        "Saved Date",
      ].join(","),
      ...filteredSavedCandidates.map((candidate) =>
        [
          candidate.full_name,
          candidate.email,
          `"${candidate.bio?.replace(/"/g, '""') || ""}"`,
          `"${candidate.location_pref?.join("; ") || ""}"`,
          `"${candidate.industry_pref?.join("; ") || ""}"`,
          `"${candidate.work_style_pref?.join("; ") || ""}"`,
          candidate.saved_at
            ? new Date(candidate.saved_at).toLocaleDateString()
            : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saved_candidates_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(t.candidateListExported);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingAnimation size="md" text={t.loadingCandidatesAndInvitations} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.candidatesAndInvitations}</h1>
          <p className="text-gray-600 mt-1">
            {t.manageSavedCandidates}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t.refresh}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookmarkCheck size={16} />
            {t.savedCandidatesTab} ({savedCandidates.length})
          </TabsTrigger>
        </TabsList>

        {/* Saved Candidates Tab */}
        <TabsContent value="saved" className="space-y-6">
          {/* Search and Filters for Saved */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.searchCandidatesPlaceholder}
                value={savedSearchQuery}
                onChange={(e) => setSavedSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={savedFilterBy} onValueChange={setSavedFilterBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t.filterBy} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCandidates}</SelectItem>
                  <SelectItem value="recent">{t.recentlySaved}</SelectItem>
                  <SelectItem value="with-resume">{t.withResume}</SelectItem>
                  <SelectItem value="remote">{t.remoteWorkers}</SelectItem>
                </SelectContent>
              </Select>
              {filteredSavedCandidates.length > 0 && (
                <Button variant="outline" onClick={handleExportSaved} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t.exportCsv}
                </Button>
              )}
            </div>
          </div>

          {/* Saved Candidates Content */}
          {savedCandidates.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t.noSavedCandidatesYet}
              </h3>
              <p className="text-gray-600 mb-6">
                {t.startSavingCandidates}
              </p>
              <Button onClick={() => router.push("/employer/dashboard/home")}>
                {t.findCandidates}
              </Button>
            </div>
          ) : filteredSavedCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t.noCandidatesMatchSearch}
              </h3>
              <p className="text-gray-600">
                {t.tryAdjustingSearch}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredSavedCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onSaveChange={(candidateId, isSaved) => {
                    if (!isSaved) {
                      handleCandidateUnsave(candidateId);
                    }
                  }}
                  showSaveButton={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CandidatesPageWrapper() {
  const { language } = useLanguage();
  const t = employerTranslations[language];
  
  return (
    <div className="flex justify-center py-12">
      <LoadingAnimation size="md" text={t.loading} />
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<CandidatesPageWrapper />}>
      <CandidatesPageContent />
    </Suspense>
  );
}