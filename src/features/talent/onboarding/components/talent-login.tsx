import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";

interface TalentLoginProps {
  next: () => void;
}

export default function TalentLogin({ next }: TalentLoginProps) {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    // Check if user is already logged in
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session) {
      // If already logged in, update role if needed and redirect
      const currentRole = sessionData.session.user.user_metadata?.role;
      if (currentRole !== "talent") {
        await supabase.auth.updateUser({
          data: { role: "talent" },
        });
      }
      next();
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `${location.origin}/auth/callback?role=talent`,
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback?role=talent`,
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20" />
      
      <div className="grid lg:grid-cols-2 min-h-screen relative z-10">
        {/* Left Column - Simple Form */}
        <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-sm">
            {/* Logo */}
            <div className="flex items-center mb-12">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm" />
              </div>
              <span className="text-xl font-semibold text-gray-900">FTN</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Almost there!
              </h1>
              <p className="text-gray-600 text-sm">
                Create your account to save progress and get personalized matches
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-4">
              {/* Google Login */}
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                onClick={handleLogin}
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
                onClick={handleGithubLogin}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-3"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">or continue quickly</span>
                </div>
              </div>

              {/* Email Form */}
              <div>
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Continue Button */}
              <Button
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                onClick={next}
              >
                Get Started
                <span className="ml-2">→</span>
              </Button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center mt-4">
                By continuing, you agree to our{" "}
                <a href="#" className="underline hover:no-underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:no-underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Gradient Background */}
        <div className="hidden lg:block relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
          
          {/* Floating notification */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">Find your dream career with FTN.</span>
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M7 14l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
