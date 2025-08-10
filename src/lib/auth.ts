import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { Role } from '@/constants/enums'

export async function getSession() {
  const supabase = await createClient()
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    return null
  }
}

export async function getUserRole() {
  const session = await getSession()
  return session?.user?.user_metadata?.role as Role | null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/')
  }
  return session
}

export async function requireRole(role: Role) {
  const session = await requireAuth()
  const userRole = session.user.user_metadata?.role
  
  if (userRole !== role) {
    // Redirect based on role
    if (userRole === Role.TALENT) {
      redirect('/?step=3')
    } else if (userRole === Role.EMPLOYER) {
      redirect('/employer/onboarding')
    } else {
      redirect('/')
    }
  }
  
  return session
}