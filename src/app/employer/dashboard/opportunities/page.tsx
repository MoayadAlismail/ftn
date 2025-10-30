"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/loadingAnimation";
import { OpportunityCard, type Opportunity } from "../my-opportunities/opportunity-card";
import { toast } from "sonner";
import { INDUSTRIES, SAUDI_CITIES, COMMON_SKILLS } from "@/constants/job-data";
import { useLanguage } from "@/contexts/LanguageContext";
import { employerTranslations } from "@/lib/language";

const workStyles = [
  "Full Time",
  "Internship/Co-op",
  "Tamheer",
] as const;

type WorkStyle = (typeof workStyles)[number];

interface OpportunityFormData {
  title: string;
  company_name: string;
  workstyle: WorkStyle[];
  location: string;
  industry: string[];
  description: string;
  skills: string[];
}

const initialFormData: OpportunityFormData = {
  title: "",
  company_name: "",
  workstyle: [],
  location: "",
  industry: [],
  description: "",
  skills: [],
};

function OpportunitiesPageContent() {
  const { user, authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = employerTranslations[language];
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

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

      // Get the employer record ID first
      const { data: employerData, error: employerError } = await supabase
        .from("employers")
        .select("id")
        .eq("user_id", user.id)
        .single();
        
      if (employerError || !employerData) {
        console.error("Employer profile not found:", employerError);
        if (!showRefreshToast) toast.error(t.employerProfileNotFound);
        return;
      }

      const { data, error } = await supabase
        .from("opportunities")
        .select(`
          *,
          application_count:interests(count)
        `)
        .eq("user_id", employerData.id);

      if (error) {
        console.error("Error fetching opportunities:", error);
        if (!showRefreshToast) toast.error(t.failedToLoadOpportunities);
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
      if (!showRefreshToast) toast.error(t.errorLoadingOpportunities);
    }
  }, [user?.id, t]);

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

  // Handle modal open from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "post") {
      setIsPostModalOpen(true);
    }
  }, [searchParams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOpportunities(true);
    setRefreshing(false);
    toast.success(t.opportunitiesRefreshed);
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

  const handleWorkStyleChange = (values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      workstyle: values as WorkStyle[],
    }));
  };

  const handleIndustryChange = (values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      industry: values,
    }));
  };

  const handleSkillsChange = (values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      skills: values,
    }));
  };

  const handleLocationChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (
        !formData.title ||
        !formData.company_name ||
        formData.workstyle.length === 0 ||
        !formData.location
      ) {
        throw new Error(t.fillRequiredFields);
      }

      const user_data = await supabase.auth.getUser();
      const auth_user_id = user_data.data.user?.id;
      
      // Get the employer record ID (not the auth user ID)
      const { data: employerData, error: employerError } = await supabase
        .from("employers")
        .select("id, company_name, company_logo_url")
        .eq("user_id", auth_user_id)
        .single();
        
      if (employerError || !employerData) {
        throw new Error(t.completeOnboardingFirst);
      }

      const dataToInsert = {
        ...formData,
        user_id: employerData.id, // Use employer ID, not auth user ID
        company_logo_url: employerData.company_logo_url, // Include company logo
        workstyle: formData.workstyle.join(", "), // Join array for storage
        industry: formData.industry.join(", "), // Join array for storage
        skills: formData.skills, // Already an array
      };

      const { data, error } = await supabase
        .from("opportunities")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      toast.success(t.opportunityPosted);

      // Reset form
      setFormData(initialFormData);

      // Refresh opportunities list
      await loadOpportunities();

      // Close modal
      setIsPostModalOpen(false);
      
    } catch (error: any) {
      console.error("Error posting opportunity:", error);
      toast.error(error.message || t.failedToPostOpportunity);
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
    if (confirm(t.confirmDelete)) {
      try {
        const { error } = await supabase
          .from("opportunities")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }

        setOpportunities(prev => prev.filter(opp => opp.id !== id));
        toast.success(t.opportunityDeleted);
      } catch (error) {
        console.error("Error deleting opportunity:", error);
        toast.error(t.failedToDeleteOpportunity);
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
      toast.error(t.failedToLoadApplicants);
    } finally {
      setApplicantsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingAnimation size="md" text={t.loadingOpportunities} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.opportunitiesTitle}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {t.opportunitiesSubtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{t.refresh}</span>
          </Button>
          <Button
            onClick={() => setIsPostModalOpen(true)}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.postNewOpportunity}</span>
            <span className="sm:hidden">{t.postNew}</span>
          </Button>
        </div>
      </div>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="text-gray-400 mb-4">
            <Briefcase size={36} className="sm:w-12 sm:h-12 mx-auto" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {t.noOpportunitiesPosted}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {t.noOpportunitiesDescription}
          </p>
          <Button onClick={() => setIsPostModalOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t.postYourFirst}</span>
            <span className="sm:hidden">{t.postFirstJob}</span>
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

      {/* Post Opportunity Modal */}
      <Dialog open={isPostModalOpen} onOpenChange={(open) => {
        setIsPostModalOpen(open);
        if (!open) {
          setFormData(initialFormData);
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b shrink-0">
            <DialogTitle className="text-xl sm:text-2xl">
              {t.createNewJobPosting}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-5 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              {/* Left Column */}
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    {t.jobTitle} *
                  </label>
                  <Input
                    name="title"
                    placeholder={t.jobTitlePlaceholder}
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    {t.companyNameLabel} *
                  </label>
                  <Input
                    name="company_name"
                    placeholder={t.companyNameOpportunityPlaceholder}
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="w-full h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    {t.workStyleRequired} *
                  </label>
                  <MultiSelect
                    options={workStyles.map(style => ({ label: style, value: style }))}
                    selected={formData.workstyle}
                    onChange={handleWorkStyleChange}
                    placeholder={t.selectWorkStyles}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    {t.locationRequired} *
                  </label>
                  <Select
                    value={formData.location}
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder={t.locationPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {SAUDI_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    {t.industryLabel}
                  </label>
                  <MultiSelect
                    options={INDUSTRIES.map(industry => ({ label: industry, value: industry }))}
                    selected={formData.industry}
                    onChange={handleIndustryChange}
                    placeholder={t.industryOpportunityPlaceholder}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    {t.requiredSkills}
                  </label>
                  <MultiSelect
                    options={COMMON_SKILLS.map(skill => ({ label: skill, value: skill }))}
                    selected={formData.skills}
                    onChange={handleSkillsChange}
                    placeholder={t.skillsPlaceholder}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    {t.jobDescription}
                  </label>
                  <Textarea
                    name="description"
                    placeholder={t.jobDescriptionPlaceholder}
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={8}
                    className="w-full resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 px-5 sm:px-6 md:px-8 py-4 sm:py-5 border-t bg-gray-50/50 shrink-0">
            <Button
              variant="outline"
              onClick={() => setFormData(initialFormData)}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-6"
            >
              {t.resetForm}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-8 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t.posting}
                </>
              ) : (
                <>
                  <CirclePlus className="h-4 w-4 mr-2" />
                  {t.postOpportunity}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Applicants Modal - Mobile Optimized */}
      {isApplicantsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {t.applicantsFor}{selectedOpp ? ` ${selectedOpp.title}` : ""}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {t.foundApplicants} {applicants.length} {applicants.length === 1 ? t.applicant : t.applicants}
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
                  <LoadingAnimation size="md" text={t.loadingApplicants} />
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center text-gray-600 py-12">
                  {t.noApplicantsYet}
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
                            <a href={`mailto:${talent.email}`}>{t.contact}</a>
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
                {t.close}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunitiesPageWrapper() {
  const { language } = useLanguage();
  const t = employerTranslations[language];
  
  return (
    <div className="flex justify-center py-12">
      <LoadingAnimation size="md" text={t.loading} />
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<OpportunitiesPageWrapper />}>
      <OpportunitiesPageContent />
    </Suspense>
  );
}