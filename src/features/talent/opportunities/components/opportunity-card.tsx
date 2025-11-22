"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Bookmark } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

export interface Opportunity {
    id: string;
    title: string;
    company_name: string;
    company_logo_url?: string;
    location: string;
    industry: string;
    workstyle: string;
    skills?: string[];
    description: string;
    created_at?: string;
    isSaved?: boolean;
    matchScore?: number;
    similarity?: number;
    isAIRecommended?: boolean;
}

interface OpportunityCardProps {
    opportunity: Opportunity;
    onSave: (id: string) => void;
    onUnsave: (id: string) => void;
    onApply: (opportunity: Opportunity) => void;
    compact?: boolean;
}

export default function OpportunityCard({
    opportunity,
    onSave,
    onUnsave,
    onApply,
    compact = false
}: OpportunityCardProps) {
    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (opportunity.isSaved) {
            onUnsave(opportunity.id);
        } else {
            onSave(opportunity.id);
        }
    };

    const handleCardClick = () => {
        onApply(opportunity);
    };

    return (
        <Card 
            className="relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-400 transition-[transform,box-shadow,border-color] duration-75 cursor-pointer group"
            onClick={handleCardClick}
        >
            {/* Match Score Badge - Top Right */}
            {opportunity.matchScore && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {opportunity.matchScore}% match
                    </div>
                </div>
            )}

            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Header with Company Logo and Save Button */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <CompanyLogo 
                                logoUrl={opportunity.company_logo_url}
                                companyName={opportunity.company_name}
                                size="md"
                                className="flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary">
                                    {opportunity.title}
                                </h3>
                                <p className="text-sm text-gray-600 truncate">{opportunity.company_name}</p>
                            </div>
                        </div>
                        
                        {/* Save/Bookmark Button */}
                        <button
                            onClick={handleSaveClick}
                            className={`p-2 flex-shrink-0 ${
                                opportunity.isSaved 
                                    ? 'text-primary hover:text-primary/70' 
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                            aria-label={opportunity.isSaved ? "Unsave" : "Save"}
                        >
                            <Bookmark 
                                size={20} 
                                className={opportunity.isSaved ? 'fill-primary' : ''}
                            />
                        </button>
                    </div>

                    {/* Location and Work Style */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="flex-shrink-0" />
                            <span className="truncate">{opportunity.location}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="truncate">{opportunity.workstyle}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                        {opportunity.description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

