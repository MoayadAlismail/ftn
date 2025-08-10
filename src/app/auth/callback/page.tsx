"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Role } from "@/constants/enums";

function CallbackContent() {
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
      console.log(user);
      const hasRole = user.user_metadata?.role;

      await supabase.auth.updateUser({
        data: { role },
      });

      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log(userData);

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
    };

    handleRedirect();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">Signing you in...</p>
    </main>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    }>
      <CallbackContent />
    </Suspense>
  );
}
