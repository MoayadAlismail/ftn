'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { employerTranslations } from "@/lib/language"

interface SignOutButtonProps {
    className?: string
}

export default function SignOutButton({ className }: SignOutButtonProps) {
    const { signOut } = useAuth()
    const { language } = useLanguage()
    const t = employerTranslations[language]

    return (
        <Button
            variant="outline"
            onClick={signOut}
            className={className}
        >
            {t.signOut}
        </Button>
    )
}