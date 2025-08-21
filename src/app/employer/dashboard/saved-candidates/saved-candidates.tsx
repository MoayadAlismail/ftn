"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Users,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import LoadingAnimation from "@/components/loadingAnimation";
import CandidateCard from "@/features/employer/dashboard/components/candidate-card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
// import SavedCandidatesPageSkeleton from "@/app/employer/dashboard/saved-candidates/skeleton";

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

export default function SavedCandidatesPageContent() {
  const { user, authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [candidates, setCandidates] = useState<SavedCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<
    SavedCandidate[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    const loadCandidates = async (showRefreshToast = false) => {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      try {
        const employerId = user!.id;
        console.log("Employer ID:", employerId);

        if (!employerId) {
          toast.error("Please log in to view saved candidates");
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
          toast.error("Failed to load saved candidates");
          return;
        }

        if (!saves || saves.length === 0) {
          setCandidates([]);
          setFilteredCandidates([]);
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
          toast.error("Failed to load candidate details");
          return;
        }

        // Merge saved timestamp with talent data
        const enrichedCandidates = (talents || []).map((talent) => {
          const saveData = saves.find((s) => s.talent_id === talent.id);
          return {
            ...talent,
            // Ensure these fields are always arrays
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

        setCandidates(enrichedCandidates);
        setFilteredCandidates(enrichedCandidates);

        if (showRefreshToast) {
          toast.success("Candidates refreshed successfully");
        }
      } catch (error) {
        console.error("Error loading candidates:", error);
        toast.error("An error occurred while loading candidates");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    loadCandidates();
  }, []);

  // Filter candidates based on search and filter criteria
  useEffect(() => {
    let filtered = [...candidates];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
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
    if (filterBy !== "all") {
      switch (filterBy) {
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

    setFilteredCandidates(filtered);
  }, [candidates, searchQuery, filterBy]);

  const handleCandidateUnsave = (candidateId: string) => {
    const updatedCandidates = candidates.filter((c) => c.id !== candidateId);
    setCandidates(updatedCandidates);
    setFilteredCandidates(
      updatedCandidates.filter((c) => {
        // Reapply current filters
        let include: boolean | undefined = true;

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          include =
            c.full_name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.bio?.toLowerCase().includes(query) ||
            c.industry_pref?.some((industry) =>
              industry.toLowerCase().includes(query)
            ) ||
            c.location_pref?.some((location) =>
              location.toLowerCase().includes(query)
            );
        }

        if (include && filterBy !== "all") {
          switch (filterBy) {
            case "recent":
              if (!c.saved_at) include = false;
              else {
                const savedDate = new Date(c.saved_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                include = savedDate >= weekAgo;
              }
              break;
            case "with-resume":
              include = !!c.resume_url;
              break;
            case "remote":
              include =
                c.work_style_pref?.some((style) =>
                  style.toLowerCase().includes("remote")
                ) || false;
              break;
          }
        }

        return include;
      })
    );
  };

  const handleExportAll = () => {
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
      ...filteredCandidates.map((candidate) =>
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
    a.download = `saved_candidates_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Candidate list exported successfully");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Candidates</h1>
          <p className="text-gray-600 mt-1">
            {filteredCandidates.length} of {candidates.length} saved candidates
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setRefreshing(true)}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {filteredCandidates.length > 0 && (
            <Button variant="outline" onClick={handleExportAll} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, bio, location, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              <SelectItem value="recent">Recently Saved</SelectItem>
              <SelectItem value="with-resume">With Resume</SelectItem>
              <SelectItem value="remote">Remote Workers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingAnimation size="md" text="Loading saved candidates..." />
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No saved candidates yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start saving interesting candidates from search results to build
            your talent pipeline.
          </p>
          <Button
            onClick={() => router.push("/employer/dashboard/home")}
          >
            Find Candidates
          </Button>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No candidates match your search
          </h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCandidates.map((candidate) => (
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
    </div>
  );
}

