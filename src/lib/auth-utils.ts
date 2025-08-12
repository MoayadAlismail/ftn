import { supabase } from './supabase/client';
import { Role } from '@/constants/enums';

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
    if (role === Role.TALENT) {
      const { data, error } = await supabase
        .from('talents')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      return !error && !!data;
    } else if (role === Role.EMPLOYER) {
      const { data, error } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      return !error && !!data;
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error);
  }
  
  return false;
}

/**
 * Get the current authenticated user with role and onboarding status
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, error: error?.message || 'No user found' };
    }
    
    const role = user.user_metadata?.role as Role;
    
    if (!role) {
      return { user: null, error: 'User role not found' };
    }
    
    const isOnboarded = await checkOnboardingStatus(user.id, role);
    
    return {
      user: {
        id: user.id,
        email: user.email || '',
        role,
        isOnboarded,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name,
        companyName: user.user_metadata?.company_name
      },
      error: null
    };
  } catch (error) {
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
    return user.isOnboarded ? '/talent/dashboard' : '/talent/onboarding';
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
    window.location.href = '/';
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

