"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/hero-section";
import Features from "@/features/landing/Features";
import FAQ from "@/features/landing/FAQ";
import Testimonials from "@/features/landing/Testimonials";
import ContactUs from "@/features/landing/ContactUs";
import LoadingAnimation from "@/components/loadingAnimation";

function LandingContent() {
  const router = useRouter();
  
  const handleGetStarted = (skipResumeUpload?: boolean) => {
    // Navigate to talent signup using Next.js router
    router.push("/auth/talent/signup");
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
    <Suspense fallback={<LoadingAnimation size="md" />}>
      <LandingContent />
    </Suspense>
  );
}
