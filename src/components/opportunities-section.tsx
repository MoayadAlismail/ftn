"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Clock, Users, Calendar, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import LoadingAnimation from "@/components/loadingAnimation";
import OpportunityDetailModal from "@/components/opportunity-detail-modal";

interface Opportunity {
  id: string;
  title: string;
  company_name: string;
  description: string;
  location: string;
  industry: string;
  workstyle: string;
  skills: string[];
  created_at: string;
}

const OpportunityCard = ({ 
  opportunity, 
  index, 
  onViewDetails 
}: { 
  opportunity: Opportunity; 
  index: number;
  onViewDetails: (opportunity: Opportunity) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Card 
        className="p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary/30 bg-white/80 backdrop-blur-sm cursor-pointer"
        onClick={() => onViewDetails(opportunity)}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {opportunity.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Building2 size={16} className="text-gray-500" />
                <span className="text-gray-600 font-medium">{opportunity.company_name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                {opportunity.workstyle}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{opportunity.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{opportunity.industry}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className={`text-gray-700 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
              {opportunity.description}
            </p>
            
            {opportunity.description.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
              >
                {isExpanded ? 'Show less' : 'Read more'}
                <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>

          {/* Skills */}
          {opportunity.skills && opportunity.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {opportunity.skills.slice(0, 5).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  {skill}
                </span>
              ))}
              {opportunity.skills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                  +{opportunity.skills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={16} />
              <span>Apply now</span>
            </div>
            <Button 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(opportunity);
              }}
            >
              View Details →
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
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
      <section className="py-20 bg-gray-50/50">
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
      <section className="py-20 bg-gray-50/50">
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
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest Opportunities
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing career opportunities from top companies. Upload your resume to get personalized matches.
          </p>
        </motion.div>

        {/* Opportunities Grid */}
        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                index={index}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No opportunities available yet
            </h3>
            <p className="text-gray-600">
              Check back soon for new opportunities from amazing companies.
            </p>
          </motion.div>
        )}

        {/* Load More Button */}
        {opportunities.length >= 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg">
              Load More Opportunities
            </Button>
          </motion.div>
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