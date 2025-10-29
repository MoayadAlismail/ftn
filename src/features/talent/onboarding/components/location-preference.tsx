"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/lib/language/onboarding";

interface LocationPreferenceProps {
  locationPreference: string;
  setLocationPreference: (location: string) => void;
  next: () => void;
  prev?: () => void;
}

export default function LocationPreference({
  locationPreference,
  setLocationPreference,
  next,
  prev,
}: LocationPreferenceProps) {
  const { language } = useLanguage();
  const t = onboardingTranslations[language];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocationPreference(locationPreference);
    next();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>{t.stepOf} 2 {t.of} 5</span>
            <span>{Math.round((2 / 5) * 100)}% {t.complete}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: "40%" }}
            />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">
            {t.locationTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t.locationDescription}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="w-full">
              <Input
                type="text"
                placeholder={t.locationPlaceholder}
                value={locationPreference}
                onChange={(e) => setLocationPreference(e.target.value)}
                className="w-full py-3 sm:py-4 lg:py-6 text-sm sm:text-base lg:text-lg px-3 sm:px-4 lg:px-6"
                required
              />
            </div>
          </div>

          {/* Mobile Layout - Stack buttons vertically */}
          <div className="block sm:hidden space-y-3 pt-4">
            {prev && (
              <Button
                type="button"
                variant="outline"
                onClick={prev}
                className="w-full cursor-pointer"
              >
                {t.back}
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer flex-1"
                onClick={next}
              >
                {t.skipForNow}
              </Button>
              <Button className="cursor-pointer flex-1" type="submit">
                {t.next}
              </Button>
            </div>
          </div>

          {/* Desktop Layout - Original horizontal layout */}
          <div className="hidden sm:flex justify-between pt-4">
            {prev && (
              <Button
                type="button"
                variant="outline"
                onClick={prev}
                className="w-32 cursor-pointer"
              >
                {t.back}
              </Button>
            )}
            {!prev && <div></div>}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer w-28"
                onClick={next}
              >
                {t.skipForNow}
              </Button>
              <Button className="cursor-pointer w-32" type="submit">
                {t.next}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
