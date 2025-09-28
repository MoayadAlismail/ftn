"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingAnimation from "@/components/loadingAnimation";

// This page now redirects to the unified opportunities page
// The AI matching functionality has been integrated into the main opportunities feed
export default function MatchMakingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified opportunities page
    router.replace("/talent/opportunities");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <LoadingAnimation size="md" text="Redirecting to your personalized opportunity feed..." />
        <p className="mt-4 text-sm text-gray-600">
          AI matching is now integrated into your main opportunities feed for a better experience.
        </p>
      </div>
    </div>
  );
}