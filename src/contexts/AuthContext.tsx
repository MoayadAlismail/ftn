'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Role } from '@/constants/enums'
import { getCurrentUser, type AuthUser } from '@/lib/auth-utils'
import { useLoading } from './LoadingContext'

// Utility to prevent hanging auth calls
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Auth operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

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
    authError: string | null
    clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [authUser, setAuthUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [authError, setAuthError] = useState<string | null>(null)
    const router = useRouter()
    const { stopLoading } = useLoading()
    
    // Track ongoing requests to prevent race conditions
    const currentUserRequestRef = useRef<Promise<any> | null>(null)
    const isInitializedRef = useRef(false)
    const lastSessionRef = useRef<Session | null>(null)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Deduplicated getCurrentUser function
    const fetchCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
        // If there's already a request in flight, wait for it
        if (currentUserRequestRef.current) {
            try {
                const result = await currentUserRequestRef.current
                return result
            } catch (error) {
                // If the existing request failed, we'll create a new one below
            }
        }

        // Create new request
        const request = (async () => {
            try {
                console.log("Fetching enhanced user data...");
                const { user: authUserData, error } = await getCurrentUser()
                
                if (error) {
                    console.error("Failed to get enhanced user data:", error);
                    setAuthError(error || 'Failed to load user data')
                    return null
                } else {
                    console.log("Successfully fetched auth user:", authUserData?.role);
                    setAuthError(null)
                    return authUserData
                }
            } catch (error) {
                console.error("Error fetching enhanced user data:", error);
                setAuthError('Network error while loading user data')
                return null
            } finally {
                // Clear the request reference when done
                currentUserRequestRef.current = null
            }
        })()

        currentUserRequestRef.current = request
        return await request
    }, [])

    const handleAuthStateChange = useCallback(async (event: unknown, session: Session | null) => {
        // Ignore SIGNED_OUT events as we handle sign out manually
        if (event === 'SIGNED_OUT') {
            return
        }

        // Only handle auth state changes after initial load
        if (!isInitializedRef.current) {
            return
        }

        // Check if this is actually a meaningful change
        const previousSession = lastSessionRef.current
        const currentUserId = session?.user?.id
        const previousUserId = previousSession?.user?.id
        const currentAccessToken = session?.access_token
        const previousAccessToken = previousSession?.access_token

        // Skip if no meaningful change occurred
        if (currentUserId === previousUserId && currentAccessToken === previousAccessToken) {
            console.log("Auth state change detected but no meaningful change, skipping");
            return
        }

        console.log("Meaningful auth state change detected:", { 
            event, 
            previousUserId,
            currentUserId,
            tokenChanged: currentAccessToken !== previousAccessToken
        });

        // Update session reference for future comparisons
        lastSessionRef.current = session

        // Clear any pending debounced updates
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        // Debounce the actual state update to prevent rapid-fire changes
        debounceTimeoutRef.current = setTimeout(async () => {
            try {
                setSession(session)
                setUser(session?.user ?? null)
                setAuthError(null)

                // Get enhanced user data if authenticated
                if (session?.user) {
                    const authUserData = await fetchCurrentUser()
                    setAuthUser(authUserData)
                } else {
                    console.log("No session user, clearing auth user");
                    setAuthUser(null)
                    // Cancel any ongoing request
                    currentUserRequestRef.current = null
                }
            } catch (error) {
                console.error("Error handling auth state change:", error)
                setAuthError('Failed to update authentication state')
            } finally {
                setIsLoading(false)
            }
        }, 100) // 100ms debounce
    }, [fetchCurrentUser])

    const initializeAuth = useCallback(async () => {
        try {
            setIsLoading(true)
            setAuthError(null)
            
            // Wrap session call with timeout to prevent hanging
            const { data: { session }, error } = await withTimeout(
                supabase.auth.getSession(),
                8000 // 8 second timeout
            )
            
            if (error) {
                console.error("Session error:", error)
                setAuthError(error.message)
                setSession(null)
                setUser(null)
                setAuthUser(null)
                return
            }

            // Initialize session reference for change detection
            lastSessionRef.current = session
            
            setSession(session)
            setUser(session?.user ?? null)

            // Get enhanced user data if authenticated
            if (session?.user) {
                const authUserData = await fetchCurrentUser()
                setAuthUser(authUserData)
            } else {
                setAuthUser(null)
            }
        } catch (error) {
            console.error("Auth initialization error:", error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize authentication'
            setAuthError(errorMessage)
            setSession(null)
            setUser(null)
            setAuthUser(null)
        } finally {
            setIsLoading(false)
            isInitializedRef.current = true
        }
    }, [fetchCurrentUser])

    useEffect(() => {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

        // Then initialize auth
        initializeAuth()

        return () => {
            subscription.unsubscribe()
            // Cancel any ongoing requests
            currentUserRequestRef.current = null
            // Clear debounce timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
                debounceTimeoutRef.current = null
            }
            // Reset session reference
            lastSessionRef.current = null
        }
    }, [handleAuthStateChange, initializeAuth])

    const signOut = useCallback(async () => {
        console.log("🔓 signOut function called - starting sign out process");
        try {
            setIsLoading(true)
            setAuthError(null)
            
            // Cancel any ongoing requests
            currentUserRequestRef.current = null
            
            console.log("🔓 Calling supabase.auth.signOut() with timeout");
            const { error } = await withTimeout(
                supabase.auth.signOut(),
                5000 // 5 second timeout for sign out
            )

            if (error) {
                console.error('🔓 Supabase signOut error:', error)
                setAuthError(error.message)
                return
            }

            console.log("🔓 Supabase signOut successful, updating context state");
            // Update context state immediately
            lastSessionRef.current = null
            setSession(null)
            setUser(null)
            setAuthUser(null)
            stopLoading()
            console.log("🔓 Context state cleared, redirecting to home using router");
            console.log("🔓 Sign out process completed");
        } catch (error) {
            console.error('🔓 Sign out error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to sign out'
            setAuthError(errorMessage)
        } finally {
            setIsLoading(false)
            stopLoading()
            router.push('/')
        }
    }, [router])

    const refreshAuthUser = useCallback(async () => {
        if (user && !isLoading) {
            try {
                setAuthError(null)
                const authUserData = await fetchCurrentUser()
                setAuthUser(authUserData)
            } catch (error) {
                console.error('Failed to refresh auth user:', error)
                setAuthError('Failed to refresh user data')
            }
        }
    }, [user, isLoading, fetchCurrentUser])

    const clearAuthError = useCallback(() => {
        setAuthError(null)
    }, [])

    const value = useMemo(() => ({
        session,
        user,
        authUser,
        isLoading,
        isAuthenticated: !!user,
        userRole: authUser?.role || null,
        isOnboarded: authUser?.isOnboarded || false,
        authError,
        signOut,
        refreshAuthUser,
        clearAuthError
    }), [session, user, authUser, isLoading, authError, signOut, refreshAuthUser, clearAuthError])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}