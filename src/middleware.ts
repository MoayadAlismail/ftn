import { createClient } from "./lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { Role } from "./constants/enums";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = new Set(["/", "/auth/callback"]);

  // Auth pages that need special handling for already authenticated users
  const loginRoutes = new Set(["/auth/employer/login", "/auth/talent/login"]);

  const signupRoutes = new Set([
    "/auth/employer/signup",
    "/auth/talent/signup",
  ]);

  const onboardingRoutes = new Set([
    "/employer/onboarding",
    "/onboarding/talent",
  ]);

  if (publicRoutes.has(pathname)) {
    return NextResponse.next();
  }

  // Handle login pages for already authenticated users
  if (loginRoutes.has(pathname)) {
    try {
      const { supabase } = createClient(request);
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth timeout")), 5000)
        ),
      ]);
      const {
        data: { user },
        error,
      } = result;

      // If user is authenticated, redirect to their appropriate dashboard
      if (!error && user) {
        const userRole = user.user_metadata?.role as Role;

        if (userRole === Role.TALENT) {
          // Check if onboarded to determine exact redirect
          const isOnboarded = user.user_metadata?.is_onboarded;
          const redirectUrl = isOnboarded
            ? "/talent/opportunities"
            : "/onboarding/talent";
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        } else if (userRole === Role.EMPLOYER) {
          // Check if onboarded to determine exact redirect
          const isOnboarded = user.user_metadata?.is_onboarded;
          const redirectUrl = isOnboarded
            ? "/employer/dashboard/home"
            : "/employer/onboarding";
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
      }

      // If not authenticated or no role, allow access to login page
      return NextResponse.next();
    } catch (error) {
      console.error("Login page redirect check failed:", error);
      // Allow access to login page if check fails
      return NextResponse.next();
    }
  }

  // Handle signup pages for already authenticated users
  if (signupRoutes.has(pathname)) {
    try {
      const { supabase } = createClient(request);
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth timeout")), 5000)
        ),
      ]);
      const {
        data: { user },
        error,
      } = result;

      // If user is authenticated, redirect to their appropriate dashboard
      if (!error && user) {
        const userRole = user.user_metadata?.role as Role;

        if (userRole === Role.TALENT) {
          const isOnboarded = user.user_metadata?.is_onboarded;
          const redirectUrl = isOnboarded
            ? "/talent/opportunities"
            : "/onboarding/talent";
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        } else if (userRole === Role.EMPLOYER) {
          const isOnboarded = user.user_metadata?.is_onboarded;
          const redirectUrl = isOnboarded
            ? "/employer/dashboard/home"
            : "/employer/onboarding";
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
      }

      // If not authenticated, allow access to signup page
      return NextResponse.next();
    } catch (error) {
      console.error("Signup page redirect check failed:", error);
      // Allow access to signup page if check fails
      return NextResponse.next();
    }
  }

  // Handle onboarding pages for already onboarded users
  if (onboardingRoutes.has(pathname)) {
    try {
      const { supabase } = createClient(request);
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth timeout")), 5000)
        ),
      ]);
      const {
        data: { user },
        error,
      } = result;

      // If user is authenticated and already onboarded, redirect to dashboard
      if (!error && user) {
        const userRole = user.user_metadata?.role as Role;
        const isOnboarded = user.user_metadata?.is_onboarded;

        if (isOnboarded) {
          if (userRole === Role.TALENT) {
            return NextResponse.redirect(
              new URL("/talent/opportunities", request.url)
            );
          } else if (userRole === Role.EMPLOYER) {
            return NextResponse.redirect(
              new URL("/employer/dashboard/home", request.url)
            );
          }
        }
      }

      // If not authenticated or not onboarded, allow access to onboarding
      return NextResponse.next();
    } catch (error) {
      console.error("Onboarding page redirect check failed:", error);
      // Allow access to onboarding page if check fails
      return NextResponse.next();
    }
  }

  try {
    // Check if the user is authenticated with timeout
    const { supabase } = createClient(request);
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Auth timeout")), 5000)
      ),
    ]);
    const {
      data: { user },
      error,
    } = result;

    // Handle auth errors or unauthenticated users
    if (error || !user) {
      const response = NextResponse.redirect(new URL("/", request.url));
      // Clear potentially stale auth cookies
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }

    // Get user role from session
    const userRole = user.user_metadata?.role as Role;

    // Role-based route protection with smart redirects
    if (pathname.startsWith("/talent")) {
      if (userRole !== Role.TALENT) {
        if (userRole === Role.EMPLOYER) {
          return NextResponse.redirect(
            new URL("/employer/dashboard/home", request.url)
          );
        }
        return NextResponse.redirect(
          new URL("/auth/talent/login", request.url)
        );
      }

      // Check if talent needs onboarding (only for opportunities routes)
      if (pathname.startsWith("/talent/opportunities")) {
        // Simple onboarding check without full database call
        const isOnboarded = user.user_metadata?.is_onboarded;
        if (!isOnboarded) {
          return NextResponse.redirect(
            new URL("/onboarding/talent", request.url)
          );
        }
      }
    }

    if (pathname.startsWith("/employer")) {
      if (userRole !== Role.EMPLOYER) {
        if (userRole === Role.TALENT) {
          return NextResponse.redirect(
            new URL("/talent/opportunities", request.url)
          );
        }
        return NextResponse.redirect(
          new URL("/auth/employer/login", request.url)
        );
      }

      // Check if employer needs onboarding (only for dashboard routes)
      if (pathname.startsWith("/employer/dashboard")) {
        const isOnboarded = user.user_metadata?.is_onboarded;
        if (!isOnboarded) {
          return NextResponse.redirect(
            new URL("/employer/onboarding", request.url)
          );
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Fail open for better UX - let the page load and handle auth client-side
    return NextResponse.next();
  }
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes
     * - _next (Next.js internals)
     * - Static files (images, fonts, etc.)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
