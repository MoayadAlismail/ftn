"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Search,
    MapPin,
    Building2,
    DollarSign,
    Clock,
    Users,
    Filter,
    X,
    RefreshCw,
    Briefcase
} from "lucide-react";

export interface OpportunityFilters {
    search: string;
    location: string[];
    industry: string[];
    jobType: string[];
    experienceLevel: string[];
    workStyle: string[];
    salaryRange: [number, number];
    companySize: string[];
    postedWithin: string;
    remote: boolean;
    sortBy: string;
}

interface OpportunityFiltersProps {
    filters: OpportunityFilters;
    onFiltersChange: (filters: OpportunityFilters) => void;
    onClearFilters: () => void;
    resultsCount?: number;
    isLoading?: boolean;
}

const SAUDI_CITIES = [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Dhahran",
    "Taif", "Buraidah", "Khamis Mushait", "Najran", "Jizan", "Yanbu", "Jubail"
];

const INDUSTRIES = [
    "Technology", "Finance", "Healthcare", "Education", "Manufacturing",
    "Construction", "Retail", "Hospitality", "Transportation", "Energy",
    "Telecommunications", "Government", "Non-profit", "Media", "Consulting"
];

const JOB_TYPES = [
    "Full-time", "Part-time", "Contract", "Internship", "Freelance", "Temporary"
];

const EXPERIENCE_LEVELS = [
    "Entry Level", "Mid Level", "Senior Level", "Executive", "Student"
];

const WORK_STYLES = [
    "Remote", "On-site", "Hybrid", "Flexible Hours", "Fixed Hours"
];

const COMPANY_SIZES = [
    "Startup (1-10)", "Small (11-50)", "Medium (51-200)", "Large (201-1000)", "Enterprise (1000+)"
];

const POSTED_WITHIN_OPTIONS = [
    { value: "24h", label: "Last 24 hours" },
    { value: "3d", label: "Last 3 days" },
    { value: "1w", label: "Last week" },
    { value: "2w", label: "Last 2 weeks" },
    { value: "1m", label: "Last month" },
    { value: "all", label: "All time" }
];

const SORT_OPTIONS = [
    { value: "ai_match", label: "AI Recommended" },
    { value: "relevance", label: "Most Relevant" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "salary_high", label: "Salary: High to Low" },
    { value: "salary_low", label: "Salary: Low to High" },
    { value: "company_size", label: "Company Size" }
];

