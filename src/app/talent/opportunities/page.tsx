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
    RefreshCw
} from "lucide-react";
import OpportunityFilters, { type OpportunityFilters as FilterType } from "@/features/talent/opportunities/components/opportunity-filters";
import OpportunityCard, { type Opportunity } from "@/features/talent/opportunities/components/opportunity-card";
import LoadingAnimation from "@/components/loadingAnimation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

// Mock data for demonstration
const MOCK_OPPORTUNITIES: Opportunity[] = [
    {
        id: "1",
        title: "Senior Frontend Developer",
        company: "TechCorp Saudi",
        location: "Riyadh",
        workStyle: "Hybrid",
        jobType: "Full-time",
        experience: "Senior Level",
        industry: "Technology",
        salaryMin: 15000,
        salaryMax: 25000,
        currency: "SAR",
        description: "We are looking for a Senior Frontend Developer to join our dynamic team. You will be responsible for building modern, responsive web applications using React, TypeScript, and modern CSS frameworks. Our ideal candidate has strong experience in frontend architecture and a passion for creating exceptional user experiences.",
        requirements: [
            "5+ years of React experience",
            "Strong TypeScript skills",
            "Experience with modern CSS frameworks",
            "Knowledge of state management libraries",
            "Experience with testing frameworks"
        ],
        benefits: [
            "Health Insurance",
            "Annual Bonus",
            "Flexible Hours",
            "Professional Development",
            "Remote Work Options"
        ],
        skills: ["React", "TypeScript", "CSS", "JavaScript", "Git", "Tailwind CSS"],
        companySize: "Medium (51-200)",
        postedAt: "2024-01-15T10:00:00Z",
        expiresAt: "2024-02-15T23:59:59Z",
        isRemote: false,
        matchScore: 92,
        isSaved: false
    },
    {
        id: "2",
        title: "Product Manager",
        company: "Innovation Labs",
        location: "Jeddah",
        workStyle: "Remote",
        jobType: "Full-time",
        experience: "Mid Level",
        industry: "Technology",
        salaryMin: 12000,
        salaryMax: 18000,
        currency: "SAR",
        description: "Join our product team as a Product Manager where you'll drive the development of cutting-edge SaaS solutions. You'll work closely with engineering, design, and business teams to define product strategy and roadmap.",
        requirements: [
            "3+ years of product management experience",
            "Experience with agile methodologies",
            "Strong analytical skills",
            "Excellent communication skills"
        ],
        benefits: [
            "Equity Package",
            "Health Insurance",
            "Learning Budget",
            "Flexible PTO"
        ],
        skills: ["Product Strategy", "Agile", "Analytics", "User Research", "Roadmapping"],
        companySize: "Startup (1-10)",
        postedAt: "2024-01-14T15:30:00Z",
        isRemote: true,
        matchScore: 85,
        isSaved: true
    },
    {
        id: "3",
        title: "Data Scientist Intern",
        company: "Saudi Data Co",
        location: "Dammam",
        workStyle: "On-site",
        jobType: "Internship",
        experience: "Entry Level",
        industry: "Technology",
        salaryMin: 3000,
        salaryMax: 5000,
        currency: "SAR",
        description: "Exciting internship opportunity for a Data Scientist to work with large datasets and build machine learning models. Perfect for recent graduates or students looking to gain hands-on experience in data science.",
        requirements: [
            "Bachelor's degree in Data Science, Computer Science, or related field",
            "Knowledge of Python and pandas",
            "Basic understanding of machine learning",
            "Strong mathematical background"
        ],
        benefits: [
            "Mentorship Program",
            "Training Budget",
            "Networking Opportunities",
            "Potential for Full-time Offer"
        ],
        skills: ["Python", "Pandas", "Machine Learning", "Statistics", "SQL"],
        companySize: "Large (201-1000)",
        postedAt: "2024-01-13T09:00:00Z",
        expiresAt: "2024-01-30T23:59:59Z",
        isRemote: false,
        matchScore: 78,
        isSaved: false
    },
    {
        id: "4",
        title: "Marketing Manager",
        company: "Retail Plus",
        location: "Riyadh",
        workStyle: "Hybrid",
        jobType: "Full-time",
        experience: "Mid Level",
        industry: "Retail",
        salaryMin: 10000,
        salaryMax: 15000,
        currency: "SAR",
        description: "Lead our marketing efforts across digital and traditional channels. You'll develop comprehensive marketing strategies, manage campaigns, and analyze performance metrics to drive business growth.",
        requirements: [
            "3+ years of marketing experience",
            "Digital marketing expertise",
            "Campaign management experience",
            "Strong analytical skills"
        ],
        benefits: [
            "Health Insurance",
            "Performance Bonus",
            "Career Development",
            "Employee Discounts"
        ],
        skills: ["Digital Marketing", "SEO", "Social Media", "Analytics", "Campaign Management"],
        companySize: "Large (201-1000)",
        postedAt: "2024-01-12T14:20:00Z",
        isRemote: false,
        matchScore: 72,
        isSaved: false
    }
];

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

