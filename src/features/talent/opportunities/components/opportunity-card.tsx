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
    company: string;
    companyLogo?: string;
    location: string;
    workStyle: string; // Remote, On-site, Hybrid
    jobType: string; // Full-time, Part-time, Contract, etc.
    experience: string; // Entry, Mid, Senior, Executive
    industry: string;
    salaryMin?: number;
    salaryMax?: number;
    currency: string;
    description: string;
    requirements: string[];
    benefits: string[];
    skills: string[];
    companySize: string;
    postedAt: string;
    expiresAt?: string;
    applicationUrl?: string;
    isRemote: boolean;
    isSaved?: boolean;
    matchScore?: number; // 0-100 AI match percentage
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
                    title: `${opportunity.title} at ${opportunity.company}`,
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
    }, [opportunity.title, opportunity.company, opportunity.description]);

    const formatSalary = () => {
        if (!opportunity.salaryMin && !opportunity.salaryMax) return null;

        if (opportunity.salaryMin && opportunity.salaryMax) {
            return `${opportunity.currency} ${opportunity.salaryMin.toLocaleString()} - ${opportunity.salaryMax.toLocaleString()}`;
        } else if (opportunity.salaryMin) {
            return `${opportunity.currency} ${opportunity.salaryMin.toLocaleString()}+`;
        } else {
            return `Up to ${opportunity.currency} ${opportunity.salaryMax?.toLocaleString()}`;
        }
    };

    const salary = formatSalary();
    const postedTime = formatDistanceToNow(new Date(opportunity.postedAt), { addSuffix: true });

    if (compact) {
        return (
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleViewDetails}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                                {opportunity.companyLogo ? (
                                    <img
                                        src={opportunity.companyLogo}
                                        alt={opportunity.company}
                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{opportunity.title}</h3>
                                    <p className="text-sm text-gray-600 truncate">{opportunity.company}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {opportunity.location}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {opportunity.workStyle}
                                        </Badge>
                                        {salary && (
                                            <Badge variant="secondary" className="text-xs">
                                                {salary}
                                            </Badge>
                                        )}
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
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        {opportunity.companyLogo ? (
                            <img
                                src={opportunity.companyLogo}
                                alt={opportunity.company}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                        {opportunity.title}
                                    </h3>
                                    <p className="text-lg text-gray-700 mb-2">{opportunity.company}</p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {opportunity.location}
                                        </Badge>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {opportunity.jobType}
                                        </Badge>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {opportunity.experience}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {opportunity.industry}
                                        </Badge>
                                        {opportunity.isRemote && (
                                            <Badge variant="default" className="bg-green-500">
                                                Remote
                                            </Badge>
                                        )}
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
                                                <HeartOff className="h-4 w-4 mr-2" />
                                                Saved
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="h-4 w-4 mr-2" />
                                                Save
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
                {/* Salary and Company Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {salary && (
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-600">{salary}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4" />
                            <span>{opportunity.companySize}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{postedTime}</span>
                        </div>
                        {opportunity.expiresAt && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Expires {formatDistanceToNow(new Date(opportunity.expiresAt), { addSuffix: true })}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-gray-700 leading-relaxed line-clamp-3">
                        {opportunity.description}
                    </p>
                </div>

                {/* Skills */}
                {opportunity.skills.length > 0 && (
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

                {/* Benefits Preview */}
                {opportunity.benefits.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits</h4>
                        <div className="flex flex-wrap gap-2">
                            {opportunity.benefits.slice(0, 4).map((benefit, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {benefit}
                                </Badge>
                            ))}
                            {opportunity.benefits.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{opportunity.benefits.length - 4} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
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
                        {opportunity.applicationUrl && (
                            <Button
                                onClick={() => window.open(opportunity.applicationUrl, '_blank')}
                                variant="outline"
                                size="sm"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                External Apply
                            </Button>
                        )}
                        <Button onClick={handleApply} size="sm">
                            Apply Now
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export default OpportunityCard;

