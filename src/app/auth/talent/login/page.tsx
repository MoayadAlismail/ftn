"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Marquee } from "@/components/magicui/marquee";
import { handleOAuthLogin, getCurrentUser, getRedirectUrl, sendAuthOTP, verifyAuthOTP } from "@/lib/auth-utils";
import { Role } from "@/constants/enums";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GoogleIcon, GitHubIcon, LinkedInIcon } from "@/components/ui/social-icons";
import { OtpVerification } from "@/components/auth/otp-verification";

// Loading component for the login page
function LoginPageSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-br relative overflow-hidden">
      <div className="grid lg:grid-cols-2 min-h-screen relative z-10">
        {/* Left Column - Form Skeleton */}
        <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-white backdrop-blur-sm">
          <div className="mx-auto w-full max-w-sm animate-pulse">
            {/* Logo skeleton */}
            <div className="flex items-center mb-12">
              <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>

            {/* Form skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Reviews Skeleton */}
        <div className="hidden lg:flex flex-col bg-gray-50 relative overflow-hidden">
          <div className="p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const reviews = [
  {
    name: "Sarah",
    username: "@sarah",
    body: "FTN matched me with my dream job in just 2 weeks. The process was seamless!",
    img: "https://avatar.vercel.sh/sarah",
  },
  {
    name: "Mike",
    username: "@mike",
    body: "I found opportunities I never would have discovered on my own. Highly recommend!",
    img: "https://avatar.vercel.sh/mike",
  },
  {
    name: "Emily",
    username: "@emily",
    body: "The talent matching is incredible. It's like having a personal career advisor.",
    img: "https://avatar.vercel.sh/emily",
  },
  {
    name: "David",
    username: "@david",
    body: "Within days of signing up, I had multiple interview requests. Amazing platform!",
    img: "https://avatar.vercel.sh/david",
  },
  {
    name: "Lisa",
    username: "@lisa",
    body: "FTN helped me transition to a new career path. The matching algorithm is spot on.",
    img: "https://avatar.vercel.sh/lisa",
  },
  {
    name: "Alex",
    username: "@alex",
    body: "Best career decision I made was joining FTN. Found my perfect role!",
    img: "https://avatar.vercel.sh/alex",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);
const thirdRow = reviews.slice(0, reviews.length / 2);
const fourthRow = reviews.slice(reviews.length / 2);

function ReviewCard({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) {
  return (
    <figure
      className="relative h-full w-fit sm:w-36 cursor-pointer overflow-hidden rounded-xl border p-4 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium">{name}</figcaption>
          <p className="text-xs font-medium text-white/70">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-xs sm:text-sm text-white/90">{body}</blockquote>
    </figure>
  );
}

function TalentLoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const handleSocialLogin = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
    setIsLoading(true);

    const { success, error } = await handleOAuthLogin(
      provider,
      Role.TALENT,
      `${window.location.origin}/auth/callback?role=talent`
    );

    if (!success) {
      toast.error(error || `${provider} login failed`);
      setIsLoading(false);
    }
    // Success case is handled by OAuth redirect
  };

  const handleEmailLogin = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { success, error, needsVerification } = await sendAuthOTP(email);

      if (error) {
        toast.error("Login failed: " + error);
        return;
      }

      if (success && needsVerification) {
        setShowOtpVerification(true);
        toast.success("Verification code sent to your email");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    try {
      const { success, error, user } = await verifyAuthOTP(email, otp, Role.TALENT);

      if (error) {
        toast.error("Verification failed: " + error);
        return;
      }

      if (success && user) {
        const redirectUrl = getRedirectUrl(user);
        toast.success("Welcome back!");
        router.push(redirectUrl);
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("An unexpected error occurred during verification");
    }
  };

  const handleResendOtp = async () => {
    const { success, error } = await sendAuthOTP(email);
    if (error) {
      toast.error("Failed to resend code: " + error);
      throw new Error(error);
    }
  };

  const handleBackToLogin = () => {
    setShowOtpVerification(false);
  };

  // Show OTP verification if needed
  if (showOtpVerification) {
    return (
      <OtpVerification
        email={email}
        onVerify={handleOtpVerify}
        onResend={handleResendOtp}
        onBack={handleBackToLogin}
        isLoading={isLoading}
        title="Verify Your Identity"
        description="We sent a verification code to your email for security"
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br relative overflow-hidden">
      <div className=" min-h-screen z-10">
        {/* Left Column - Simple Form */}
        <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-white backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mx-auto w-full max-w-sm"
            >
              {/* Logo */}
              <div className="flex items-center mb-12">
                <img
                  src="/logo.svg"
                  alt="FTN Logo"
                  className="w-10 h-10 mr-3"
                  style={{ display: "block" }}
                />
                <span className="text-xl font-semibold text-gray-900">FTN</span>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome Back!
                </h1>
                <p className="text-gray-600">
                  Enter your email to receive a verification code
                </p>
              </div>

              {/* Login Form */}
              <div className="space-y-4">
                {/* Google Login */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-3" />
                  ) : (
                    <GoogleIcon className="mr-3" />
                  )}
                  Continue with Google
                </Button>

                {/* GitHub Login */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                >
                  <GitHubIcon className="mr-3" />
                  Continue with GitHub
                </Button>

                {/* LinkedIn Login */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  onClick={() => handleSocialLogin('linkedin_oidc')}
                  disabled={isLoading}
                >
                  <LinkedInIcon className="mr-3" />
                  Continue with LinkedIn
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Email Form */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sign In Button */}
                <Button
                  className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium mt-6"
                  onClick={handleEmailLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Log in"}
                </Button>

                {/* Footer Links */}
                <div className="text-center mt-6 space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/talent/signup" className="text-gray-900 underline font-medium">
                      Create your account
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column - Gradient Background */}
       
      </div>
    </main>
  );
}

export default function TalentLogin() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <TalentLoginContent />
    </Suspense>
  );
}

