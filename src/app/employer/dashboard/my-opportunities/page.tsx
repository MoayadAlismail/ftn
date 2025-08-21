"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OpportunityCard, type Opportunity } from "./components/opportunity-card";
import { Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/loadingAnimation";



export default function MyOpportunitiesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [opportunities, setOpportunities] = useState<Opportunity[]>();
    const [loading, setLoading] = useState(true);
    const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
    const [applicants, setApplicants] = useState<Array<{ id: string; full_name: string; email: string; bio?: string; location_pref?: string; industry_pref?: string[]; work_style_pref?: string[] }>>([]);

    useEffect(() => {
        const fetchOpportunities = async () => {
            setLoading(true);
            if (!user?.id) {
                setLoading(false);
                return;
            }

            // Fetch opportunities with application count from interests table
            const { data, error } = await supabase
                .from("opportunities")
                .select(`
                    *,
                    application_count:interests(count)
                `)
                .eq("user_id", user.id);

            if (error) {
                console.error("Error fetching opportunities:", error);
            } else {
                // Transform the data to include application count as a number
                const transformedData = data?.map(opp => ({
                    ...opp,
                    applications: opp.application_count?.[0]?.count || 0
                }));
                setOpportunities(transformedData);
            }
            setLoading(false);
        };
        fetchOpportunities();
    }, [user?.id]);

    const handleEdit = (id: string) => {
        console.log("Edit opportunity:", id);
        // Navigate to edit page or open edit modal
    };

    const handleView = (id: string) => {
        console.log("View opportunity:", id);
        // Navigate to view page or open view modal
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this opportunity?")) {
            setOpportunities(prev => prev?.filter(opp => opp.id !== id));
        }
    };

    // const handleCreateNew = () => {
    //     console.log("Create new opportunity");
    // };

    const handleViewApplicants = async (opportunityId: string) => {
        console.log("View applicants for opportunity:", opportunityId);
        const opp = opportunities?.find(o => o.id === opportunityId) || null;
        setSelectedOpp(opp);
        setIsApplicantsOpen(true);
        setApplicantsLoading(true);
        try {
            const { data: interestRows, error: interestsError } = await supabase
                .from("interests")
                .select("user_id")
                .eq("opp_id", opportunityId);


            if (interestsError) {
                console.error("Error fetching interests:", interestsError);
                setApplicants([]);
                return;
            }

            console.log("Interest rows:", interestRows);

            const userIds = (interestRows || []).map(r => r.user_id).filter(Boolean);
            if (userIds.length === 0) {
                setApplicants([]);
                return;
            }

            const { data: talents, error: talentsError } = await supabase
                .from("talents")
                .select("id, full_name, email, bio, location_pref, industry_pref, work_style_pref")
                .in("id", userIds);

            if (talentsError) {
                console.error("Error fetching talents:", talentsError);
                setApplicants([]);
                return;
            }

            setApplicants(talents || []);
        } finally {
            setApplicantsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Opportunities</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and track your job postings
                    </p>
                </div>
                <div className="hidden sm:block" />
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <LoadingAnimation size="md" text="Loading opportunities" />
                    </div>
                ) :
                    (opportunities?.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Search size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                            <p className="text-gray-600">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    ) : (
                        opportunities?.map((opportunity) => (
                            <OpportunityCard
                                key={opportunity.id}
                                opportunity={opportunity}
                                onEdit={handleEdit}
                                onView={handleView}
                                onDelete={handleDelete}
                                onViewApplicants={handleViewApplicants}
                            />
                        ))
                    ))}
            </div>

            {/* Floating (+) button to post new opportunity */}
            <Button
                aria-label="Post a new opportunity"
                className="!fixed top-24 right-8 z-40 w-12 h-12 rounded-full shadow-xl bg-primary hover:bg-primary/90"
                onClick={() => router.push("/employer/dashboard/home?activeTab=post")}
            >
                <Plus size={18} />
            </Button>

            {isApplicantsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Applicants{selectedOpp ? ` for ${selectedOpp.title}` : ""}</h3>
                                <p className="text-sm text-gray-500">Found {applicants.length} applicant{applicants.length === 1 ? "" : "s"}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsApplicantsOpen(false)} aria-label="Close applicants">
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto p-5">
                            {applicantsLoading ? (
                                <div className="flex justify-center py-10">
                                    <LoadingAnimation size="md" text="Loading applicants" />
                                </div>
                            ) : applicants.length === 0 ? (
                                <div className="text-center text-gray-600 py-12">No applicants yet.</div>
                            ) : (
                                <ul className="divide-y">
                                    {applicants.map((talent) => (
                                        <li key={talent.id} className="py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{talent.full_name}</div>
                                                    <div className="text-sm text-gray-600">{talent.email}</div>
                                                    {talent.bio && (
                                                        <p className="mt-1 text-sm text-gray-700 line-clamp-3">{talent.bio}</p>
                                                    )}
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {talent.work_style_pref?.map((w) => (
                                                            <span key={w} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{w}</span>
                                                        ))}
                                                        {talent.industry_pref?.map((i) => (
                                                            <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{i}</span>
                                                        ))}
                                                        {talent.location_pref && (
                                                            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{talent.location_pref}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={`mailto:${talent.email}`}>Contact</a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="px-5 py-4 border-t flex justify-end">
                            <Button onClick={() => setIsApplicantsOpen(false)} className="cursor-pointer">Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
