"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Building2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import OpportunityDetailModal from "@/components/opportunity-detail-modal";

interface Opportunity {
    id: string;
    title: string;
    company_name: string;
    description: string;
    location: string;
    industry: string;
    workstyle: string;
    skills: string[];
    similarity: number;
    // isPremium: boolean;
}

interface OppMatchResultsProps {
    opportunities: Opportunity[];
    isLoading: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const SkillTag = ({ skill }: { skill: string }) => (
    <span className="px-2 py-1 text-xs sm:text-sm bg-primary/10 text-primary rounded-full leading-tight">
        {skill}
    </span>
);

const LoadingSkeleton = () => (
    <div className="space-y-4 md:space-y-6 px-4">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
                <div className="h-40 md:h-48 bg-gray-200 rounded-lg"></div>
            </div>
        ))}
    </div>
);

export default function OppMatchResults({ opportunities = [], isLoading = false }: OppMatchResultsProps) {
    const { user } = useAuth();
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleApply = async (opportunityId: string) => {
        if (!user?.id) {
            toast.error("You must be signed in to apply.");
            return;
        }
        try {
            setApplyingId(opportunityId);
            const { error } = await supabase
                .from("interests")
                .insert([{ user_id: user.id, opp_id: opportunityId }]);
            if (error) {
                toast.error(error.message || "Failed to apply.");
                return;
            }
            setAppliedIds((prev) => new Set(prev).add(opportunityId));
            toast.success("Applied successfully");
        } catch (e) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setApplyingId(null);
        }
    };

    const handleViewDetails = (opportunity: Opportunity) => {
        setSelectedOpportunity(opportunity);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOpportunity(null);
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="mx-auto px-4 py-2 max-w-7xl">
            <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="space-y-4 md:space-y-6"
            >
                <div className="text-center space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 justify-center items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-block"
                        >
                            <span className="text-3xl sm:text-4xl">🎉</span>
                        </motion.div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                            Your Personalized Matches Are Ready!
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 px-4">
                        We found {opportunities.length} opportunities that perfectly match your profile. Here are your top matches:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {opportunities.map((opp) => (
                        <motion.div key={opp.id} variants={itemVariants}>
                            <Card 
                                className="p-4 md:p-6 relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                                onClick={() => handleViewDetails(opp)}
                            >
                                {/* Mobile Layout - Stack content vertically */}
                                <div className="block sm:hidden space-y-4">
                                    {/* Title and Match Score */}
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-semibold pr-2">{opp.title}</h2>
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 text-sm rounded-full ${opp.similarity >= 95
                                                ? "bg-green-100 text-green-700"
                                                : "bg-primary/15 text-primary"
                                                }`}>
                                                {opp.similarity}% Match
                                            </span>
                                            {opp.workstyle && (
                                                <span className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
                                                    {opp.workstyle}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Company and Location */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Building2 className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">{opp.company_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">{opp.location}</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 line-clamp-2">{opp.description}</p>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-1">
                                        {opp.skills.slice(0, 3).map((skill, i) => (
                                            <SkillTag key={i} skill={skill} />
                                        ))}
                                        {opp.skills.length > 3 && (
                                            <span className="text-xs text-gray-500 px-2 py-1">+{opp.skills.length - 3} more</span>
                                        )}
                                    </div>

                                    {/* Apply Button - Full width on mobile */}
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApply(opp.id);
                                        }}
                                        disabled={applyingId === opp.id || appliedIds.has(opp.id)}
                                        className="w-full flex items-center justify-center gap-2"
                                        size="sm"
                                    >
                                        {applyingId === opp.id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Applying...
                                            </>
                                        ) : appliedIds.has(opp.id) ? (
                                            <>Applied</>
                                        ) : (
                                            <>Apply Now</>
                                        )}
                                    </Button>
                                </div>

                                {/* Desktop Layout - Original horizontal layout */}
                                <div className="hidden sm:flex justify-between items-start">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-xl font-semibold">{opp.title}</h2>
                                             <span className={`px-3 py-1 text-sm rounded-full ${opp.similarity >= 95
                                                ? "bg-green-100 text-green-700"
                                                : "bg-primary/15 text-primary"
                                                }`}>
                                                {opp.similarity}% Match
                                            </span>
                                            {opp.workstyle && (
                                                 <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                                                    {opp.workstyle}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-6 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                <span>{opp.company_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{opp.location}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 line-clamp-2">{opp.description}</p>

                                        <div className="flex flex-wrap gap-2">
                                            {opp.skills.slice(0, 3).map((skill, i) => (
                                                <SkillTag key={i} skill={skill} />
                                            ))}
                                            {opp.skills.length > 3 && (
                                                <span className="text-sm text-gray-500">+{opp.skills.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApply(opp.id);
                                            }}
                                            disabled={applyingId === opp.id || appliedIds.has(opp.id)}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            {applyingId === opp.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Applying...
                                                </>
                                            ) : appliedIds.has(opp.id) ? (
                                                <>Applied</>
                                            ) : (
                                                <>Apply</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Opportunity Detail Modal */}
            <OpportunityDetailModal
                opportunity={selectedOpportunity}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onApply={handleApply}
                isApplying={applyingId === selectedOpportunity?.id}
                hasApplied={selectedOpportunity ? appliedIds.has(selectedOpportunity.id) : false}
            />
        </div>
    );
}
