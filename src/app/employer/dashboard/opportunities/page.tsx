"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  X,
  Loader2,
  RefreshCw,
  CirclePlus,
  Briefcase,
  PlusCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/loadingAnimation";
import { OpportunityCard, type Opportunity } from "../my-opportunities/opportunity-card";
import { toast } from "sonner";

const workStyles = [
  "Full Time",
  "Internships",
  "Bootcamps",
  "Hackathons",
] as const;

type WorkStyle = (typeof workStyles)[number];

interface OpportunityFormData {
  title: string;
  company_name: string;
  workstyle: WorkStyle | "";
  location: string;
  industry: string;
  description: string;
  skills: string[] | string;
}

const initialFormData: OpportunityFormData = {
  title: "",
  company_name: "",
  workstyle: "",
  location: "",
  industry: "",
  description: "",
  skills: "",
};

function OpportunitiesPageContent() {
  const { user, authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tab management
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") === "post" ? "post" : "manage";
  });
  
  // Shared states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Post opportunity states
  const [formData, setFormData] = useState<OpportunityFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // My opportunities states
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [applicants, setApplicants] = useState<Array<{ 
    id: string; 
    full_name: string; 
    email: string; 
    bio?: string; 
    location_pref?: string; 
    industry_pref?: string[]; 
    work_style_pref?: string[] 
  }>>([]);

  // Load opportunities
  const loadOpportunities = useCallback(async (showRefreshToast = false) => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("opportunities")
        .select(`
          *,
          application_count:interests(count)
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching opportunities:", error);
        if (!showRefreshToast) toast.error("Failed to load opportunities");
        return;
      }

      // Transform the data to include application count as a number
      const transformedData = data?.map(opp => ({
        ...opp,
        applications: opp.application_count?.[0]?.count || 0
      }));
      setOpportunities(transformedData || []);
    } catch (error) {
      console.error("Error loading opportunities:", error);
      if (!showRefreshToast) toast.error("An error occurred while loading opportunities");
    }
  }, [user?.id]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadOpportunities();
      setLoading(false);
    };
    
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadOpportunities]);

  // Handle tab change from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "post") {
      setActiveTab("post");
    }
  }, [searchParams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOpportunities(true);
    setRefreshing(false);
    toast.success("Opportunities refreshed successfully");
  };

  // Post opportunity handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkStyleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      workstyle: value as WorkStyle,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (
        !formData.title ||
        !formData.company_name ||
        !formData.workstyle ||
        !formData.location
      ) {
        throw new Error("Please fill in all required fields");
      }

      const user_data = await supabase.auth.getUser();
      const user_id = user_data.data.user?.id;
      const dataToInsert = { ...formData, user_id: user_id };
      dataToInsert.skills = (dataToInsert.skills as string).split(",").map((skill) => skill.trim());

      const { data, error } = await supabase
        .from("opportunities")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      toast.success("Opportunity posted successfully");
      
      // Reset form
      setFormData(initialFormData);
      
      // Refresh opportunities list
      await loadOpportunities();
      
      // Switch to manage tab to see the new opportunity
      setActiveTab("manage");
      
    } catch (error: any) {
      console.error("Error posting opportunity:", error);
      toast.error(error.message || "Failed to post opportunity");
    } finally {
      setIsSubmitting(false);
    }
  };

  // My opportunities handlers
  const handleEdit = (id: string) => {
    console.log("Edit opportunity:", id);
    // Navigate to edit page or open edit modal
  };

  const handleView = (id: string) => {
    console.log("View opportunity:", id);
    // Navigate to view page or open view modal
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      try {
        const { error } = await supabase
          .from("opportunities")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }

        setOpportunities(prev => prev.filter(opp => opp.id !== id));
        toast.success("Opportunity deleted successfully");
      } catch (error) {
        console.error("Error deleting opportunity:", error);
        toast.error("Failed to delete opportunity");
      }
    }
  };

  const handleViewApplicants = async (opportunityId: string) => {
    const opp = opportunities.find(o => o.id === opportunityId) || null;
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
    } catch (error) {
      console.error("Error loading applicants:", error);
      toast.error("Failed to load applicants");
    } finally {
      setApplicantsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingAnimation size="md" text="Loading opportunities..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Post new opportunities and manage your existing job postings
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="post" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
            <PlusCircle size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Post New Opportunity</span>
            <span className="sm:hidden">Post New</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
            <Briefcase size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">My Opportunities ({opportunities.length})</span>
            <span className="sm:hidden">My Jobs ({opportunities.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Post Opportunity Tab - Mobile Optimized */}
        <TabsContent value="post" className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Create New Job Posting
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Fill in the details below to post a new opportunity and attract talented candidates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <Input
                      name="title"
                      placeholder="e.g. Senior Software Engineer"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <Input
                      name="company_name"
                      placeholder="Your company name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Style *
                    </label>
                    <Select value={formData.workstyle} onValueChange={handleWorkStyleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work style" />
                      </SelectTrigger>
                      <SelectContent>
                        {workStyles.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <Input
                      name="location"
                      placeholder="e.g. San Francisco, CA or Remote"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <Input
                      name="industry"
                      placeholder="e.g. Technology, Healthcare"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Skills
                    </label>
                    <Input
                      name="skills"
                      placeholder="e.g. React, Node.js, Python (comma-separated)"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description
                    </label>
                    <Textarea
                      name="description"
                      placeholder="Describe the role, responsibilities, and requirements..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setFormData(initialFormData)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Reset Form
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto sm:min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <CirclePlus className="h-4 w-4 mr-2" />
                      Post Opportunity
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* My Opportunities Tab - Mobile Optimized */}
        <TabsContent value="manage" className="space-y-4 sm:space-y-6">
          {opportunities.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="text-gray-400 mb-4">
                <Briefcase size={36} className="sm:w-12 sm:h-12 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No opportunities posted yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Create your first job posting to start attracting talented candidates.
              </p>
              <Button onClick={() => setActiveTab("post")} className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Post Your First Opportunity</span>
                <span className="sm:hidden">Post First Job</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  onViewApplicants={handleViewApplicants}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Applicants Modal - Mobile Optimized */}
      {isApplicantsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  Applicants{selectedOpp ? ` for ${selectedOpp.title}` : ""}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Found {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsApplicantsOpen(false)} 
                aria-label="Close applicants"
                className="flex-shrink-0"
              >
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {applicantsLoading ? (
                <div className="flex justify-center py-10">
                  <LoadingAnimation size="md" text="Loading applicants" />
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center text-gray-600 py-12">
                  No applicants yet.
                </div>
              ) : (
                <ul className="divide-y">
                  {applicants.map((talent) => (
                    <li key={talent.id} className="py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            {talent.full_name}
                          </div>
                          <div className="text-sm text-gray-600 break-words">
                            {talent.email}
                          </div>
                          {talent.bio && (
                            <p className="mt-1 text-sm text-gray-700 line-clamp-2 sm:line-clamp-3">
                              {talent.bio}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                            {talent.work_style_pref?.map((w) => (
                              <span 
                                key={w} 
                                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                              >
                                {w}
                              </span>
                            ))}
                            {talent.industry_pref?.map((i) => (
                              <span 
                                key={i} 
                                className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                              >
                                {i}
                              </span>
                            ))}
                            {talent.location_pref && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                                {talent.location_pref}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                            <a href={`mailto:${talent.email}`}>Contact</a>
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-t flex justify-end">
              <Button onClick={() => setIsApplicantsOpen(false)} className="w-full sm:w-auto">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <LoadingAnimation size="md" text="Loading..." />
      </div>
    }>
      <OpportunitiesPageContent />
    </Suspense>
  );
}