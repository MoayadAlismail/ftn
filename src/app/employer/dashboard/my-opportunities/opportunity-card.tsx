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
import { useLanguage } from "@/contexts/LanguageContext";
import { employerTranslations } from "@/lib/language";

export interface Opportunity {
    id: string;
    title: string;
    company_name?: string;
    company?: string;
    company_logo_url?: string;
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
    const { language } = useLanguage();
    const t = employerTranslations[language];
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
        <Card className="w-full hover:shadow-md hover:-translate-y-0.5 hover:border-gray-400 transition-[transform,box-shadow,border-color] duration-75">
            <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex-1">
                                {opportunity.title}
                            </CardTitle>
                            <Badge className="bg-green-100 text-green-800 flex-shrink-0 sm:hidden">
                                {t.active}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{opportunity.company_name || opportunity.company}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <MapPin size={14} className="flex-shrink-0" />
                                <span className="truncate">{opportunity.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={14} className="flex-shrink-0" />
                                <span>{opportunity.workstyle}</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-2">
                        <Badge className="bg-green-100 text-green-800">
                            {t.active}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(opportunity.workstyle || "")}>
                            {opportunity.workstyle}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4 p-4 sm:p-6">
                {/* Job Description Section */}
                <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">{t.jobDescription}</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleDescription}
                            className="h-6 px-2 text-gray-500 hover:text-gray-700"
                        >
                            {isDescriptionExpanded ? (
                                <>
                                    <ChevronUp size={14} />
                                    <span className="ml-1 text-xs">{t.showLess}</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={14} />
                                    <span className="ml-1 text-xs">{t.showMore}</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <div className={`transition-[max-height,opacity] duration-150 ${isDescriptionExpanded ? 'max-h-96 opacity-100' : 'max-h-20 opacity-90'
                        } overflow-hidden`}>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {opportunity.description}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                        <button
                            type="button"
                            onClick={() => onViewApplicants?.(opportunity.id)}
                            className="flex items-center gap-1 hover:text-gray-700 underline-offset-2 hover:underline cursor-pointer"
                            aria-label="View applicants"
                        >
                            <Users size={14} className="flex-shrink-0" />
                            <span>{opportunity.applications} {t.applications}</span>
                        </button>
                        <div className="flex items-center gap-1">
                            <Calendar size={14} className="flex-shrink-0" />
                            <span>{t.posted} {getRelativeTime(opportunity.created_at)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {onView && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onView(opportunity.id)}
                                className="flex items-center justify-center gap-1"
                            >
                                <Eye size={14} />
                                <span>{t.view}</span>
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(opportunity.id)}
                                className="flex items-center justify-center gap-1"
                            >
                                <Edit size={14} />
                                <span>{t.edit}</span>
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(opportunity.id)}
                                className="flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 size={14} />
                                <span>{t.delete}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 