"use client";

import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import {
    Search,
    Filter,
    RefreshCw,
    X,
    Sparkles,
    TrendingUp,
    ChevronDown,
    Settings
} from "lucide-react";
import OpportunityFilters, { type OpportunityFilters as FilterType } from "@/features/talent/opportunities/components/opportunity-filters";
import OpportunityCard, { type Opportunity } from "@/features/talent/opportunities/components/opportunity-card";
import OpportunitiesPageSkeleton from "./loading";
import LoadingAnimation from "@/components/loadingAnimation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import OpportunityDetailModal from "@/components/opportunity-detail-modal";

const DEFAULT_FILTERS: FilterType = {
    search: "",
    location: [],
    industry: [],
    jobType: [],
    experienceLevel: [],
    workStyle: [],
    salaryRange: [0, 50000],
    companySize: [],
    postedWithin: "all",
    remote: false,
    sortBy: "ai_match"
};

type FeedMode = "ai_recommended" | "filtered" | "search";

interface ExtendedOpportunity extends Opportunity {
    matchScore?: number;
    similarity?: number;
    isAIRecommended?: boolean;
    feedIndex?: number;
}

function TalentOpportunitiesContent() {
    const { user, authUser, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [opportunities, setOpportunities] = useState<ExtendedOpportunity[]>([]);
    const [filteredOpportunities, setFilteredOpportunities] = useState<ExtendedOpportunity[]>([]);
    const [filters, setFilters] = useState<FilterType>(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [feedMode, setFeedMode] = useState<FeedMode>("ai_recommended");
    const [showFilters, setShowFilters] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [savedOpportunityIds, setSavedOpportunityIds] = useState<Set<string>>(new Set());
    const [selectedOpportunity, setSelectedOpportunity] = useState<ExtendedOpportunity | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [aiMatchingStatus, setAiMatchingStatus] = useState<"idle" | "loading" | "ready">("idle");
    const [preloadedPages, setPreloadedPages] = useState<Set<number>>(new Set());

    const loadMoreRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Memoize filtered opportunities for performance
    const memoizedFilteredOpportunities = useMemo(() => {
        return filteredOpportunities;
    }, [filteredOpportunities]);

    // Background preloading for next pages
    const preloadNextPage = useCallback(async () => {
        const nextPage = page + 1;
        if (preloadedPages.has(nextPage) || !hasMore) return;

        try {
            setPreloadedPages(prev => new Set(prev).add(nextPage));
            // Preload in background without showing loading state
            if (feedMode === "ai_recommended") {
                await fetch("/api/match-opps", {
                    method: "POST",
                    body: JSON.stringify({
                        id: authUser?.id,
                        offset: nextPage * 10,
                        limit: 10
                    }),
                    headers: { "Content-Type": "application/json" }
                });
            }
        } catch (error) {
            console.log("Background preload failed:", error);
            setPreloadedPages(prev => {
                const newSet = new Set(prev);
                newSet.delete(nextPage);
                return newSet;
            });
        }
    }, [page, preloadedPages, hasMore, feedMode, authUser?.id]);

    // Trigger preloading when user scrolls to 70% of current content
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const viewHeight = window.innerHeight;
            const fullHeight = document.body.scrollHeight;

            const scrollPercent = (scrolled + viewHeight) / fullHeight;

            if (scrollPercent > 0.7 && !loadingMore) {
                preloadNextPage();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [preloadNextPage, loadingMore]);

    // Show loading while auth is resolving
    if (isLoading) {
        return <OpportunitiesPageSkeleton />;
    }

    if (!authUser) {
        return <OpportunitiesPageSkeleton />;
    }

    // Initialize AI recommendations and load opportunities
    useEffect(() => {
        initializeAIRecommendations();
        loadSavedOpportunities();
    }, [authUser]);

    // Handle infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreOpportunities();
                }
            },
            { threshold: 1.0 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore]);

    // Apply filters and search
    useEffect(() => {
        applyFiltersAndSearch();
    }, [filters, opportunities, searchInput]);

    const initializeAIRecommendations = async () => {
        if (!authUser?.id) return;

        setLoading(true);
        setAiMatchingStatus("loading");

        try {
            // First, check if user has embedding
            const { data: talentData, error: talentError } = await supabase
                .from('talents')
                .select('embedding, id')
                .eq('user_id', authUser.id)
                .maybeSingle();

            if (talentError) throw talentError;

            if (!talentData?.embedding) {
                // User needs to go through AI matching first
                toast.info("Setting up your AI recommendations...");
                await processUserForAIMatching();
            }

            // Load AI-recommended opportunities
            await loadAIRecommendations();
            setAiMatchingStatus("ready");
        } catch (error) {
            console.error("Error initializing AI recommendations:", error);
            setAiMatchingStatus("idle");
            // Fallback to regular opportunities
            await loadGeneralOpportunities();
        } finally {
            setLoading(false);
        }
    };

    const processUserForAIMatching = async () => {
        if (!authUser?.id) return;

        try {
            const { data: userData, error } = await supabase
                .from("talents")
                .select("*")
                .eq("user_id", authUser.id)
                .maybeSingle();

            if (error || !userData) throw error;

            if (userData.embedding) return; // Already processed

            // Download and process resume
            const { data: resumeData, error: resumeError } = await supabase.storage
                .from("resumes")
                .download(userData.resume_url);

            if (resumeError) throw resumeError;

            const resumeFile = new File(
                [resumeData],
                userData.resume_url.split("/").pop() || "resume.pdf",
                { type: "application/pdf" }
            );

            const formData = new FormData();
            formData.append("file", resumeFile);

            const extractRes = await fetch("/api/extract-resume", {
                method: "POST",
                body: formData,
            });

            if (!extractRes.ok) throw new Error("Failed to extract resume");

            const extractedData = await extractRes.json();

            const allText = [
                extractedData,
                userData.bio,
                userData.work_style_pref?.join(", ") || "",
                userData.industry_pref?.join(", ") || "",
                userData.location_pref || "",
            ].join(" ");

            const embeddingRes = await fetch("/api/get-embedding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(allText),
            });

            if (!embeddingRes.ok) throw new Error("Failed to generate embedding");

            const embeddingData = await embeddingRes.json();

            await supabase
                .from("talents")
                .update({ embedding: embeddingData.embeddings[0].values })
                .eq("id", userData.id);

        } catch (error) {
            console.error("Error processing user for AI matching:", error);
            throw error;
        }
    };

    const loadAIRecommendations = async () => {
        if (!authUser?.id) return;

        try {
            const response = await fetch("/api/match-opps", {
                method: "POST",
                body: JSON.stringify({ id: authUser.id, offset: page * 10, limit: 10 }),
            });

            if (!response.ok) throw new Error("Failed to fetch AI recommendations");

            const aiOpportunities = await response.json();

            // Transform AI opportunities to match our interface
            const transformedAI: ExtendedOpportunity[] = aiOpportunities.map((opp: any, index: number) => ({
                id: opp.id,
                title: opp.title,
                company_name: opp.company_name,
                location: opp.location,
                industry: opp.industry,
                workstyle: opp.workstyle,
                skills: opp.skills || [],
                description: opp.description,
                created_at: opp.created_at,
                isSaved: false,
                matchScore: Math.round(opp.similarity),
                similarity: opp.similarity,
                isAIRecommended: true,
                feedIndex: index
            }));

            // Mix with some general opportunities for variety
            const generalOpps = await loadGeneralOpportunities(5);
            const mixed = interleaveOpportunities(transformedAI, generalOpps);

            if (page === 0) {
                setOpportunities(mixed);
            } else {
                setOpportunities(prev => [...prev, ...mixed]);
            }

            setHasMore(aiOpportunities.length === 10);
        } catch (error) {
            console.error("Error loading AI recommendations:", error);
            await loadGeneralOpportunities();
        }
    };

    const loadGeneralOpportunities = async (limit = 10) => {
        try {
            const { data: opportunities, error } = await supabase
                .from('opportunities')
                .select(`
                    id, title, company_name, location, industry, workstyle,
                    skills, description, created_at
                `)
                .order('created_at', { ascending: false })
                .range(page * limit, (page + 1) * limit - 1);

            if (error) throw error;

            const transformed: ExtendedOpportunity[] = (opportunities || []).map(opp => ({
                id: opp.id,
                title: opp.title,
                company_name: opp.company_name,
                location: opp.location,
                industry: opp.industry,
                workstyle: opp.workstyle,
                skills: opp.skills || [],
                description: opp.description,
                created_at: opp.created_at,
                isSaved: false,
                isAIRecommended: false
            }));

            if (limit === 10) {
                if (page === 0) {
                    setOpportunities(transformed);
                } else {
                    setOpportunities(prev => [...prev, ...transformed]);
                }
            }

            return transformed;
        } catch (error) {
            console.error("Error loading general opportunities:", error);
            toast.error("Failed to load opportunities");
            return [];
        }
    };

    const interleaveOpportunities = (ai: ExtendedOpportunity[], general: ExtendedOpportunity[]): ExtendedOpportunity[] => {
        const result: ExtendedOpportunity[] = [];
        const maxLength = Math.max(ai.length, general.length);

        for (let i = 0; i < maxLength; i++) {
            // Add 2-3 AI recommendations
            if (ai[i * 2]) result.push(ai[i * 2]);
            if (ai[i * 2 + 1]) result.push(ai[i * 2 + 1]);
            if (ai[i * 2 + 2]) result.push(ai[i * 2 + 2]);

            // Add 1 general opportunity for variety
            if (general[i]) result.push(general[i]);
        }

        return result;
    };

    const loadMoreOpportunities = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);

        if (feedMode === "ai_recommended") {
            await loadAIRecommendations();
        } else {
            await loadGeneralOpportunities();
        }

        setLoadingMore(false);
    };

    const loadSavedOpportunities = async () => {
        try {
            if (!authUser?.id) return;

            const { data: talentData, error: talentError } = await supabase
                .from('talents')
                .select('id')
                .eq('user_id', authUser.id)
                .maybeSingle();

            if (talentError || !talentData?.id) return;

            const { data: savedOpportunities, error } = await supabase
                .from('saved_opportunities')
                .select('opportunity_id')
                .eq('talent_id', talentData.id);

            if (error) throw error;

            const savedIds = new Set(savedOpportunities?.map(item => item.opportunity_id) || []);
            setSavedOpportunityIds(savedIds);
        } catch (error) {
            console.error("Error loading saved opportunities:", error);
        }
    };

    const applyFiltersAndSearch = useCallback(() => {
        let filtered = [...opportunities];

        // Update saved status
        filtered = filtered.map(opp => ({
            ...opp,
            isSaved: savedOpportunityIds.has(opp.id)
        }));

        // Determine feed mode based on search and filters
        const hasSearch = searchInput.trim().length > 0;
        const hasFilters = filters.location.length > 0 ||
            filters.industry.length > 0 ||
            filters.jobType.length > 0 ||
            filters.workStyle.length > 0 ||
            filters.remote ||
            filters.postedWithin !== "all";

        if (hasSearch) {
            setFeedMode("search");
            const searchLower = searchInput.toLowerCase();
            filtered = filtered.filter(opp =>
                opp.title.toLowerCase().includes(searchLower) ||
                opp.company_name.toLowerCase().includes(searchLower) ||
                opp.description.toLowerCase().includes(searchLower) ||
                (opp.skills && opp.skills.some(skill => skill.toLowerCase().includes(searchLower)))
            );
        } else if (hasFilters) {
            setFeedMode("filtered");
        } else {
            setFeedMode("ai_recommended");
        }

        // Apply filters if any are active
        if (hasFilters) {
            if (filters.location.length > 0) {
                filtered = filtered.filter(opp => filters.location.includes(opp.location));
            }
            if (filters.industry.length > 0) {
                filtered = filtered.filter(opp => filters.industry.includes(opp.industry));
            }
            if (filters.workStyle.length > 0) {
                filtered = filtered.filter(opp => filters.workStyle.includes(opp.workstyle));
            }
            if (filters.remote) {
                filtered = filtered.filter(opp => opp.workstyle.toLowerCase().includes('remote'));
            }
            if (filters.postedWithin !== "all") {
                const now = new Date();
                const timeMap: Record<string, number> = {
                    "24h": 1, "3d": 3, "1w": 7, "2w": 14, "1m": 30
                };
                const daysAgo = timeMap[filters.postedWithin];
                if (daysAgo && opportunities[0]?.created_at) {
                    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
                    filtered = filtered.filter(opp => opp.created_at && new Date(opp.created_at) >= cutoffDate);
                }
            }
        }

        // Apply sorting
        switch (filters.sortBy) {
            case "ai_match":
                filtered.sort((a, b) => {
                    // AI recommended first, then by match score
                    if (a.isAIRecommended && !b.isAIRecommended) return -1;
                    if (!a.isAIRecommended && b.isAIRecommended) return 1;
                    return (b.matchScore || 0) - (a.matchScore || 0);
                });
                break;
            case "newest":
                filtered.sort((a, b) => {
                    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return bDate - aDate;
                });
                break;
            case "relevance":
            default:
                filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                break;
        }

        setFilteredOpportunities(filtered);
    }, [opportunities, savedOpportunityIds, searchInput, filters]);

    const handleSaveOpportunity = async (opportunityId: string) => {
        try {
            if (!authUser?.id) {
                toast.error("Please log in to save opportunities");
                return;
            }

            const { data: talentData, error: talentError } = await supabase
                .from('talents')
                .select('id')
                .eq('user_id', authUser.id)
                .maybeSingle();

            if (talentError || !talentData?.id) {
                toast.error("Talent profile not found");
                return;
            }

            const { error } = await supabase
                .from('saved_opportunities')
                .insert({
                    talent_id: talentData.id,
                    opportunity_id: opportunityId,
                    saved_at: new Date().toISOString()
                });

            if (error) throw error;

            const newSavedIds = new Set(savedOpportunityIds);
            newSavedIds.add(opportunityId);
            setSavedOpportunityIds(newSavedIds);

            toast.success("Opportunity saved successfully");
        } catch (error) {
            console.error("Error saving opportunity:", error);
            toast.error("Failed to save opportunity");
        }
    };

    const handleUnsaveOpportunity = async (opportunityId: string) => {
        try {
            if (!authUser?.id) return;

            const { data: talentData, error: talentError } = await supabase
                .from('talents')
                .select('id')
                .eq('user_id', authUser.id)
                .maybeSingle();

            if (talentError || !talentData?.id) return;

            const { error } = await supabase
                .from('saved_opportunities')
                .delete()
                .eq('talent_id', talentData.id)
                .eq('opportunity_id', opportunityId);

            if (error) throw error;

            const newSavedIds = new Set(savedOpportunityIds);
            newSavedIds.delete(opportunityId);
            setSavedOpportunityIds(newSavedIds);

            toast.success("Opportunity removed from saved");
        } catch (error) {
            console.error("Error unsaving opportunity:", error);
            toast.error("Failed to remove opportunity");
        }
    };

    const handleApplyToOpportunity = (opportunity: ExtendedOpportunity) => {
        router.push(`/talent/apply/${opportunity.id}`);
    };

    const handleViewDetails = (opportunity: ExtendedOpportunity) => {
        setSelectedOpportunity(opportunity);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOpportunity(null);
    };

    const handleRefresh = async () => {
        setPage(0);
        setOpportunities([]);
        setAiMatchingStatus("loading");
        await initializeAIRecommendations();
        toast.success("Feed refreshed with new recommendations");
    };

    const clearSearch = () => {
        setSearchInput("");
        setFilters(DEFAULT_FILTERS);
    };

    const getFeedModeIcon = () => {
        switch (feedMode) {
            case "ai_recommended": return <Sparkles className="h-4 w-4" />;
            case "search": return <Search className="h-4 w-4" />;
            case "filtered": return <Filter className="h-4 w-4" />;
            default: return <TrendingUp className="h-4 w-4" />;
        }
    };

    const getFeedModeText = () => {
        switch (feedMode) {
            case "ai_recommended": return "AI Recommendations";
            case "search": return `Search: "${searchInput}"`;
            case "filtered": return "Filtered Results";
            default: return "All Opportunities";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header - Mobile Optimized */}
            <div className="space-y-4 md:space-y-0 md:flex md:items-start md:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {getFeedModeIcon()}
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{getFeedModeText()}</h1>
                        {aiMatchingStatus === "loading" && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <span className="hidden sm:inline">Processing AI matches...</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm md:text-base text-gray-600">
                        {loading ? (
                            "Loading opportunities..."
                        ) : (
                            `${memoizedFilteredOpportunities.length} opportunities found`
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={loading}
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex-1 sm:flex-none"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Filters</span>
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Search Opportunities</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search for opportunities, companies, or skills..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-10 pr-10 h-10"
                                />
                                {searchInput && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                        onClick={clearSearch}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <OpportunityFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            onClearFilters={() => setFilters(DEFAULT_FILTERS)}
                            resultsCount={memoizedFilteredOpportunities.length}
                            isLoading={loading}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Opportunity Feed */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingAnimation size="md" text="Loading your personalized feed..." />
                </div>
            ) : memoizedFilteredOpportunities.length === 0 ? (
                <Card>
                    <CardContent className="py-8 md:py-12 text-center px-4">
                        <Search className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                        <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
                            {feedMode === "search"
                                ? "Try different search terms or clear your search to see AI recommendations."
                                : "Try adjusting your filters or refresh for new recommendations."
                            }
                        </p>
                        <Button onClick={clearSearch} variant="outline" className="w-full md:w-auto">
                            {feedMode === "search" ? "Clear Search" : "Clear Filters"}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {memoizedFilteredOpportunities.map((opportunity, index) => (
                        <motion.div
                            key={`${opportunity.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className="relative">
                                {opportunity.isAIRecommended && (
                                    <div className="absolute -top-2 -right-2 z-10">
                                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" />
                                            AI Match
                                        </div>
                                    </div>
                                )}
                                <OpportunityCard
                                    opportunity={opportunity}
                                    onSave={handleSaveOpportunity}
                                    onUnsave={handleUnsaveOpportunity}
                                    onApply={handleApplyToOpportunity}
                                    onViewDetails={handleViewDetails}
                                    compact={false}
                                />
                            </div>
                        </motion.div>
                    ))}

                    {/* Load More Trigger */}
                    <div ref={loadMoreRef} className="py-4 md:py-8">
                        {loadingMore && (
                            <div className="flex justify-center">
                                <LoadingAnimation size="sm" text="Loading more opportunities..." />
                            </div>
                        )}
                        {!hasMore && memoizedFilteredOpportunities.length > 0 && (
                            <div className="text-center text-gray-500 py-4 md:py-8">
                                <p className="text-sm md:text-base mb-4">You've reached the end! Check back later for new opportunities.</p>
                                <Button
                                    variant="outline"
                                    onClick={handleRefresh}
                                    className="w-full md:w-auto"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh for More
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Opportunity Detail Modal */}
            <OpportunityDetailModal
                opportunity={selectedOpportunity}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onApply={async (opportunityId: string) => {
                    const opportunity = opportunities.find(opp => opp.id === opportunityId);
                    if (opportunity) {
                        handleApplyToOpportunity(opportunity);
                    }
                }}
            />
        </div>
    );
}

export default function TalentOpportunities() {
    return (
        <Suspense fallback={<OpportunitiesPageSkeleton />}>
            <TalentOpportunitiesContent />
        </Suspense>
    );
}