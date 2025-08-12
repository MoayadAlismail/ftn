'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Role } from '@/constants/enums'
import { getCurrentUser, type AuthUser } from '@/lib/auth-utils'

type AuthContextType = {
    user: User | null
    session: Session | null
    isLoading: boolean
    signOut: () => Promise<void>
    isAuthenticated: boolean
    userRole: Role | null
    authUser: AuthUser | null
    isOnboarded: boolean
    refreshAuthUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [authUser, setAuthUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Set up initial loading state
        const initialTimeout = setTimeout(() => {
            // If still loading after 200ms, show loading state
            // This prevents flash for quick auth checks
        }, 200)

        const setData = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) {
                    console.error(error)
                    setSession(null)
                    setUser(null)
                    setAuthUser(null)
                } else {
                    setSession(session)
                    setUser(session?.user ?? null)

                    // Get enhanced user data if authenticated
                    if (session?.user) {
                        const { user: authUserData } = await getCurrentUser()
                        setAuthUser(authUserData)
                    } else {
                        setAuthUser(null)
                    }
                }
            } catch (error) {
                console.error("Auth error:", error)
            } finally {
                clearTimeout(initialTimeout)
                setIsLoading(false)
            }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)

            // Get enhanced user data if authenticated
            if (session?.user) {
                const { user: authUserData } = await getCurrentUser()
                setAuthUser(authUserData)
            } else {
                setAuthUser(null)
            }

            setIsLoading(false)
        })

        setData()

        return () => {
            clearTimeout(initialTimeout)
            subscription.unsubscribe()
        }
    }, [router])

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            // Update context state immediately
            setSession(null)
            setUser(null)
            setAuthUser(null)
            router.push('/')
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    const refreshAuthUser = async () => {
        if (user) {
            const { user: authUserData } = await getCurrentUser()
            setAuthUser(authUserData)
        }
    }

    const value = {
        session,
        user,
        authUser,
        isLoading,
        isAuthenticated: !!user,
        userRole: user?.user_metadata?.role as Role || null,
        isOnboarded: authUser?.isOnboarded || false,
        signOut,
        refreshAuthUser
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}