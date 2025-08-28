"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocationPreference(locationPreference);
    next();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl p-8 space-y-6">
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step 1 of 4</span>
            <span>{Math.round((1 / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: "25%" }}
            />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <MapPin className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Where would you like to work?
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your preferred location
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="w-full max-w-5xl mx-auto">
              <Input
                type="text"
                placeholder="e.g., San Francisco, CA or Remote"
                value={locationPreference}
                onChange={(e) => setLocationPreference(e.target.value)}
                className="w-xl py-6 text-lg px-6"
                required
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            {prev && (
              <Button
                type="button"
                variant="outline"
                onClick={prev}
                className="w-32 cursor-pointer"
              >
                Back
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
                Skip for now
              </Button>
              <Button className="cursor-pointer w-32" type="submit">
                Next &rarr;
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
