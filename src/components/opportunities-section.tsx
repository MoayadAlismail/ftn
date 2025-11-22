"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import LoadingAnimation from "@/components/loadingAnimation";
import OpportunityDetailModal from "@/components/opportunity-detail-modal";
import { CompanyLogo } from "@/components/ui/company-logo";

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
  created_at: string;
}

const OpportunityCard = ({ 
  opportunity, 
  onViewDetails 
}: { 
  opportunity: Opportunity; 
  onViewDetails: (opportunity: Opportunity) => void;
}) => {
  return (
    <Card 
      className="relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-400 transition-[transform,box-shadow,border-color] duration-75 cursor-pointer group"
      onClick={() => onViewDetails(opportunity)}
    >
      <div className="p-6">
        <div className="space-y-4">
          {/* Header with Company Logo */}
          <div className="flex items-start gap-3">
            <CompanyLogo 
              logoUrl={opportunity.company_logo_url}
              companyName={opportunity.company_name}
              size="md"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary">
                {opportunity.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">{opportunity.company_name}</p>
            </div>
          </div>

          {/* Location and Work Style */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="flex-shrink-0" />
              <span className="truncate">{opportunity.location}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="truncate">{opportunity.workstyle}</span>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
            {opportunity.description}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default function OpportunitiesSection() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("opportunities")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20); // Limit to recent 20 opportunities

        if (error) {
          throw error;
        }

        setOpportunities(data || []);
      } catch (err) {
        console.error("Error fetching opportunities:", err);
        setError("Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const handleViewDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOpportunity(null);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latest Opportunities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover amazing career opportunities from top companies
            </p>
          </div>
          <div className="flex justify-center">
            <LoadingAnimation size="lg" text="Loading opportunities..." />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest Opportunities
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 border-t border-border">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest Opportunities
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing career opportunities from top companies. Upload your resume to get personalized matches.
          </p>
        </div>

        {/* Opportunities Grid */}
        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No opportunities available yet
            </h3>
            <p className="text-gray-600">
              Check back soon for new opportunities from amazing companies.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {opportunities.length >= 20 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Opportunities
            </Button>
          </div>
        )}

        {/* Opportunity Detail Modal */}
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </section>
  );
}