export default function OpportunityFilters({
    filters,
    onFiltersChange,
    onClearFilters,
    resultsCount = 0,
    isLoading = false
}: OpportunityFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    useEffect(() => {
        // Count active filters
        let count = 0;
        if (filters.search.trim()) count++;
        if (filters.location.length > 0) count++;
        if (filters.industry.length > 0) count++;
        if (filters.jobType.length > 0) count++;
        if (filters.experienceLevel.length > 0) count++;
        if (filters.workStyle.length > 0) count++;
        if (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 50000) count++;
        if (filters.companySize.length > 0) count++;
        if (filters.postedWithin !== "all") count++;
        if (filters.remote) count++;
        if (filters.sortBy !== "relevance") count++;

        setActiveFiltersCount(count);
    }, [filters]);

    const updateFilter = (key: keyof OpportunityFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const toggleArrayFilter = (key: keyof OpportunityFilters, value: string) => {
        const currentArray = filters[key] as string[];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];

        updateFilter(key, newArray);
    };

    const removeFilterItem = (key: keyof OpportunityFilters, value: string) => {
        const currentArray = filters[key] as string[];
        updateFilter(key, currentArray.filter(item => item !== value));
    };

    return (
        <div className="space-y-4">
            {/* Search and Quick Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search opportunities by title, company, or keywords..."
                                value={filters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Quick Filters Row */}
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remote"
                                    checked={filters.remote}
                                    onCheckedChange={(checked) => updateFilter('remote', checked)}
                                />
                                <Label htmlFor="remote" className="text-sm font-medium cursor-pointer">
                                    Remote Only
                                </Label>
                            </div>

                            <Select value={filters.postedWithin} onValueChange={(value) => updateFilter('postedWithin', value)}>
                                <SelectTrigger className="w-[140px]">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {POSTED_WITHIN_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Advanced Filters
                                {activeFiltersCount > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>

                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClearFilters}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        {/* Active Filters Display */}
                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {filters.search.trim() && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        Search: "{filters.search}"
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => updateFilter('search', '')}
                                        />
                                    </Badge>
                                )}
                                {filters.location.map((location) => (
                                    <Badge key={location} variant="outline" className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {location}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeFilterItem('location', location)}
                                        />
                                    </Badge>
                                ))}
                                {filters.industry.map((industry) => (
                                    <Badge key={industry} variant="outline" className="flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {industry}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeFilterItem('industry', industry)}
                                        />
                                    </Badge>
                                ))}
                                {filters.jobType.map((type) => (
                                    <Badge key={type} variant="outline" className="flex items-center gap-1">
                                        {type}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeFilterItem('jobType', type)}
                                        />
                                    </Badge>
                                ))}
                                {filters.workStyle.map((style) => (
                                    <Badge key={style} variant="outline" className="flex items-center gap-1">
                                        {style}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeFilterItem('workStyle', style)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Results Count */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                {isLoading ? (
                                    "Searching opportunities..."
                                ) : (
                                    `${resultsCount.toLocaleString()} opportunities found`
                                )}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Filters Panel */}
            {isExpanded && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Advanced Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Location Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {SAUDI_CITIES.map((city) => (
                                        <div key={city} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`location-${city}`}
                                                checked={filters.location.includes(city)}
                                                onCheckedChange={() => toggleArrayFilter('location', city)}
                                            />
                                            <Label htmlFor={`location-${city}`} className="text-sm cursor-pointer">
                                                {city}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Industry Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Industry
                                </Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {INDUSTRIES.map((industry) => (
                                        <div key={industry} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`industry-${industry}`}
                                                checked={filters.industry.includes(industry)}
                                                onCheckedChange={() => toggleArrayFilter('industry', industry)}
                                            />
                                            <Label htmlFor={`industry-${industry}`} className="text-sm cursor-pointer">
                                                {industry}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Job Type Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Job Type
                                </Label>
                                <div className="space-y-2">
                                    {JOB_TYPES.map((type) => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`jobtype-${type}`}
                                                checked={filters.jobType.includes(type)}
                                                onCheckedChange={() => toggleArrayFilter('jobType', type)}
                                            />
                                            <Label htmlFor={`jobtype-${type}`} className="text-sm cursor-pointer">
                                                {type}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Experience Level
                                </Label>
                                <div className="space-y-2">
                                    {EXPERIENCE_LEVELS.map((level) => (
                                        <div key={level} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`exp-${level}`}
                                                checked={filters.experienceLevel.includes(level)}
                                                onCheckedChange={() => toggleArrayFilter('experienceLevel', level)}
                                            />
                                            <Label htmlFor={`exp-${level}`} className="text-sm cursor-pointer">
                                                {level}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Work Style Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Work Style</Label>
                                <div className="space-y-2">
                                    {WORK_STYLES.map((style) => (
                                        <div key={style} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`workstyle-${style}`}
                                                checked={filters.workStyle.includes(style)}
                                                onCheckedChange={() => toggleArrayFilter('workStyle', style)}
                                            />
                                            <Label htmlFor={`workstyle-${style}`} className="text-sm cursor-pointer">
                                                {style}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Company Size Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Company Size</Label>
                                <div className="space-y-2">
                                    {COMPANY_SIZES.map((size) => (
                                        <div key={size} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`size-${size}`}
                                                checked={filters.companySize.includes(size)}
                                                onCheckedChange={() => toggleArrayFilter('companySize', size)}
                                            />
                                            <Label htmlFor={`size-${size}`} className="text-sm cursor-pointer">
                                                {size}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Salary Range Filter */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Salary Range (SAR per month)
                            </Label>
                            <div className="space-y-4">
                                <Slider
                                    value={filters.salaryRange}
                                    onValueChange={(value) => updateFilter('salaryRange', value as [number, number])}
                                    max={50000}
                                    min={0}
                                    step={1000}
                                    className="w-full"
                                />
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>SAR {filters.salaryRange[0].toLocaleString()}</span>
                                    <span>SAR {filters.salaryRange[1] >= 50000 ? '50,000+' : filters.salaryRange[1].toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
