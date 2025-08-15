"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  X, 
  MapPin, 
  Building2, 
  Clock, 
  Users, 
  Calendar,
  Briefcase,
  Globe,
  DollarSign,
  Globe,
  Mail,
  Phone,
  Loader2,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Opportunity {
  id: string;
  title: string;
  company_name: string;
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
  const [isApplyingLocal, setIsApplyingLocal] = useState(false);

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
      toast.error("You must be signed in to apply.");
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
          toast.error(error.message || "Failed to apply.");
          return;
        }
        
        toast.success("Applied successfully");
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsApplyingLocal(false);
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring" as const, duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl max-h-[90vh] mx-auto"
          >
            <Card className="bg-white rounded-xl sm:rounded-2xl shadow-2xl h-full overflow-hidden">
              {/* Header */}
              <div className="relative p-4 sm:p-6 bg-gradient-to-br from-primary/8 via-primary/6 to-primary/10 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 hover:bg-white hover:scale-110 hover:shadow-md transition-all duration-200 z-10"
                  onClick={onClose}
                >
                  <X size={16} className="text-gray-600 hover:text-gray-800" />
                </Button>

                <div className="pr-10 sm:pr-12">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Briefcase size={20} className="text-primary sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {opportunity.title}
                      </h1>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={16} className="text-gray-500 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-semibold text-gray-700 truncate">
                          {opportunity.company_name}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="flex-shrink-0" />
                          <span className="truncate">{opportunity.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="flex-shrink-0" />
                          <span>{opportunity.workstyle}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe size={14} className="flex-shrink-0" />
                          <span className="truncate">{opportunity.industry}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Score & Status */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {opportunity.similarity && (
                      <span className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full ${
                        opportunity.similarity >= 95
                          ? "bg-green-100 text-green-700"
                          : "bg-primary/15 text-primary"
                      }`}>
                        {opportunity.similarity}% Match
                      </span>
                    )}
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                      {opportunity.workstyle}
                    </span>
                    {opportunity.created_at && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <Calendar size={12} className="sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">Posted {new Date(opportunity.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-scroll max-h-[60vh]">
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Job Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Job Description
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {opportunity.description}
                      </p>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {opportunity.skills && opportunity.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      About {opportunity.company_name}
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Building2 size={20} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Company</p>
                            <p className="text-sm text-gray-600">{opportunity.company_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe size={20} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Industry</p>
                            <p className="text-sm text-gray-600">{opportunity.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={20} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Location</p>
                            <p className="text-sm text-gray-600">{opportunity.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={20} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Work Type</p>
                            <p className="text-sm text-gray-600">{opportunity.workstyle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Application Tips & Services */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Boost Your Application Success
                    </h3>
                    
                    {/* Free Tips */}
                    <div className="bg-primary/5 rounded-xl p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Free Tips</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>Tailor your application to highlight relevant skills mentioned in the job description</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>Research the company culture and values before applying</span>
                        </li>
                      </ul>
                    </div>

                    {/* Professional Services */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Get Professional Help</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Resume Building Service */}
                        <div className="bg-white border border-primary/20 rounded-lg p-3 sm:p-4 hover:border-primary/40 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText size={16} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-sm text-gray-900 truncate">Resume Builder</h5>
                              <p className="text-xs text-primary font-medium">SAR 79</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            Professional resume review and optimization by industry experts
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full text-xs h-8 border-primary/30 text-primary hover:bg-primary/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Navigate to resume service
                              toast.success("Resume service coming soon!");
                            }}
                          >
                            Get Started
                          </Button>
                        </div>

                        {/* LinkedIn Profile Service */}
                        <div className="bg-white border border-primary/20 rounded-lg p-3 sm:p-4 hover:border-primary/40 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Globe size={16} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-sm text-gray-900 truncate">LinkedIn Pro</h5>
                              <p className="text-xs text-primary font-medium">SAR 39</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            Optimize your LinkedIn profile to attract recruiters and opportunities
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full text-xs h-8 border-primary/30 text-primary hover:bg-primary/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Navigate to LinkedIn service
                              toast.success("LinkedIn service coming soon!");
                            }}
                          >
                            Get Started
                          </Button>
                        </div>

                        {/* Mock Interview Service */}
                        <div className="bg-white border border-primary/20 rounded-lg p-3 sm:p-4 hover:border-primary/40 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users size={16} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-sm text-gray-900 truncate">Mock Interview</h5>
                              <p className="text-xs text-primary font-medium">SAR 99</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            Practice with industry professionals and get personalized feedback
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full text-xs h-8 border-primary/30 text-primary hover:bg-primary/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Navigate to interview service
                              toast.success("Interview service coming soon!");
                            }}
                          >
                            Book Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-5 border-t bg-white shadow-lg">
                <div className="flex items-center justify-center">
                  {!hasApplied ? (
                    <Button
                      onClick={handleApply}
                      disabled={isApplying || isApplyingLocal}
                      className="px-8 py-3 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      {(isApplying || isApplyingLocal) ? (
                        <>
                          <Loader2 size={20} className="animate-spin mr-2" />
                          Applying...
                        </>
                      ) : (
                        <>
                          Apply Now
                          <span className="ml-2 text-lg">→</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      disabled 
                      className="px-8 py-3 font-bold bg-green-600 hover:bg-green-600 text-white shadow-lg"
                      size="lg"
                    >
                      <span className="mr-2 text-lg">✓</span>
                      Applied
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}