"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Info, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

export default function EmployerSignup() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    companyName: "",
    companyWebsite: "",
    companySize: "",
    companyIndustry: "",
    companyDescription: "",
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) return;

      const { data: existing, error } = await supabase
        .from("employers")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("Employer check:", existing, error);

      if (existing) {
        router.replace("/employer/dashboard/home"); // Already onboarded
      }
    };

    checkOnboarding();
  }, [router]);

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
        // Optionally, redirect to employer dashboard or home
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
    <div className="min-h-screen bg-gray-50 py-7 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Building2 size={35} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome to Ftn
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Let&apos;s set up your company profile to start finding talent.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Your Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4 font-bold">
              <User />
              <h3 className="text-lg font-medium text-gray-900">
                Your Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  id="role"
                  name="role"
                  placeholder="Your Role (e.g. Talent Acquisition)"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Info />
              <h3 className="text-lg font-medium text-gray-900">
                Company Details
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  id="companyWebsite"
                  name="companyWebsite"
                  type="url"
                  placeholder="Company Website"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Select
                  value={formData.companySize}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Company Size" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  id="companyIndustry"
                  name="companyIndustry"
                  placeholder="Company Industry (e.g., SaaS)"
                  value={formData.companyIndustry}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Textarea
                id="companyDescription"
                name="companyDescription"
                placeholder="Brief company description"
                className="h-28"
                // rows={5}
                value={formData.companyDescription}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Complete Profile &rarr;
          </Button>
        </form>
      </div>
    </div>
  );
}
