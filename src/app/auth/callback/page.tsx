"use client";

import { Suspense } from "react";
import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Role } from "@/constants/enums";
import { useLoading } from "@/contexts/LoadingContext";

import { getCurrentUser, getRedirectUrl } from "@/lib/auth-utils";
import { toast } from "sonner";

// Helper function to add timeout to async operations
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoading();

  const handleRedirect = useCallback(async () => {
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

      console.log("Getting Supabase session with timeout");
      const { data, error } = await withTimeout(
        supabase.auth.getSession(),
        10000 // 10 second timeout
      );

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
        try {
          await withTimeout(
            supabase.auth.updateUser({
              data: { role: intendedRole },
            }),
            8000 // 8 second timeout
          );
          console.log("Successfully updated user role metadata");
        } catch (updateError) {
          console.error("Failed to update user role:", updateError);
          // Continue anyway - we can try to fetch user data
        }
      }

      // Small delay to ensure auth context updates
      console.log("Waiting for auth context to update");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get enhanced user data with onboarding status (with retry logic)
      console.log("Fetching enhanced user data");
      let authUser = null;
      let authError = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`Attempt ${attempt} to fetch user data`);
        try {
          const result = await withTimeout(getCurrentUser(), 10000);
          authUser = result.user;
          authError = result.error;

          if (authUser && authUser.role) {
            console.log("Successfully fetched user data on attempt", attempt);
            break;
          } else if (attempt < 3) {
            console.log("User data incomplete, retrying...");
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (fetchError) {
          console.error(`Attempt ${attempt} failed:`, fetchError);
          authError = fetchError instanceof Error ? fetchError.message : 'Failed to fetch user data';
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (authError || !authUser) {
        console.error("Failed to get user data after retries:", authError);
        toast.error("Failed to load user profile. Please try logging in again.");
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

      // Prevent duplicate toasts by using a session-based flag
      const toastKey = `welcome_toast_${authUser.id}_${Date.now()}`;
      const hasShownToast = sessionStorage.getItem('welcome_toast_shown');
      
      if (!hasShownToast) {
        if (authUser.isOnboarded) {
          toast.success("Welcome back!");
        } else {
          toast.success("Account created! Let's complete your profile.");
        }
        // Set flag to prevent duplicate toasts for this session
        sessionStorage.setItem('welcome_toast_shown', toastKey);
      }

      console.log("Performing final redirect to:", redirectUrl);
      router.replace(redirectUrl);

    } catch (error) {
      console.error("Callback error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      router.replace("/");
    } finally {
      // Loading will be stopped by the next page
      console.log("Auth callback process complete, stopping loading");
      setTimeout(stopLoading, 100);
    }
  }, [router, searchParams, startLoading, stopLoading]);

  useEffect(() => {
    console.log("Auth callback component mounted, initiating redirect handler");
    handleRedirect();
  }, [handleRedirect]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Signing you in...</p>
        <p className="text-xs text-muted-foreground/60">This may take a moment</p>
      </div>
    </main>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading authentication...</p>
        </div>
      </main>
    }>
      <CallbackContent />
    </Suspense>
  );
}
