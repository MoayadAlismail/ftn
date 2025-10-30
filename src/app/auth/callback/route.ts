import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Role } from '@/constants/enums'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const role = requestUrl.searchParams.get('role') as Role | null

  console.log('[AUTH_CALLBACK] Server-side callback initiated', { 
    hasCode: !!code, 
    role,
    url: requestUrl.toString()
  })

  if (!code) {
    console.error('[AUTH_CALLBACK] No code provided in callback')
    return NextResponse.redirect(new URL('/?error=no_code', requestUrl.origin))
  }

  if (!role || !Object.values(Role).includes(role)) {
    console.error('[AUTH_CALLBACK] Invalid or missing role parameter:', role)
    return NextResponse.redirect(new URL('/?error=invalid_role', requestUrl.origin))
  }

  try {
    const supabase = await createClient()
    
    // Exchange code for session
    console.log('[AUTH_CALLBACK] Exchanging code for session')
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[AUTH_CALLBACK] Error exchanging code:', exchangeError)
      return NextResponse.redirect(new URL(`/?error=exchange_failed`, requestUrl.origin))
    }

    if (!session) {
      console.error('[AUTH_CALLBACK] No session returned after code exchange')
      return NextResponse.redirect(new URL('/?error=no_session', requestUrl.origin))
    }

    console.log('[AUTH_CALLBACK] Session established for user:', session.user.id)

    // Check if user already has a role
    const existingRole = session.user.user_metadata?.role as Role | undefined
    
    if (existingRole && existingRole !== role) {
      // Role mismatch - user trying to login with wrong role
      console.error('[AUTH_CALLBACK] Role mismatch:', { existing: existingRole, intended: role })
      
      // Sign out the user
      await supabase.auth.signOut()
      
      const errorMessage = `This account is registered as a ${existingRole}. Please use the correct login page.`
      return NextResponse.redirect(
        new URL(`/?error=role_mismatch&message=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
      )
    }

    // Update user metadata with role if not set
    if (!existingRole) {
      console.log('[AUTH_CALLBACK] Setting user role to:', role)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role }
      })

      if (updateError) {
        console.error('[AUTH_CALLBACK] Error updating user metadata:', updateError)
        // Don't fail the flow, continue with redirect
      }
    }

    // Check onboarding status from database
    console.log('[AUTH_CALLBACK] Checking onboarding status')
    let isOnboarded = false

    if (role === Role.TALENT) {
      const { data: talentData } = await supabase
        .from('talents')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()
      
      isOnboarded = !!talentData
    } else if (role === Role.EMPLOYER) {
      const { data: employerData } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()
      
      isOnboarded = !!employerData
    }

    console.log('[AUTH_CALLBACK] Onboarding status:', isOnboarded)

    // Determine redirect URL based on role and onboarding status
    let redirectTo: string

    if (role === Role.TALENT) {
      redirectTo = isOnboarded ? '/talent/opportunities' : '/onboarding/talent'
    } else if (role === Role.EMPLOYER) {
      redirectTo = isOnboarded ? '/employer/dashboard/home' : '/employer/onboarding'
    } else {
      // Fallback
      redirectTo = '/'
    }

    console.log('[AUTH_CALLBACK] Redirecting to:', redirectTo)
    
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))

  } catch (error) {
    console.error('[AUTH_CALLBACK] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
    return NextResponse.redirect(
      new URL(`/?error=auth_failed&message=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }
}

