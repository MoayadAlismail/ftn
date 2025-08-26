'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLoading } from '@/contexts/LoadingContext'
import { Role } from '@/constants/enums'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: Role
}

export default function ProtectedRoute({
    children,
    requiredRole
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, userRole } = useAuth()
    const { startLoading, stopLoading } = useLoading()
    const router = useRouter()

    useEffect(() => {
        // Start loading when auth check begins
        if (isLoading) {
            startLoading()
        }

        if (!isLoading) {
            // Auth check completed
            if (!isAuthenticated) {
                router.replace('/')
            } else if (requiredRole && userRole !== requiredRole) {
                // Redirect based on role mismatch
                if (userRole === Role.TALENT) {
                    router.replace('/')
                } else if (userRole === Role.EMPLOYER) {
                    router.replace('/employer/onboarding')
                } else {
                    router.replace('/')
                }
            } else {
                // Auth check passed, stop loading
                stopLoading()
            }
        }
    }, [isAuthenticated, isLoading, requiredRole, router, userRole, startLoading, stopLoading])

    // If not authenticated or wrong role, don't render children
    if (isLoading || !isAuthenticated || (requiredRole && userRole !== requiredRole)) {
        return null
    }

    // If authenticated and correct role, render children
    return <>{children}</>
}