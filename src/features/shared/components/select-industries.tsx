"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BriefcaseIcon } from "lucide-react";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Marketing",
  "Design",
  "Consulting",
  "Education",
  "Non-profit",
  "Media",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Energy",
  "Transportation",
] as const;

type Industry = (typeof INDUSTRIES)[number];

interface SelectIndustriesProps {
  industryPreference: string[];
  setIndustryPreference: (industries: string[]) => void;
  next: () => void;
  prev: () => void;
}

export default function SelectIndustries({
  industryPreference,
  setIndustryPreference,
  next,
  prev,
}: SelectIndustriesProps) {
  const MAX_SELECTIONS = 3;

  const toggleIndustry = (industry: Industry) => {
    if (industryPreference.includes(industry)) {
      setIndustryPreference(industryPreference.filter((i) => i !== industry));
    } else if (industryPreference.length < MAX_SELECTIONS) {
      setIndustryPreference([...industryPreference, industry]);
    }
  };

  return (
    <Card className="w-full max-w-4xl p-8 mt-10">
      {/* Progress Indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Step 2 of 4</span>
          <span>{Math.round((2 / 4) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: "50%" }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 flex items-center justify-center mb-3">
          <BriefcaseIcon className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-1">
          What are your top 3 target industries?
        </h2>
        <p className="text-gray-600">
          Selected: {industryPreference.length}/{MAX_SELECTIONS}
        </p>
      </div>

      {/* Industry Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {INDUSTRIES.map((industry) => {
          const isSelected = industryPreference.includes(industry);
          return (
            <button
              key={industry}
              onClick={() => toggleIndustry(industry)}
              className={cn(
                "py-3 px-4 rounded-lg border text-center transition-[border-color,background-color] duration-75 text-sm",
                "hover:border-primary/40 hover:bg-primary/5",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-700",
                industryPreference.length >= MAX_SELECTIONS && !isSelected
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              )}
            >
              {industry}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button className="cursor-pointer" variant="outline" onClick={prev}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            className="cursor-pointer"
            type="button"
            variant="ghost"
            onClick={next}
          >
            Skip for now
          </Button>
          <Button
            className="cursor-pointer"
            onClick={next}
            disabled={industryPreference.length !== MAX_SELECTIONS}
          >
            Next &rarr;
          </Button>
        </div>
      </div>
    </Card>
  );
}
