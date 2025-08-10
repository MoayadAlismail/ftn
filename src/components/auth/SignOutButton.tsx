'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface SignOutButtonProps {
    className?: string
}

export default function SignOutButton({ className }: SignOutButtonProps) {
    const { signOut } = useAuth()

    return (
        <Button
            variant="outline"
            onClick={signOut}
            className={className}
        >
            Sign Out
        </Button>
    )
}