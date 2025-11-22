"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BriefcaseIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/lib/language/onboarding";

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
  const { language } = useLanguage();
  const t = onboardingTranslations[language];
  const MAX_SELECTIONS = 3;

  const toggleIndustry = (industry: Industry) => {
    if (industryPreference.includes(industry)) {
      setIndustryPreference(industryPreference.filter((i) => i !== industry));
    } else if (industryPreference.length < MAX_SELECTIONS) {
      setIndustryPreference([...industryPreference, industry]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Progress Indicator */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>{t.stepOf} 3 {t.of} 5</span>
            <span>{Math.round((3 / 5) * 100)}% {t.complete}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: "60%" }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="mx-auto w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center mb-3">
            <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-1">
            {t.industriesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {t.industriesDescription} {industryPreference.length}/{MAX_SELECTIONS}
          </p>
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {INDUSTRIES.map((industry) => {
            const isSelected = industryPreference.includes(industry);
            return (
              <button
                key={industry}
                onClick={() => toggleIndustry(industry)}
                className={cn(
                  "py-2 sm:py-3 px-2 sm:px-4 rounded-lg border text-center transition-[border-color,background-color] duration-75 text-xs sm:text-sm",
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

        {/* Mobile Navigation */}
        <div className="block sm:hidden space-y-3 pt-4">
          <Button className="cursor-pointer w-full" variant="outline" onClick={prev}>
            {t.back}
          </Button>
          <div className="flex gap-2">
            <Button
              className="cursor-pointer flex-1"
              type="button"
              variant="ghost"
              onClick={next}
            >
              {t.skipForNow}
            </Button>
            <Button
              className="cursor-pointer flex-1"
              onClick={next}
              disabled={industryPreference.length !== MAX_SELECTIONS}
            >
              {t.next}
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex justify-between pt-4">
          <Button className="cursor-pointer" variant="outline" onClick={prev}>
            {t.back}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              className="cursor-pointer"
              type="button"
              variant="ghost"
              onClick={next}
            >
              {t.skipForNow}
            </Button>
            <Button
              className="cursor-pointer"
              onClick={next}
              disabled={industryPreference.length !== MAX_SELECTIONS}
            >
              {t.next}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
