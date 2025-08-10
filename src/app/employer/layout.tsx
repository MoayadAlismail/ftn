import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Role } from '@/constants/enums'

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute requiredRole={Role.EMPLOYER}>
            {children}
        </ProtectedRoute>
    )
}