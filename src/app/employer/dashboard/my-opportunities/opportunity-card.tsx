import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Clock,
    Users,
    Edit,
    Eye,
    Trash2,
    Calendar,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useState } from "react";
import { getRelativeTime } from "@/lib/utils/time";

export interface Opportunity {
    id: string;
    title: string;
    company_name?: string;
    company?: string;
    location: string;
    workstyle?: string;
    postedDate?: string;
    created_at: string;
    applications: number;
    description: string;
    user_id: string;
    industry?: string;
    skills?: string[];
}

interface OpportunityCardProps {
    opportunity: Opportunity;
    onEdit?: (id: string) => void;
    onView?: (id: string) => void;
    onDelete?: (id: string) => void;
    onViewApplicants?: (id: string) => void;
}

export function OpportunityCard({
    opportunity,
    onEdit,
    onView,
    onDelete,
    onViewApplicants
}: OpportunityCardProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const typeColors: Record<string, string> = {
        "Full-time": "bg-primary/10 text-primary",
        "Part-time": "bg-purple-100 text-purple-800",
        "Contract": "bg-orange-100 text-orange-800",
        "Internship": "bg-pink-100 text-pink-800"
    };

    const getTypeColor = (type: string) => {
        return typeColors[type] || "bg-gray-100 text-gray-800";
    };

    const toggleDescription = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    return (
        <Card className="w-full hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                            {opportunity.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mb-2">{opportunity.company_name || opportunity.company}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{opportunity.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{opportunity.workstyle}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-100 text-green-800">
                            Active
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(opportunity.workstyle || "")}>
                            {opportunity.workstyle}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
                {/* Job Description Section */}
                <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Job Description</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleDescription}
                            className="h-6 px-2 text-gray-500 hover:text-gray-700"
                        >
                            {isDescriptionExpanded ? (
                                <>
                                    <ChevronUp size={14} />
                                    <span className="ml-1 text-xs">Show Less</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={14} />
                                    <span className="ml-1 text-xs">Show More</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <div className={`transition-all duration-300 ease-in-out ${isDescriptionExpanded ? 'max-h-96 opacity-100' : 'max-h-20 opacity-90'
                        } overflow-hidden`}>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {opportunity.description}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button
                            type="button"
                            onClick={() => onViewApplicants?.(opportunity.id)}
                            className="flex items-center gap-1 hover:text-gray-700 underline-offset-2 hover:underline cursor-pointer"
                            aria-label="View applicants"
                        >
                            <Users size={14} />
                            <span>{opportunity.applications} applications</span>
                        </button>
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Posted {getRelativeTime(opportunity.created_at)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onView && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onView(opportunity.id)}
                                className="flex items-center gap-1"
                            >
                                <Eye size={14} />
                                View
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(opportunity.id)}
                                className="flex items-center gap-1"
                            >
                                <Edit size={14} />
                                Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(opportunity.id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                                <Trash2 size={14} />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 