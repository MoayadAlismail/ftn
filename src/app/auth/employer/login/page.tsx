"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleOAuthLogin, getCurrentUser, getRedirectUrl, sendAuthOTP, verifyAuthOTP } from "@/lib/auth-utils";
import { Role } from "@/constants/enums";
import { toast } from "sonner";
import { GoogleIcon, LinkedInIcon } from "@/components/ui/social-icons";
import { OtpVerification } from "@/components/auth/otp-verification";
import { Loader2 } from "lucide-react";

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function EmployerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const handleSocialLogin = async (provider: 'google' | 'linkedin_oidc') => {
    setIsLoading(true);

    const { success, error } = await handleOAuthLogin(
      provider,
      Role.EMPLOYER,
      `${window.location.origin}/auth/callback?role=employer`
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
      const { success, error, user } = await verifyAuthOTP(email, otp, Role.EMPLOYER);

      if (error) {
        toast.error("Verification failed: " + error);
        return;
      }

      if (success && user) {
        const redirectUrl = getRedirectUrl(user);
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
      {/* Background gradient overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20" /> */}

      <div className="grid lg:grid-cols-2 min-h-screen relative z-10">
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
                  {isLoading ? "Sending code..." : "Send verification code"}
                </Button>

                {/* Footer Links */}
                <div className="text-center mt-6 space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/employer/signup" className="text-gray-900 underline font-medium">
                      Create your account
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column - Gradient Background */}
        <div className="hidden lg:block relative">
          <div className="absolute inset-4 top-12 bottom-12 right-8 left-8 bg-gradient-to-br from-blue-200 via-purple-500 to-pink-500 rounded-[16px]" />

          {/* Floating notification */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">FTN helps you find the right opportunity fast.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
