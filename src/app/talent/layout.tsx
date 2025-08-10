"use client";
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/button';
import { Role } from '@/constants/enums'
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();


  return (
    <ProtectedRoute requiredRole={Role.TALENT}>
      <div className="min-h-screen flex flex-col pb-10">
        <header className="flex flex-row items-center justify-between px-6 py-4 border-b shadow-sm bg-white">
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

        <main className="flex-1 pt-14 p-6 bg-gray-50">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
