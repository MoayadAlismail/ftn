"use client";
import { Suspense } from "react";
import HeroSection from "@/components/hero-section";
import Features from "@/features/landing/Features";
import FAQ from "@/features/landing/FAQ";
import Testimonials from "@/features/landing/Testimonials";
import ContactUs from "@/features/landing/ContactUs";

function LandingContent() {
  const handleGetStarted = (skipResumeUpload?: boolean) => {
    // Store resume upload timestamp for expiry checking
    localStorage.setItem("resumeUploadTimestamp", Date.now().toString());

    // Navigate to talent signup
    window.location.href = "/auth/talent/signup";
  };

  return (
    <main className="min-h-screen flex flex-col items-stretch">
      <HeroSection onGetStarted={handleGetStarted} />
      <Features />
      <Testimonials />
      <FAQ />
      <ContactUs />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
