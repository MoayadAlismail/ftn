"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Marquee } from "@/components/magicui/marquee";
import { handleOAuthLogin, getCurrentUser, getRedirectUrl } from "@/lib/auth-utils";
import { Role } from "@/constants/enums";
import { toast } from "sonner";

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
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

export default function TalentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        toast.error("Login failed: " + error.message);
        return;
      }

      if (data.user) {
        // Check existing role
        const existingRole = data.user.user_metadata?.role as Role;

        if (existingRole && existingRole !== Role.TALENT) {
          toast.error(
            `This account is registered as a ${existingRole}. Please use the employer login page.`,
            { duration: 5000 }
          );
          router.push("/auth/employer/login");
          return;
        }

        // Set or confirm role
        await supabase.auth.updateUser({
          data: { role: Role.TALENT },
        });

        // Get user data and redirect appropriately
        const { user: authUser } = await getCurrentUser();
        if (authUser) {
          const redirectUrl = getRedirectUrl(authUser);
          toast.success("Welcome back!");
          router.push(redirectUrl);
        } else {
          router.push("/talent/onboarding");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br relative overflow-hidden">
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
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 48 48"
                    fill="none"
                    className="mr-3"
                  >
                    <g clipPath="url(#clip0_17_40)">
                      <path
                        d="M47.5 24.5C47.5 22.8333 47.3667 21.1667 47.1667 19.5H24V28.5H37.3333C36.8333 31.1667 35.1667 33.3333 32.8333 34.8333V40.1667H40.1667C44.1667 36.5 47.5 30.8333 47.5 24.5Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M24 48C30.5 48 35.8333 45.8333 40.1667 40.1667L32.8333 34.8333C30.8333 36.1667 28.5 37 24 37C18.8333 37 14.3333 33.5 12.8333 28.8333H5.33331V34.3333C9.66665 42.1667 16.5 48 24 48Z"
                        fill="#34A853"
                      />
                      <path
                        d="M12.8333 28.8333C12.1667 27.1667 11.8333 25.3333 11.8333 23.5C11.8333 21.6667 12.1667 19.8333 12.8333 18.1667V12.6667H5.33331C3.16665 16.8333 2 21.1667 2 23.5C2 25.8333 3.16665 30.1667 5.33331 34.3333L12.8333 28.8333Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M24 10C28.5 10 31.5 11.8333 33.1667 13.3333L40.3333 6.16667C35.8333 2.16667 30.5 0 24 0C16.5 0 9.66665 5.83333 5.33331 12.6667L12.8333 18.1667C14.3333 13.5 18.8333 10 24 10Z"
                        fill="#EA4335"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_17_40">
                        <rect width="48" height="48" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  Continue with Google
                </Button>

                {/* GitHub Login */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-3"
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </Button>

                {/* LinkedIn Login */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  onClick={() => handleSocialLogin('linkedin_oidc')}
                  disabled={isLoading}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-3"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
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

                {/* Email/Password Form */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <button className="text-sm text-gray-500 hover:text-gray-700 underline">
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    <Link href="/" className="text-gray-900 underline font-medium">
                      Create your account
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column - Gradient Background */}
        {/* Right Column - Gradient Background */}
        <div className="hidden lg:block relative">
          <div className="absolute inset-4 top-12 bottom-12 right-8 left-8 bg-gradient-to-br from-pink-200 via-purple-500 to-blue-500 rounded-[16px]" />

          {/* Marquee overlay on top of the gradient */}
          <div className="absolute inset-4 top-12 bottom-12 right-8 left-8">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <div
                className="flex flex-row items-center gap-4 [perspective:300px]"
                style={{
                  transform:
                    "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
                }}
              >
                <Marquee pauseOnHover vertical className="[--duration:20s]">
                  {firstRow.map((review) => (
                    <ReviewCard key={review.username} {...review} />
                  ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
                  {secondRow.map((review) => (
                    <ReviewCard key={review.username} {...review} />
                  ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
                  {thirdRow.map((review) => (
                    <ReviewCard key={review.username} {...review} />
                  ))}
                </Marquee>
                <Marquee pauseOnHover className="[--duration:20s]" vertical>
                  {fourthRow.map((review) => (
                    <ReviewCard key={review.username} {...review} />
                  ))}
                </Marquee>
              </div>

              {/* Edge fade masks */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background/40" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background/40" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background/40" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background/40" />
            </div>
          </div>

          {/* Floating notification */}

        </div>
      </div>
    </main>
  );
}

