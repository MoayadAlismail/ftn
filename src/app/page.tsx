"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeroSection from "@/components/hero-section";
import Features from "@/features/landing/Features";
import FAQ from "@/features/landing/FAQ";
import Testimonials from "@/features/landing/Testimonials";
import ContactUs from "@/features/landing/ContactUs";
import LoadingAnimation from "@/components/loadingAnimation";
import CircularNavbar from "@/components/circular-navbar";
import { toast } from "sonner";

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle auth errors from callback
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      let errorMessage = message || 'Authentication failed';

      switch (error) {
        case 'no_code':
          errorMessage = 'No authentication code received';
          break;
        case 'invalid_role':
          errorMessage = 'Invalid role parameter';
          break;
        case 'exchange_failed':
          errorMessage = 'Failed to authenticate. Please try again.';
          break;
        case 'no_session':
          errorMessage = 'Failed to establish session. Please try again.';
          break;
        case 'role_mismatch':
          // Use custom message from URL
          break;
        case 'auth_failed':
          // Use custom message from URL
          break;
      }

      toast.error(errorMessage, { duration: 5000 });
      
      // Clean up URL
      router.replace('/');
    }
  }, [searchParams, router]);
  
  const handleGetStarted = (skipResumeUpload?: boolean) => {
    // Navigate to talent signup using Next.js router
    router.push("/auth/talent/signup");
  };

  return (
    <>
      <CircularNavbar />
      <main className="min-h-screen flex flex-col items-stretch">
        <div id="hero">
          <HeroSection onGetStarted={handleGetStarted} />
        </div>
        <div id="features">
          <Features />
        </div>
        <div id="testimonials">
          <Testimonials />
        </div>
        <div id="faq">
          <FAQ />
        </div>
        <div id="contact">
          <ContactUs />
        </div>
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingAnimation size="md" />}>
      <LandingContent />
    </Suspense>
  );
}
