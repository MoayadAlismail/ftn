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

interface SentInvitation {
  id: string;
  employer_id: string;
  talent_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  talent?: {
    id: string;
    full_name: string;
    email: string;
    bio: string;
  };
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
  
  // Sent invitations states
  const [invitations, setInvitations] = useState<SentInvitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<SentInvitation[]>([]);
  const [invitationsSearchTerm, setInvitationsSearchTerm] = useState("");
  const [invitationsStatusFilter, setInvitationsStatusFilter] = useState<string>("all");

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

  // Load sent invitations
  const loadInvitations = useCallback(async (showRefreshToast = false) => {
    try {
      const { data: invitationsData, error } = await supabase
        .from("invites")
        .select(`*, talent:talents!inner(id, full_name, email, bio)`)
        .eq("employer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sent invitations:", error);
        if (!showRefreshToast) toast.error(t.failedToLoadSentInvitations);
        return;
      }

      setInvitations(invitationsData || []);
      setFilteredInvitations(invitationsData || []);
    } catch (error) {
      console.error("Error loading sent invitations:", error);
      if (!showRefreshToast) toast.error(t.errorLoadingSentInvitations);
    }
  }, [user?.id, t]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadSavedCandidates(),
        loadInvitations()
      ]);
      setLoading(false);
    };
    
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadSavedCandidates, loadInvitations]);

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

  // Filter invitations
  useEffect(() => {
    let filtered = invitations;

    if (invitationsSearchTerm) {
      const search = invitationsSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.talent?.full_name?.toLowerCase().includes(search) ||
          inv.talent?.email?.toLowerCase().includes(search) ||
          inv.message.toLowerCase().includes(search)
      );
    }

    if (invitationsStatusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === invitationsStatusFilter);
    }

    setFilteredInvitations(filtered);
  }, [invitations, invitationsSearchTerm, invitationsStatusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadSavedCandidates(true),
      loadInvitations(true)
    ]);
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

  // Helper functions for invitations
  const invitationStats = {
    total: invitations.length,
    pending: invitations.filter((inv) => inv.status === "pending").length,
    accepted: invitations.filter((inv) => inv.status === "accepted").length,
    rejected: invitations.filter((inv) => inv.status === "rejected").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "accepted":
        return <CheckCircle size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return <Mail size={16} />;
    }
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookmarkCheck size={16} />
            {t.savedCandidatesTab} ({savedCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Send size={16} />
            {t.sentInvitationsTab} ({invitations.length})
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

        {/* Sent Invitations Tab */}
        <TabsContent value="invitations" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t.totalSent}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {invitationStats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t.pending}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {invitationStats.pending}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t.accepted}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {invitationStats.accepted}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="text-red-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t.rejected}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {invitationStats.rejected}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters for Invitations */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder={t.searchInvitationsPlaceholder}
                value={invitationsSearchTerm}
                onChange={(e) => setInvitationsSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={invitationsStatusFilter} onValueChange={setInvitationsStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t.filterBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="accepted">{t.accepted}</SelectItem>
                <SelectItem value="rejected">{t.rejected}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invitations List */}
          {filteredInvitations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {invitations.length === 0
                    ? t.noInvitationsSent
                    : t.noInvitationsMatchFilters}
                </h3>
                <p className="text-gray-600">
                  {invitations.length === 0
                    ? t.startSendingInvitations
                    : t.tryAdjustingSearch}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvitations.map((invitation) => (
                <Card
                  key={invitation.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="text-primary" size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {invitation.talent?.full_name || "Talent Name"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {invitation.talent?.email || "talent@email.com"}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar size={12} />
                              {t.sent}{" "}
                              {formatDistanceToNow(
                                new Date(invitation.created_at)
                              )}{" "}
                              {t.ago}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${getStatusColor(
                            invitation.status
                          )} flex items-center gap-1`}
                        >
                          {getStatusIcon(invitation.status)}
                          {invitation.status.charAt(0).toUpperCase() +
                            invitation.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Bio */}
                      {invitation.talent?.bio && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {invitation.talent.bio}
                          </p>
                        </div>
                      )}

                      {/* Message */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="text-blue-400 mt-1" size={16} />
                          <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">
                              {t.yourMessage}
                            </p>
                            <p className="text-sm text-blue-600">
                              {invitation.message}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Update Info */}
                      {invitation.status !== "pending" && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {invitation.status === "accepted" ? t.accepted : t.rejected}{" "}
                          {formatDistanceToNow(new Date(invitation.updated_at))}{" "}
                          {t.ago}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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