"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import {
    Grid,
    List,
    Search,
    RefreshCw,
    Bookmark,
    BookmarkCheck
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
    sortBy: "relevance"
};

function TalentOpportunitiesContent() {
    const { user, authUser, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
    const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
    const [filters, setFilters] = useState<FilterType>(DEFAULT_FILTERS);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
    const [loading, setLoading] = useState(true);
    const [savedLoading, setSavedLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [savedOpportunityIds, setSavedOpportunityIds] = useState<Set<string>>(new Set());
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Show loading while auth is resolving
    if (isLoading) {
        return <OpportunitiesPageSkeleton />;
    }

    // Auth is handled by middleware - no need for component-level checks

    // Show loading if authUser is not yet loaded
    if (!authUser) {
        return <OpportunitiesPageSkeleton />;
    }

    // Load opportunities
    useEffect(() => {
        loadOpportunities();
        loadSavedOpportunityIds();
    }, []);

    // Load saved opportunities when switching to saved tab
    useEffect(() => {
        if (activeTab === "saved") {
            loadSavedOpportunitiesData();
        }
    }, [activeTab, authUser?.id]);

    // Apply filters whenever filters, opportunities, or activeTab change
    useEffect(() => {
        applyFilters();
    }, [filters, opportunities, savedOpportunities, activeTab]);

    const loadOpportunities = async () => {
        setLoading(true);
        try {
            const { data: opportunities, error } = await supabase
                .from('opportunities')
                .select(`
                    id,
                    title,
                    company_name,
                    location,
                    industry,
                    workstyle,
                    skills,
                    description,
                    created_at
                `)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Transform database format to component format
            const transformedOpportunities: Opportunity[] = (opportunities || []).map(opp => ({
                id: opp.id,
                title: opp.title,
                company_name: opp.company_name,
                location: opp.location,
                industry: opp.industry,
                workstyle: opp.workstyle,
                skills: opp.skills || [],
                description: opp.description,
                created_at: opp.created_at,
                isSaved: false, // Will be updated by saved opportunities
                matchScore: undefined // This would come from matching algorithm
            }));

            setOpportunities(transformedOpportunities);
        } catch (error) {
            console.error("Error loading opportunities:", error);
            toast.error("Failed to load opportunities");
        } finally {
            setLoading(false);
        }
    };

    const loadSavedOpportunityIds = async () => {
        try {
            if (!authUser?.id) return;

            // Use auth user ID directly since saved_opportunities.talent_id references auth.users(id)
            const { data: savedOpportunities, error } = await supabase
                .from('saved_opportunities')
                .select('opportunity_id')
                .eq('talent_id', authUser.id);

            if (error) {
                throw error;
            }

            const savedIds = new Set(savedOpportunities?.map(item => item.opportunity_id) || []);
            setSavedOpportunityIds(savedIds);
        } catch (error) {
            console.error("Error loading saved opportunities:", error);
        }
    };

    const loadSavedOpportunitiesData = async () => {
        setSavedLoading(true);
        try {
            if (!authUser?.id) return;

            // First, get saved opportunity records with metadata
            const { data: savedRecords, error: savedError } = await supabase
                .from('saved_opportunities')
                .select('opportunity_id, saved_at, notes')
                .eq('talent_id', authUser.id)
                .order('saved_at', { ascending: false });

            if (savedError) {
                throw savedError;
            }

            if (!savedRecords || savedRecords.length === 0) {
                setSavedOpportunities([]);
                return;
            }

            // Extract opportunity IDs
            const opportunityIds = savedRecords.map(record => record.opportunity_id);

            // Then fetch the full opportunity data
            const { data: opportunities, error: oppError } = await supabase
                .from('opportunities')
                .select(`
                    id,
                    title,
                    company_name,
                    location,
                    industry,
                    workstyle,
                    skills,
                    description,
                    created_at
                `)
                .in('id', opportunityIds);

            if (oppError) {
                throw oppError;
            }

            // Combine the data
            const transformedSavedOpportunities: Opportunity[] = (opportunities || [])
                .map(opp => {
                    const savedRecord = savedRecords.find(record => record.opportunity_id === opp.id);
                    if (!savedRecord) return null;
                    
                    return {
                        id: opp.id,
                        title: opp.title,
                        company_name: opp.company_name,
                        location: opp.location,
                        industry: opp.industry,
                        workstyle: opp.workstyle,
                        skills: opp.skills || [],
                        description: opp.description,
                        created_at: opp.created_at,
                        isSaved: true,
                        savedAt: savedRecord.saved_at,
                        savedNotes: savedRecord.notes,
                        matchScore: undefined
                    };
                })
                .filter(Boolean) as Opportunity[];

            // Sort by saved_at date (most recent first)
            transformedSavedOpportunities.sort((a, b) => {
                const aDate = a.savedAt ? new Date(a.savedAt).getTime() : 0;
                const bDate = b.savedAt ? new Date(b.savedAt).getTime() : 0;
                return bDate - aDate;
            });

            setSavedOpportunities(transformedSavedOpportunities);
        } catch (error) {
            console.error("Error loading saved opportunities data:", error);
            toast.error("Failed to load saved opportunities");
        } finally {
            setSavedLoading(false);
        }
    };

    const applyFilters = useCallback(() => {
        // Choose the appropriate data source based on active tab
        let filtered = activeTab === "saved" ? [...savedOpportunities] : [...opportunities];

        // Update saved status for "all" tab opportunities
        if (activeTab === "all") {
            filtered = filtered.map(opp => ({
                ...opp,
                isSaved: savedOpportunityIds.has(opp.id)
            }));
        }

        // Apply search filter
        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(opp =>
                opp.title.toLowerCase().includes(searchLower) ||
                opp.company_name.toLowerCase().includes(searchLower) ||
                opp.description.toLowerCase().includes(searchLower) ||
                (opp.skills && opp.skills.some(skill => skill.toLowerCase().includes(searchLower)))
            );
        }

        // Apply location filter
        if (filters.location.length > 0) {
            filtered = filtered.filter(opp =>
                filters.location.includes(opp.location)
            );
        }

        // Apply industry filter
        if (filters.industry.length > 0) {
            filtered = filtered.filter(opp =>
                filters.industry.includes(opp.industry)
            );
        }


        // Apply work style filter
        if (filters.workStyle.length > 0) {
            filtered = filtered.filter(opp =>
                filters.workStyle.includes(opp.workstyle)
            );
        }

        // Apply remote filter
        if (filters.remote) {
            filtered = filtered.filter(opp => opp.workstyle.toLowerCase().includes('remote'));
        }

        // Apply posted within filter
        if (filters.postedWithin !== "all") {
            const now = new Date();
            const timeMap: Record<string, number> = {
                "24h": 1,
                "3d": 3,
                "1w": 7,
                "2w": 14,
                "1m": 30
            };
            const daysAgo = timeMap[filters.postedWithin];
            if (daysAgo && opportunities[0]?.created_at) {
                const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(opp => opp.created_at && new Date(opp.created_at) >= cutoffDate);
            }
        }

        // Apply sorting
        switch (filters.sortBy) {
            case "newest":
                filtered.sort((a, b) => {
                    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return bDate - aDate;
                });
                break;
            case "oldest":
                filtered.sort((a, b) => {
                    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return aDate - bDate;
                });
                break;
            case "relevance":
            default:
                filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                break;
        }

        setFilteredOpportunities(filtered);
    }, [filters, opportunities, savedOpportunities, savedOpportunityIds, activeTab]);

    const handleSaveOpportunity = async (opportunityId: string) => {
        try {
            if (!authUser?.id) {
                toast.error("Please log in to save opportunities");
                return;
            }

            // Use auth user ID directly since saved_opportunities.talent_id references auth.users(id)
            const { error } = await supabase
                .from('saved_opportunities')
                .insert({
                    talent_id: authUser.id,
                    opportunity_id: opportunityId,
                    saved_at: new Date().toISOString()
                });

            if (error) {
                throw error;
            }

            const newSavedIds = new Set(savedOpportunityIds);
            newSavedIds.add(opportunityId);
            setSavedOpportunityIds(newSavedIds);

            // Refresh saved opportunities if on saved tab
            if (activeTab === "saved") {
                loadSavedOpportunitiesData();
            }

            toast.success("Opportunity saved successfully");
        } catch (error) {
            console.error("Error saving opportunity:", error);
            toast.error("Failed to save opportunity");
        }
    };

    const handleUnsaveOpportunity = async (opportunityId: string) => {
        try {
            if (!authUser?.id) {
                toast.error("Please log in to manage saved opportunities");
                return;
            }

            // Use auth user ID directly since saved_opportunities.talent_id references auth.users(id)
            const { error } = await supabase
                .from('saved_opportunities')
                .delete()
                .eq('talent_id', authUser.id)
                .eq('opportunity_id', opportunityId);

            if (error) {
                throw error;
            }

            const newSavedIds = new Set(savedOpportunityIds);
            newSavedIds.delete(opportunityId);
            setSavedOpportunityIds(newSavedIds);

            // Refresh saved opportunities if on saved tab
            if (activeTab === "saved") {
                loadSavedOpportunitiesData();
            }

            toast.success("Opportunity removed from saved");
        } catch (error) {
            console.error("Error unsaving opportunity:", error);
            toast.error("Failed to remove opportunity");
        }
    };

    const handleApplyToOpportunity = (opportunity: Opportunity) => {
        // Navigate to application/payment page
        router.push(`/talent/apply/${opportunity.id}`);
    };

    const handleViewDetails = (opportunity: Opportunity) => {
        setSelectedOpportunity(opportunity);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOpportunity(null);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (activeTab === "all") {
            await loadOpportunities();
        } else {
            await loadSavedOpportunitiesData();
        }
        setRefreshing(false);
        toast.success(`${activeTab === "all" ? "Opportunities" : "Saved opportunities"} refreshed`);
    };

    const clearFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    return (
        <div className="space-y-6">
            {/* Header - Mobile Optimized */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Browse Opportunities</h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Discover opportunities that match your skills and interests
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            size="sm"
                            className="flex-1 sm:flex-none"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                        <div className="flex items-center border rounded-lg">
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                aria-label="List view"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                aria-label="Grid view"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                    <Button
                        variant={activeTab === "all" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("all")}
                        className={`relative ${
                            activeTab === "all" 
                                ? "bg-white shadow-sm text-gray-900" 
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <Search className="h-4 w-4 mr-2" />
                        All Jobs
                        <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                            {opportunities.length}
                        </span>
                    </Button>
                    <Button
                        variant={activeTab === "saved" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("saved")}
                        className={`relative ${
                            activeTab === "saved" 
                                ? "bg-white shadow-sm text-gray-900" 
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Saved Jobs
                        <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                            {savedOpportunityIds.size}
                        </span>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <OpportunityFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
                resultsCount={filteredOpportunities.length}
                isLoading={loading}
            />

            {/* Results */}
            {(activeTab === "all" && loading) || (activeTab === "saved" && savedLoading) ? (
                <div className="flex justify-center py-12">
                    <LoadingAnimation size="md" text={`Loading ${activeTab === "all" ? "opportunities" : "saved opportunities"}...`} />
                </div>
            ) : filteredOpportunities.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        {activeTab === "saved" ? (
                            <>
                                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved opportunities yet</h3>
                                <p className="text-gray-600 mb-6">
                                    Start exploring opportunities and save the ones that interest you. 
                                    Your saved opportunities will appear here for easy access.
                                </p>
                                <Button onClick={() => setActiveTab("all")} variant="outline">
                                    Browse All Jobs
                                </Button>
                            </>
                        ) : (
                            <>
                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                                <p className="text-gray-600 mb-6">
                                    Try adjusting your filters or search terms to find more opportunities.
                                </p>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear All Filters
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" : "space-y-4 md:space-y-6"}>
                    {filteredOpportunities.map((opportunity) => (
                        <OpportunityCard
                            key={opportunity.id}
                            opportunity={opportunity}
                            onSave={handleSaveOpportunity}
                            onUnsave={handleUnsaveOpportunity}
                            onApply={handleApplyToOpportunity}
                            onViewDetails={handleViewDetails}
                            compact={viewMode === "grid"}
                        />
                    ))}
                </div>
            )}

            {/* Load More Button (for pagination) */}
            {filteredOpportunities.length > 0 && (
                <div className="flex justify-center pt-8">
                    <Button variant="outline" size="lg">
                        Load More Opportunities
                    </Button>
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
