"use client";
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import { Button } from '@/components/ui/button';
import { Role } from '@/constants/enums'
import { useAuth } from '@/contexts/AuthContext';
import { User, Home, Search, Building2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <ProtectedRoute requiredRole={Role.TALENT}>
      <div className="min-h-screen flex flex-col">
        <header className="flex flex-row items-center justify-between px-6 py-4 border-b shadow-sm bg-white">
          <div className="flex items-center gap-6">
            <h1 className="text-xl flex flex-row font-bold items-center">
              <span>
                <img
                  src="/logo.svg"
                  alt="Dashboard Logo"
                  className="w-8 h-8 mr-2 object-contain"
                />
              </span>
              Talent Dashboard
            </h1>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <Link
                href="/talent/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/talent/dashboard'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Home size={16} />
                Dashboard
              </Link>
              <Link
                href="/talent/match-making"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/talent/match-making'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Search size={16} />
                AI Matching
              </Link>
              <Link
                href="/talent/opportunities"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/talent/opportunities'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Building2 size={16} />
                Browse Jobs
              </Link>
            </nav>
          </div>

          <div className="flex flex-row items-center gap-2">
            <User />
            <p className="text-sm font-semibold">
              Welcome, {user?.user_metadata.name}
            </p>
            <Button className="cursor-pointer" variant="outline" onClick={signOut}>
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
