"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Building2,
  Clock,
  Users,
  Calendar,
  Globe,
  Loader2,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationsTranslations, opportunitiesTranslations } from "@/lib/language";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useTalentProfile } from "@/hooks/useTalentProfile";

interface Opportunity {
  id: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  description: string;
  location: string;
  industry: string;
  workstyle: string;
  skills: string[];
  similarity?: number;
  created_at?: string;
  user_id?: string;
}

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (opportunityId: string) => Promise<void>;
  isApplying?: boolean;
  hasApplied?: boolean;
}

export default function OpportunityDetailModal({
  opportunity,
  isOpen,
  onClose,
  onApply,
  isApplying = false,
  hasApplied = false,
}: OpportunityDetailModalProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = applicationsTranslations[language];
  const opportunityT = opportunitiesTranslations[language];
  const router = useRouter();
  const [isApplyingLocal, setIsApplyingLocal] = useState(false);
  const { hasResume, isLoading: profileLoading } = useTalentProfile();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!opportunity) return null;

  const handleApply = async () => {
    if (!user?.id) {
      router.push("/auth/talent/signup");
      return;
    }

    // Check if user has resume
    if (!hasResume) {
      toast.error(opportunityT.noResumeCannotApply);
      onClose();
      router.push("/talent/profile");
      return;
    }

    if (onApply) {
      await onApply(opportunity.id);
    } else {
      // Default apply logic if no custom handler provided
      try {
        setIsApplyingLocal(true);
        const { error } = await supabase
          .from("interests")
          .insert([{ user_id: user.id, opp_id: opportunity.id }]);

        if (error) {
          toast.error(error.message || t.failedToApply);
          return;
        }

        toast.success(t.appliedSuccessfully);
      } catch (e) {
        toast.error(t.somethingWentWrong);
      } finally {
        setIsApplyingLocal(false);
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-3xl mx-auto sm:max-h-[90vh]"
          >
            <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-gray-200 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[90vh]">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50/80 backdrop-blur-sm border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                <X size={18} className="text-gray-600" />
              </button>

              {/* Header */}
              <div className="relative px-6 sm:px-8 pt-6 sm:pt-8 pb-6 border-b border-gray-100 flex-shrink-0">
                <div className="pr-12">
                  {/* Company and Title */}
                  <div className="flex items-start gap-4 mb-5">
                    <CompanyLogo 
                      logoUrl={opportunity.company_logo_url}
                      companyName={opportunity.company_name}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
                        {opportunity.title}
                      </h1>
                      <p className="text-base text-gray-600 font-medium mb-4">
                        {opportunity.company_name}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200">
                      <MapPin size={14} />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200">
                      <Clock size={14} />
                      <span>{opportunity.workstyle}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200">
                      <Globe size={14} />
                      <span>{opportunity.industry}</span>
                    </div>
                    {opportunity.similarity && (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${opportunity.similarity >= 95
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                        {Math.round(opportunity.similarity)}% {t.modalMatch}
                      </div>
                    )}
                    {opportunity.created_at && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-500 text-sm">
                        <Calendar size={14} />
                        <span>{t.modalPosted} {new Date(opportunity.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="px-6 sm:px-8 py-6 space-y-8">
                  {/* Job Description */}
                  <section>
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      {t.jobDescription}
                    </h2>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {opportunity.description}
                      </p>
                    </div>
                  </section>

                  {/* Required Skills */}
                  {opportunity.skills && opportunity.skills.length > 0 && (
                    <section>
                      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        {t.requiredSkills}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Company Information */}
                  <section>
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      {t.aboutCompany}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Building2 size={16} className="text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t.company}</p>
                          <p className="text-sm text-gray-900 font-medium truncate">{opportunity.company_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Globe size={16} className="text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t.industry}</p>
                          <p className="text-sm text-gray-900 font-medium truncate">{opportunity.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <MapPin size={16} className="text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t.location}</p>
                          <p className="text-sm text-gray-900 font-medium truncate">{opportunity.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Clock size={16} className="text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t.workType}</p>
                          <p className="text-sm text-gray-900 font-medium truncate">{opportunity.workstyle}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Application Tips & Services */}
                  <section>
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      {t.boostApplicationSuccess}
                    </h2>

                    {/* Free Tips */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-5">
                      <h3 className="font-semibold text-gray-900 text-sm mb-3">{t.freeTips}</h3>
                      <ul className="space-y-2.5 text-[15px] text-gray-600">
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{t.freeTip1}</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{t.freeTip2}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Professional Services */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-sm">{t.getProfessionalHelp}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Resume Building Service */}
                        <div className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-gray-300 transition-colors">
                              <FileText size={16} className="text-gray-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-gray-900 mb-0.5">{t.resumeBuilder}</h4>
                              <p className="text-xs text-gray-500 font-medium">SAR 200</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {t.resumeBuilderDescription}
                          </p>
                          <button
                            className="w-full text-xs h-8 px-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/services?service=resume");
                            }}
                          >
                            {t.getStarted}
                          </button>
                        </div>

                        {/* LinkedIn Profile Service */}
                        <div className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-gray-300 transition-colors">
                              <Globe size={16} className="text-gray-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-gray-900 mb-0.5">{t.linkedInPro}</h4>
                              <p className="text-xs text-gray-500 font-medium">SAR 200</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {t.linkedInProDescription}
                          </p>
                          <button
                            className="w-full text-xs h-8 px-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/services?service=linkedin");
                            }}
                          >
                            {t.getStarted}
                          </button>
                        </div>

                        {/* Mock Interview Service */}
                        <div className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-gray-300 transition-colors">
                              <Users size={16} className="text-gray-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-gray-900 mb-0.5">{t.mockInterview}</h4>
                              <p className="text-xs text-gray-500 font-medium">SAR 300</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {t.mockInterviewDescription}
                          </p>
                          <button
                            className="w-full text-xs h-8 px-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/services?service=interview");
                            }}
                          >
                            {t.bookSession}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Sticky Footer with Apply Button */}
              <div className="flex-shrink-0 px-6 sm:px-8 py-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
                {!hasApplied ? (
                  <div className="relative group">
                    <button
                      onClick={handleApply}
                      disabled={isApplying || isApplyingLocal || !hasResume}
                      className={`w-full h-11 px-6 rounded-lg font-semibold text-sm transition-all ${
                        !hasResume 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                          : 'bg-gray-900 text-white hover:bg-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                      }`}
                    >
                      {(isApplying || isApplyingLocal) ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          {t.applying}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {t.applyNow}
                          <span className="text-base">→</span>
                        </span>
                      )}
                    </button>
                    {!hasResume && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        {opportunityT.uploadResumeToApply}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full h-11 px-6 rounded-lg font-semibold text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-base">✓</span>
                      {t.applied}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}