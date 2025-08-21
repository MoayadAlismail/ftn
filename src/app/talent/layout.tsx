"use client";
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import { Button } from '@/components/ui/button';
import { Role } from '@/constants/enums'
import { useAuth } from '@/contexts/AuthContext';
import { User, Home, Search, Building2, Mail, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import SignOutButton from '@/features/auth/SignOutButton';

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [pendingInvitations, setPendingInvitations] = useState(0);

  // Fetch pending invitations count
  useEffect(() => {
    const fetchPendingInvitations = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("invites")
          .select("id")
          .eq("talent_id", user.id)
          .eq("status", "pending");

        if (!error && data) {
          setPendingInvitations(data.length);
        }
      } catch (error) {
        console.error("Error fetching pending invitations:", error);
      }
    };

    fetchPendingInvitations();

    // Set up real-time subscription for invitations
    const subscription = supabase
      .channel('invitations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invites',
          filter: `talent_id=eq.${user?.id}`
        },
        () => {
          fetchPendingInvitations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

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
                prefetch={true}
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
                prefetch={true}
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
                prefetch={true}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/talent/opportunities'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Building2 size={16} />
                Browse Jobs
              </Link>
              <Link
                href="/talent/applications"
                prefetch={true}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/talent/applications'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <FileText size={16} />
                Applications
              </Link>
              <Link
                href="/talent/invitations"
                prefetch={true}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${pathname === '/talent/invitations'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Mail size={16} />
                Invitations
                {pendingInvitations > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingInvitations > 9 ? '9+' : pendingInvitations}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          <div className="flex flex-row items-center gap-2">
            <User />
            <p className="text-sm font-semibold">
              Welcome, {user?.user_metadata.name}
            </p>
            <SignOutButton/>
            {/* <Button
              className="cursor-pointer"
              variant="outline"
              onClick={async (e) => {
                console.log("🔘 Logout button clicked");
                e.preventDefault();
                e.stopPropagation();

                try {
                  await signOut();
                } catch (error) {
                  console.error("🔘 Error during signOut from button click:", error);
                  // signOut function already handles routing
                }
              }}
            >
              Logout
            </Button> */}
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
