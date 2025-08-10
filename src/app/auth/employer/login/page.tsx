"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export default function EmployerLogin() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `${location.origin}/auth/callback?role=employer`,
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-slate-50 text-slate-900">
      <AnimatePresence mode="wait">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.3 }}
        >
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
              <div className="bg-blue-100 rounded-full p-3 mb-4">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-center mb-6">
                Create your company account
              </p>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 mb-3 border-gray-300 cursor-pointer"
                onClick={handleLogin}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                  fill="none"
                  className="mr-2"
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
              <div className="flex items-center w-full mb-3">
                <div className="flex-grow h-px bg-gray-200" />
                <span className="mx-2 text-gray-400 text-sm">
                  or continue quickly
                </span>
                <div className="flex-grow h-px bg-gray-200" />
              </div>
              <Input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <Input
                type="password"
                placeholder="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <Button
                className="cursor-pointer w-full mb-2"
                onClick={() => alert("Login functionality not implemented yet")}
              >
                Get Started
                <span className="ml-2">→</span>
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                By continuing, you agree to our{" "}
                <a href="#" className="underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
