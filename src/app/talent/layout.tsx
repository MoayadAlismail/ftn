"use client";
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import { Button } from '@/components/ui/button';
import { Role } from '@/constants/enums'
import { useAuth } from '@/contexts/AuthContext';
import { User, Home, Search, Building2, Mail, FileText, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import SignOutButton from '@/features/auth/SignOutButton';

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navigationItems = [
    {
      href: "/talent/dashboard",
      icon: Home,
      label: "Dashboard"
    },
    {
      href: "/talent/opportunities",
      icon: Building2,
      label: "Opportunities",
      description: "AI-powered job recommendations"
    },
    {
      href: "/talent/applications",
      icon: FileText,
      label: "Applications"
    },
    {
      href: "/talent/invitations",
      icon: Mail,
      label: "Invitations",
      badge: pendingInvitations > 0 ? pendingInvitations : undefined
    }
  ];

  return (
    <ProtectedRoute requiredRole={Role.TALENT}>
      <div className="min-h-screen flex flex-col">
        {/* Mobile-optimized header */}
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            {/* Logo and title - optimized for mobile */}
            <div className="flex items-center">
              <img
                src="/logo.svg"
                alt="Dashboard Logo"
                className="w-6 h-6 md:w-8 md:h-8 mr-2 object-contain"
              />
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                <span className="hidden sm:inline">Talent Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </h1>
            </div>

            {/* Desktop Navigation - hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <item.icon size={16} />
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side - User info and mobile menu */}
            <div className="flex items-center gap-2">
              {/* User info - hidden on small screens */}
              <Link href="/talent/dashboard?tab=profile" className="hidden md:flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors cursor-pointer">
                <User size={18} />
                <p className="text-sm font-semibold text-gray-700">
                  {user?.user_metadata.name}
                </p>
              </Link>

              {/* Desktop sign out */}
              <div className="hidden lg:block">
                <SignOutButton />
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
              <div className="px-4 py-2 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors relative ${pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                ))}

                {/* Mobile user info and sign out */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <Link
                    href="/talent/dashboard?tab=profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg mx-2 transition-colors cursor-pointer"
                  >
                    <User size={18} />
                    <span className="font-medium">{user?.user_metadata.name}</span>
                  </Link>
                  <div className="px-3 py-2">
                    <SignOutButton />
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 bg-gray-50">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
