"use client";

import { useState, memo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    MapPin,
    Clock,
    DollarSign,
    Users,
    Heart,
    HeartOff,
    ExternalLink,
    Briefcase,
    Calendar,
    Eye,
    Share2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Opportunity {
    id: string;
    title: string;
    company_name: string;
    location: string;
    industry: string;
    workstyle: string;
    skills: string[];
    description: string;
    isSaved?: boolean;
    matchScore?: number; // 0-100 AI match percentage
    created_at?: string;
}

interface OpportunityCardProps {
    opportunity: Opportunity;
    onSave?: (opportunityId: string) => void;
    onUnsave?: (opportunityId: string) => void;
    onApply?: (opportunity: Opportunity) => void;
    onViewDetails?: (opportunity: Opportunity) => void;
    compact?: boolean;
}

const OpportunityCard = memo(function OpportunityCard({
    opportunity,
    onSave,
    onUnsave,
    onApply,
    onViewDetails,
    compact = false
}: OpportunityCardProps) {
    const [isSaved, setIsSaved] = useState(opportunity.isSaved || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveToggle = useCallback(async () => {
        setIsLoading(true);
        try {
            if (isSaved) {
                await onUnsave?.(opportunity.id);
                setIsSaved(false);
            } else {
                await onSave?.(opportunity.id);
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error toggling save status:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isSaved, onUnsave, onSave, opportunity.id]);

    const handleApply = useCallback(() => {
        onApply?.(opportunity);
    }, [onApply, opportunity]);

    const handleViewDetails = useCallback(() => {
        onViewDetails?.(opportunity);
    }, [onViewDetails, opportunity]);

    const handleShare = useCallback(async () => {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${opportunity.title} at ${opportunity.company_name}`,
                    text: opportunity.description.substring(0, 200) + '...',
                    url: currentUrl
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(currentUrl);
        }
    }, [opportunity.title, opportunity.company_name, opportunity.description]);

    const postedTime = opportunity.created_at 
        ? formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })
        : 'Recently posted';

    if (compact) {
        return (
            <Card className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                    {/* Mobile Layout - Stack content */}
                    <div className="block sm:hidden space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{opportunity.title}</h3>
                                <p className="text-sm text-gray-600 truncate">{opportunity.company_name}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {opportunity.location}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {opportunity.workstyle}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {opportunity.industry}
                            </Badge>
                            {opportunity.matchScore && (
                                <Badge variant="default" className="bg-green-500 text-xs">
                                    {opportunity.matchScore}% match
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleViewDetails} variant="outline" size="sm" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                            <Button onClick={handleApply} size="sm" className="flex-1">
                                Apply Now
                            </Button>
                            <Button
                                variant={isSaved ? "default" : "outline"}
                                size="sm"
                                onClick={handleSaveToggle}
                                disabled={isLoading}
                            >
                                {isSaved ? (
                                    <HeartOff className="h-4 w-4" />
                                ) : (
                                    <Heart className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Desktop Layout - Original horizontal layout */}
                    <div className="hidden sm:block" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{opportunity.title}</h3>
                                        <p className="text-sm text-gray-600 truncate">{opportunity.company_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {opportunity.location}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {opportunity.workstyle}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                {opportunity.industry}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                {opportunity.matchScore && (
                                    <Badge variant="default" className="bg-green-500">
                                        {opportunity.matchScore}% match
                                    </Badge>
                                )}
                                <Button
                                    variant={isSaved ? "default" : "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveToggle();
                                    }}
                                    disabled={isLoading}
                                >
                                    {isSaved ? (
                                        <HeartOff className="h-4 w-4" />
                                    ) : (
                                        <Heart className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                        {opportunity.title}
                                    </h3>
                                    <p className="text-lg text-gray-700 mb-2">{opportunity.company_name}</p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {opportunity.location}
                                        </Badge>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {opportunity.workstyle}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {opportunity.industry}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    {opportunity.matchScore && (
                                        <Badge variant="default" className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                            {opportunity.matchScore}% match
                                        </Badge>
                                    )}
                                    <Button
                                        variant={isSaved ? "default" : "outline"}
                                        size="sm"
                                        onClick={handleSaveToggle}
                                        disabled={isLoading}
                                    >
                                        {isSaved ? (
                                            <>
                                                <Heart className="h-4 w-4 fill-current sm:mr-2" />
                                                <span className="hidden sm:inline">Saved</span>
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="h-4 w-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Save</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Posted Time */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{postedTime}</span>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-gray-700 leading-relaxed line-clamp-3">
                        {opportunity.description}
                    </p>
                </div>

                {/* Skills */}
                {opportunity.skills && opportunity.skills.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {opportunity.skills.slice(0, 6).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                            {opportunity.skills.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                    +{opportunity.skills.length - 6} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons - Mobile Responsive */}
                <div className="pt-4 border-t space-y-3">
                    {/* Mobile Layout - Stack vertically */}
                    <div className="flex flex-col sm:hidden space-y-3">
                        <Button onClick={handleApply} size="sm" className="w-full">
                            Apply Now
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleViewDetails} variant="outline" size="sm" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                            <Button onClick={handleShare} variant="ghost" size="sm" className="flex-1">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button onClick={handleViewDetails} variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                            <Button onClick={handleShare} variant="ghost" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button onClick={handleApply} size="sm">
                                Apply Now
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export default OpportunityCard;

