"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Role } from "@/constants/enums";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRedirect = async () => {
      const role = searchParams.get("role");

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Auth error:", error);
        return;
      }

      const { user } = data.session;
      const hasRole = user.user_metadata?.role;
      if (!hasRole && role) {
        await supabase.auth.updateUser({
          data: { role },
        });
      }

      // // Redirect based on role
      if (role === Role.TALENT) {
        // router.replace('/talent/onboarding');
        router.replace("/?step=3");
      } else if (role === Role.EMPLOYER) {
        // router.replace('/employer/dashboard');
        router.replace("/employer/onboarding");
      } else {
        router.replace("/");
      }

      // After successful authentication, redirect to a route and pass props via query params
      // For example, redirect to /talent/onboarding with a prop (e.g., fromAuthCallback=true)
    };

    handleRedirect();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">Signing you in...</p>
    </main>
  );
}
