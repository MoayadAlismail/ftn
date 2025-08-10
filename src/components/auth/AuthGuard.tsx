'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLoading } from '@/contexts/LoadingContext'
import { Role } from '@/constants/enums'

interface AuthGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    requiredRole?: Role
}

export default function AuthGuard({
    children,
    fallback,
    requiredRole
}: AuthGuardProps) {
    const { isAuthenticated, isLoading, userRole } = useAuth()
    const { startLoading, stopLoading } = useLoading()

    useEffect(() => {
        if (isLoading) {
            startLoading()
        } else {
            stopLoading()
        }
    }, [isLoading, startLoading, stopLoading])

    // While loading, render nothing to prevent flash
    if (isLoading) {
        return null
    }

    const hasRequiredRole = !requiredRole || userRole === requiredRole

    if (isAuthenticated && hasRequiredRole) {
        return <>{children}</>
    }

    return fallback ? <>{fallback}</> : null
}