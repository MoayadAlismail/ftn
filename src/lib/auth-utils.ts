import { supabase } from './supabase/client';
import { Role } from '@/constants/enums';

// Utility to prevent hanging auth calls
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Auth operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  isOnboarded: boolean;
  fullName?: string;
  companyName?: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Check if a user is onboarded by looking for their profile in the appropriate table
 */
async function checkOnboardingStatus(userId: string, role: Role): Promise<boolean> {
  try {
    console.log(`Checking onboarding status for user ${userId} with role ${role}`);
    
    if (role === Role.TALENT) {
      const { data, error } = await supabase
        .from('talents')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error querying talents table:', error);
        throw error;
      }
      
      const isOnboarded = !!data;
      console.log(`Talent onboarding status: ${isOnboarded}`);
      return isOnboarded;
    } else if (role === Role.EMPLOYER) {
      const { data, error } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error querying employers table:', error);
        throw error;
      }
      
      const isOnboarded = !!data;
      console.log(`Employer onboarding status: ${isOnboarded}`);
      return isOnboarded;
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    throw error; // Re-throw to let caller handle
  }
  
  console.log('Unknown role, defaulting to not onboarded');
  return false;
}

/**
 * Get the current authenticated user with role and onboarding status
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    console.log("Getting user from Supabase auth...");
    const { data: { user }, error } = await withTimeout(
      supabase.auth.getUser(),
      8000 // 8 second timeout
    );
    
    if (error || !user) {
      console.error("Failed to get user from auth:", error);
      return { user: null, error: error?.message || 'No user found' };
    }
    
    console.log("Got user from auth:", { id: user.id, email: user.email, metadata: user.user_metadata });
    
    const role = user.user_metadata?.role as Role;
    
    if (!role) {
      console.error("User role not found in metadata");
      return { user: null, error: 'User role not found' };
    }
    
    console.log("Checking onboarding status for role:", role);
    let isOnboarded = false;
    
    try {
      isOnboarded = await withTimeout(
        checkOnboardingStatus(user.id, role),
        5000 // 5 second timeout for database check
      );
      console.log("Onboarding status check result:", isOnboarded);
    } catch (onboardingError) {
      console.error("Failed to check onboarding status:", onboardingError);
      // Don't fail the entire function if onboarding check fails
      // Default to false and let the user proceed
      isOnboarded = false;
    }
    
    const authUser = {
      id: user.id,
      email: user.email || '',
      role,
      isOnboarded,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name,
      companyName: user.user_metadata?.company_name
    };
    
    console.log("Successfully created auth user:", authUser);
    
    return {
      user: authUser,
      error: null
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get the appropriate redirect URL based on user's role and onboarding status
 */
export function getRedirectUrl(user: AuthUser): string {
  if (user.role === Role.TALENT) {
    return user.isOnboarded ? '/talent/dashboard' : '/onboarding/talent';
  } else if (user.role === Role.EMPLOYER) {
    return user.isOnboarded ? '/employer/dashboard/home' : '/employer/onboarding';
  }
  
  return '/';
}

/**
 * Check if a provider login is allowed for the specified role
 */
export function isProviderAllowedForRole(provider: string, role: Role): boolean {
  const talentProviders = ['google', 'github', 'linkedin_oidc'];
  const employerProviders = ['google', 'linkedin_oidc'];
  
  if (role === Role.TALENT) {
    return talentProviders.includes(provider);
  } else if (role === Role.EMPLOYER) {
    return employerProviders.includes(provider);
  }
  
  return false;
}

/**
 * Handle OAuth login with role validation
 */
export async function handleOAuthLogin(
  provider: 'google' | 'github' | 'linkedin_oidc',
  role: Role,
  redirectUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if provider is allowed for this role
    if (!isProviderAllowedForRole(provider, role)) {
      return {
        success: false,
        error: `${provider} login is not available for ${role}s`
      };
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl || `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent',
        } : undefined
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'OAuth login failed' 
    };
  }
}

/**
 * Check for existing user with different role and handle appropriately
 */
export async function checkExistingUserRole(email: string, intendedRole: Role): Promise<{
  exists: boolean;
  currentRole?: Role;
  message?: string;
}> {
  try {
    // This would require a custom database function or API endpoint
    // For now, we'll handle this in the auth callback
    return { exists: false };
  } catch (error) {
    console.error('Error checking existing user role:', error);
    return { exists: false };
  }
}

/**
 * Sign out user and redirect to home
 */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
    // Let middleware handle redirect after sign out
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(updates: Record<string, any>): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    
    return !error;
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return false;
  }
}

/**
 * Mark user as onboarded
 */
export async function markUserAsOnboarded(role: Role): Promise<boolean> {
  try {
    return await updateUserMetadata({ is_onboarded: true });
  } catch (error) {
    console.error('Error marking user as onboarded:', error);
    return false;
  }
}

/**
 * Send OTP for passwordless authentication (works for both signin and signup)
 */
export async function sendAuthOTP(email: string): Promise<{
  success: boolean;
  error?: string;
  needsVerification?: boolean;
}> {
  try {
    // Send OTP for passwordless authentication - works for both new and existing users
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Allow creating new user if doesn't exist
      }
    });

    if (otpError) {
      return { 
        success: false, 
        error: otpError.message 
      };
    }

    return { 
      success: true, 
      needsVerification: true 
    };
  } catch (error) {
    console.error('Error sending auth OTP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification code' 
    };
  }
}

/**
 * Verify OTP for authentication (works for both signin and signup)
 */
export async function verifyAuthOTP(email: string, otp: string, role: Role, userData?: {
  fullName?: string;
  companyName?: string;
}): Promise<{
  success: boolean;
  error?: string;
  user?: AuthUser;
}> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }

    if (data.session && data.user) {
      // Check if user role matches expected role (for existing users)
      const existingRole = data.user.user_metadata?.role as Role;
      
      if (existingRole && existingRole !== role) {
        // Sign out if role mismatch
        await supabase.auth.signOut();
        return {
          success: false,
          error: `This account is registered as a ${existingRole}. Please use the correct login page.`
        };
      }

      // Update user metadata with role and additional data
      const updateData: Record<string, any> = { role };
      
      // Only update additional data if provided (typically for new users)
      if (userData?.fullName) {
        updateData.full_name = userData.fullName;
        updateData.name = userData.fullName;
      }
      
      if (userData?.companyName) {
        updateData.company_name = userData.companyName;
      }

      await supabase.auth.updateUser({
        data: updateData,
      });

      // Get enhanced user data
      const { user: authUser, error: userError } = await getCurrentUser();
      
      if (userError || !authUser) {
        return {
          success: false,
          error: userError || 'Failed to get user data'
        };
      }

      return {
        success: true,
        user: authUser
      };
    }

    return { 
      success: false, 
      error: 'Verification failed' 
    };
  } catch (error) {
    console.error('Error verifying auth OTP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Verification failed' 
    };
  }
}

