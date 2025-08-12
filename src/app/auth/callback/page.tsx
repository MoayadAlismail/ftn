"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Role } from "@/constants/enums";
import { useLoading } from "@/contexts/LoadingContext";

import { getCurrentUser, getRedirectUrl } from "@/lib/auth-utils";
import { toast } from "sonner";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const handleRedirect = async () => {
      console.log("Starting auth callback process");
      startLoading();

      try {
        const intendedRole = searchParams.get("role") as Role;
        console.log("Intended role from URL:", intendedRole);

        if (!intendedRole || !Object.values(Role).includes(intendedRole)) {
          console.error("Invalid role parameter:", intendedRole);
          toast.error("Invalid authentication request");
          router.replace("/");
          return;
        }

        console.log("Getting Supabase session");
        // const signOut = await supabase.auth.signOut();
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.error("Auth session error:", error);
          toast.error("Authentication failed");
          router.replace("/");
          return;
        }

        const { user } = data.session;
        console.log("Session user:", user.id, "Email:", user.email);

        // Check if user already has a role and it's different from intended
        const existingRole = user.user_metadata?.role as Role;
        console.log("Existing user role:", existingRole, "Intended role:", intendedRole);

        if (existingRole && existingRole !== intendedRole) {
          // User exists with different role - handle role mismatch
          console.log(`Role mismatch detected: existing ${existingRole}, intended ${intendedRole}`);

          toast.error(
            `This account is registered as a ${existingRole}. Please use the correct login page.`,
            { duration: 5000 }
          );

          // Redirect to appropriate login page
          console.log("Redirecting to correct login page");
          if (existingRole === Role.TALENT) {
            router.replace("/auth/talent/login");
          } else if (existingRole === Role.EMPLOYER) {
            router.replace("/auth/employer/login");
          } else {
            router.replace("/");
          }
          return;
        }

        // Update user role if not set or if it matches intended role
        if (!existingRole || existingRole === intendedRole) {
          console.log("Updating user role metadata to:", intendedRole);
          await supabase.auth.updateUser({
            data: { role: intendedRole },
          });
        }

        // Small delay to ensure auth context updates
        console.log("Waiting for auth context to update");
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get enhanced user data with onboarding status
        console.log("Fetching enhanced user data");
        const { user: authUser, error: authError } = await getCurrentUser();

        if (authError || !authUser) {
          console.error("Failed to get user data:", authError);
          toast.error("Failed to load user profile");
          router.replace("/");
          return;
        }

        console.log("Enhanced user data:", {
          id: authUser.id,
          role: authUser.role,
          isOnboarded: authUser.isOnboarded,
          email: authUser.email
        });

        // Get appropriate redirect URL based on role and onboarding status
        const redirectUrl = getRedirectUrl(authUser);
        console.log(`Determined redirect URL: ${redirectUrl}`);

        console.log(`Redirecting ${authUser.role} to ${redirectUrl} (onboarded: ${authUser.isOnboarded})`);

        if (authUser.isOnboarded) {
          toast.success("Welcome back!");
        } else {
          toast.success("Account created! Let's complete your profile.");
        }

        console.log("Performing final redirect to:", redirectUrl);
        router.replace(redirectUrl);

      } catch (error) {
        console.error("Callback error:", error);
        toast.error("An unexpected error occurred");
        router.replace("/");
      } finally {
        // Loading will be stopped by the next page
        console.log("Auth callback process complete, stopping loading");
        setTimeout(stopLoading, 100);
      }
    };

    console.log("Auth callback component mounted, initiating redirect handler");
    handleRedirect();
  }, [router, searchParams, startLoading, stopLoading]);

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
