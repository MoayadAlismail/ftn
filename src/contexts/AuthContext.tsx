'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Role } from '@/constants/enums'

type AuthContextType = {
    user: User | null
    session: Session | null
    isLoading: boolean
    signOut: () => Promise<void>
    isAuthenticated: boolean
    userRole: Role | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
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
                } else {
                    setSession(session)
                    setUser(session?.user ?? null)
                }
            } catch (error) {
                console.error("Auth error:", error)
            } finally {
                clearTimeout(initialTimeout)
                setIsLoading(false)
            }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setIsLoading(false)
        })

        setData()

        return () => {
            clearTimeout(initialTimeout)
            subscription.unsubscribe()
        }
    }, [router])

    const value = {
        session,
        user,
        isLoading,
        isAuthenticated: !!user,
        userRole: user?.user_metadata?.role as Role || null,
        signOut: async () => {
            await supabase.auth.signOut()
            router.push('/')
        }
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