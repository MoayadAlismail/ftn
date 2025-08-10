import { requireRole } from '@/lib/auth'
import { Role } from '@/constants/enums'

export default async function TalentDashboard() {
    // This will redirect if user is not authenticated or not a talent
    const session = await requireRole(Role.TALENT)

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Talent Dashboard</h1>
            <p>Welcome, {session.user.email}</p>

            <div className="mt-6 p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                <p>This is a protected page only accessible to authenticated talent users.</p>
            </div>
        </div>
    )
}