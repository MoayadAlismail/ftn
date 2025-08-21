"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Globe, Users, Briefcase, Loader2, User, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Loading skeleton for onboarding page
function OnboardingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 animate-pulse">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Form skeleton */}
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Button skeleton */}
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    </div>
  );
}

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

function EmployerOnboardingContent() {
  const { user, authUser, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    companyName: "",
    companyWebsite: "",
    companySize: "",
    companyIndustry: "",
    companyDescription: "",
  });

  // Auth is handled by middleware
  
  // Show loading while data is resolving
  if (isLoading) {
    return <OnboardingSkeleton />;
  }

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user?.id) return;

      try {
        const { data: existing, error } = await supabase
          .from("employers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("Employer check:", existing, error);

        if (existing) {
          router.replace("/employer/dashboard/home"); // Already onboarded
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [user, router]);

  // Show loading while checking onboarding status
  if (isCheckingOnboarding) {
    return <OnboardingSkeleton />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true);
    e.preventDefault();
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (userError || !userId) {
        alert("User not authenticated. Please log in.");
        return;
      }

      // Prepare employer data
      const employerData = {
        user_id: userId,
        name: formData.name,
        company_role: formData.role,
        company_name: formData.companyName,
        company_website: formData.companyWebsite,
        company_size: formData.companySize,
        company_industry: formData.companyIndustry,
        description: formData.companyDescription,
      };

      // Insert into "employers" table
      const { error } = await supabase.from("employers").insert([employerData]);

      if (error) {
        alert("Error creating employer profile: " + error.message);
      } else {
        // Update user metadata to mark as onboarded
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { is_onboarded: true }
        });

        if (metadataError) {
          console.error("Error updating user metadata:", metadataError);
          // Don't fail the entire process for metadata update failure
        }

        // Redirect to employer dashboard
        router.push("/employer/dashboard/home");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }

    // TODO: Implement form submission logic
    console.log("✅ Successfully submitted");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(formData);
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      companySize: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl mb-6"
            >
              <Building2 size={40} className="text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Welcome to Ftn
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Let&apos;s set up your company profile to start finding exceptional talent.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <User size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-gray-600">Tell us about yourself</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium text-gray-700">
                      Your Role
                    </label>
                    <Input
                      id="role"
                      name="role"
                      placeholder="e.g., Talent Acquisition Manager"
                      value={formData.role}
                      onChange={handleChange}
                      className="h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
                      required
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Company Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Briefcase size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Company Details</h2>
                    <p className="text-gray-600">Share information about your organization</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="companyWebsite" className="text-sm font-medium text-gray-700">
                        Company Website
                      </label>
                      <div className="relative">
                        <Globe size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          id="companyWebsite"
                          name="companyWebsite"
                          type="url"
                          placeholder="https://company.com"
                          value={formData.companyWebsite}
                          onChange={handleChange}
                          className="h-12 pl-11 bg-white border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="companySize" className="text-sm font-medium text-gray-700">
                        Company Size
                      </label>
                      <div className="relative">
                        <Users size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                        <Select
                          value={formData.companySize}
                          onValueChange={handleSelectChange}
                        >
                          <SelectTrigger className="h-12 pl-11 bg-white border-gray-200 focus:border-primary focus:ring-primary rounded-xl">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="companyIndustry" className="text-sm font-medium text-gray-700">
                        Industry
                      </label>
                      <Input
                        id="companyIndustry"
                        name="companyIndustry"
                        placeholder="e.g., Technology, Healthcare"
                        value={formData.companyIndustry}
                        onChange={handleChange}
                        className="h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="companyDescription" className="text-sm font-medium text-gray-700">
                      Company Description
                    </label>
                    <Textarea
                      id="companyDescription"
                      name="companyDescription"
                      placeholder="Briefly describe your company, culture, and what makes it unique..."
                      className="min-h-[120px] bg-white border-gray-200 focus:border-primary focus:ring-primary rounded-xl resize-none"
                      value={formData.companyDescription}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex justify-center pt-4"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Setting up your profile...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function EmployerOnboarding() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <EmployerOnboardingContent />
    </Suspense>
  );
}
