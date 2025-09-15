"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Search,
  Calendar,
  Building2,
  MapPin,
  RefreshCw,
  Filter,
  Eye
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Application {
  id: string;
  user_id: string;
  opp_id: string;
  created_at: string;
  opportunity?: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    industry: string;
    workstyle: string;
    skills: string[];
    description: string;
  };
}

interface ApplicationStats {
  total: number;
  thisMonth: number;
}

export default function TalentApplicationsPage() {
  const { user, authUser, isLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    thisMonth: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadApplications();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [applications, searchQuery, industryFilter]);

  const loadApplications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch applications with opportunity details
      const { data: interests, error } = await supabase
        .from("interests")
        .select(`
          id,
          user_id,
          opp_id,
          created_at,
          opportunities (
            id,
            title,
            company_name,
            location,
            industry,
            workstyle,
            skills,
            description
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
        return;
      }

      const applicationsData = interests?.map(interest => ({
        ...interest,
        opportunity: Array.isArray(interest.opportunities) ? interest.opportunities[0] : interest.opportunities
      })) || [];

      setApplications(applicationsData);
      calculateStats(applicationsData);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps: Application[]) => {
    const total = apps.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = apps.filter(app => {
      const appDate = new Date(app.created_at);
      return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
    }).length;
    
    setStats({ total, thisMonth });
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.opportunity?.title.toLowerCase().includes(query) ||
        app.opportunity?.company_name.toLowerCase().includes(query) ||
        app.opportunity?.industry.toLowerCase().includes(query)
      );
    }

    // Industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(app => app.opportunity?.industry === industryFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
    toast.success("Applications refreshed");
  };


  const getUniqueIndustries = () => {
    const industries = applications
      .map(app => app.opportunity?.industry)
      .filter(Boolean)
      .filter((industry, index, array) => array.indexOf(industry) === index);
    return industries;
  };

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-4 md:space-y-0 md:flex md:items-start md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Track and manage your job applications
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          size="sm"
          className="w-full md:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">This Month</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Industry</label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  {getUniqueIndustries().map((industry) => (
                    <SelectItem key={industry} value={industry!}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="py-8 md:py-12 text-center px-4">
            <FileText className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              {applications.length === 0 ? "No applications yet" : "No applications match your filters"}
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
              {applications.length === 0 
                ? "Start applying to opportunities to see them here."
                : "Try adjusting your search criteria to see more results."
              }
            </p>
            {applications.length === 0 && (
              <Link href="/talent/opportunities">
                <Button className="w-full md:w-auto">Browse Opportunities</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                {/* Mobile Layout - Stack vertically */}
                <div className="block md:hidden space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {application.opportunity?.title}
                    </h3>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span>{application.opportunity?.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{application.opportunity?.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    {application.opportunity?.description && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {application.opportunity.description.substring(0, 120)}...
                      </p>
                    )}

                    {application.opportunity?.skills && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {application.opportunity.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {application.opportunity.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.opportunity.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(`/talent/opportunities/${application.opp_id}`, '_blank');
                    }}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Job Details
                  </Button>
                </div>

                {/* Desktop Layout - Original horizontal layout */}
                <div className="hidden md:flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.opportunity?.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {application.opportunity?.company_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.opportunity?.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                          </div>
                        </div>

                        {application.opportunity?.description && (
                          <p className="text-gray-700 mb-3 line-clamp-2">
                            {application.opportunity.description.substring(0, 150)}...
                          </p>
                        )}

                        {application.opportunity?.skills && (
                          <div className="flex flex-wrap gap-2">
                            {application.opportunity.skills.slice(0, 4).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {application.opportunity.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{application.opportunity.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(`/talent/opportunities/${application.opp_id}`, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}