// Loading skeleton for opportunities page
function OpportunitiesPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>

            {/* Filters skeleton */}
            <div className="bg-white p-6 rounded-lg border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>

            {/* Opportunities skeleton */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="flex gap-2">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="h-6 bg-gray-200 rounded w-16"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TalentOpportunitiesContent() {
    const { user, authUser, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
    const [filters, setFilters] = useState<FilterType>(DEFAULT_FILTERS);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savedOpportunityIds, setSavedOpportunityIds] = useState<Set<string>>(new Set());

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
        loadSavedOpportunities();
    }, []);

    // Apply filters whenever filters or opportunities change
    useEffect(() => {
        applyFilters();
    }, [filters, opportunities]);

    const loadOpportunities = async () => {
        setLoading(true);
        try {
            // In a real app, this would be an API call to your backend
            // For demo, we'll use mock data
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            setOpportunities(MOCK_OPPORTUNITIES);
        } catch (error) {
            console.error("Error loading opportunities:", error);
            toast.error("Failed to load opportunities");
        } finally {
            setLoading(false);
        }
    };

    const loadSavedOpportunities = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            // In a real app, fetch saved opportunities from database
            // For demo, we'll use localStorage
            const saved = localStorage.getItem('savedOpportunities');
            if (saved) {
                setSavedOpportunityIds(new Set(JSON.parse(saved)));
            }
        } catch (error) {
            console.error("Error loading saved opportunities:", error);
        }
    };

    const applyFilters = useCallback(() => {
        let filtered = [...opportunities];

        // Update saved status
        filtered = filtered.map(opp => ({
            ...opp,
            isSaved: savedOpportunityIds.has(opp.id)
        }));

        // Apply search filter
        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(opp =>
                opp.title.toLowerCase().includes(searchLower) ||
                opp.company.toLowerCase().includes(searchLower) ||
                opp.description.toLowerCase().includes(searchLower) ||
                opp.skills.some(skill => skill.toLowerCase().includes(searchLower))
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

        // Apply job type filter
        if (filters.jobType.length > 0) {
            filtered = filtered.filter(opp =>
                filters.jobType.includes(opp.jobType)
            );
        }

        // Apply experience level filter
        if (filters.experienceLevel.length > 0) {
            filtered = filtered.filter(opp =>
                filters.experienceLevel.includes(opp.experience)
            );
        }

        // Apply work style filter
        if (filters.workStyle.length > 0) {
            filtered = filtered.filter(opp =>
                filters.workStyle.includes(opp.workStyle)
            );
        }

        // Apply salary range filter
        filtered = filtered.filter(opp => {
            if (!opp.salaryMin && !opp.salaryMax) return true;
            const minSalary = opp.salaryMin || 0;
            const maxSalary = opp.salaryMax || Infinity;
            return maxSalary >= filters.salaryRange[0] && minSalary <= filters.salaryRange[1];
        });

        // Apply company size filter
        if (filters.companySize.length > 0) {
            filtered = filtered.filter(opp =>
                filters.companySize.includes(opp.companySize)
            );
        }

        // Apply remote filter
        if (filters.remote) {
            filtered = filtered.filter(opp => opp.isRemote || opp.workStyle === "Remote");
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
            if (daysAgo) {
                const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(opp => new Date(opp.postedAt) >= cutoffDate);
            }
        }

        // Apply sorting
        switch (filters.sortBy) {
            case "newest":
                filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
                break;
            case "oldest":
                filtered.sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
                break;
            case "salary_high":
                filtered.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
                break;
            case "salary_low":
                filtered.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
                break;
            case "relevance":
            default:
                filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                break;
        }

        setFilteredOpportunities(filtered);
    }, [filters, opportunities, savedOpportunityIds]);

    const handleSaveOpportunity = async (opportunityId: string) => {
        try {
            const newSavedIds = new Set(savedOpportunityIds);
            newSavedIds.add(opportunityId);
            setSavedOpportunityIds(newSavedIds);

            // In a real app, save to database
            localStorage.setItem('savedOpportunities', JSON.stringify(Array.from(newSavedIds)));

            toast.success("Opportunity saved successfully");
        } catch (error) {
            console.error("Error saving opportunity:", error);
            toast.error("Failed to save opportunity");
        }
    };

    const handleUnsaveOpportunity = async (opportunityId: string) => {
        try {
            const newSavedIds = new Set(savedOpportunityIds);
            newSavedIds.delete(opportunityId);
            setSavedOpportunityIds(newSavedIds);

            // In a real app, remove from database
            localStorage.setItem('savedOpportunities', JSON.stringify(Array.from(newSavedIds)));

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
        // Navigate to detailed opportunity view
        router.push(`/talent/opportunities/${opportunity.id}`);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadOpportunities();
        setRefreshing(false);
        toast.success("Opportunities refreshed");
    };

    const clearFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Browse Opportunities</h1>
                    <p className="text-gray-600 mt-1">
                        Discover opportunities that match your skills and interests
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        size="sm"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <div className="flex items-center border rounded-lg">
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                    </div>
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
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingAnimation size="md" text="Loading opportunities..." />
                </div>
            ) : filteredOpportunities.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your filters or search terms to find more opportunities.
                        </p>
                        <Button onClick={clearFilters} variant="outline">
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-6"}>
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
