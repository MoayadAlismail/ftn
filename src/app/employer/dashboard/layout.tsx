// src/app/employer/layout.tsx
"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, TableOfContents, Users, Menu, X } from "lucide-react";
import Link from "next/link";
import { EmployerProfileMenu } from "@/components/employer-profile-menu";
import LanguageSelector from "@/components/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { employerTranslations } from "@/lib/language";
import { supabase } from "@/lib/supabase/client";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
}

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = employerTranslations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: t.navHome,
      icon: LayoutDashboard,
      href: "/employer/dashboard/home"
    },
    {
      id: "opportunities",
      label: t.navOpportunities,
      icon: TableOfContents,
      href: "/employer/dashboard/opportunities"
    },
    {
      id: "candidates",
      label: t.navCandidates,
      icon: Users,
      href: "/employer/dashboard/candidates"
    }
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col overflow-scroll font-sans">
      {/* Mobile-optimized header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
          {/* Logo and title - optimized for mobile */}
          <div className="flex items-center gap-2 lg:gap-3">
            <Link 
              href="/" 
              prefetch={true}
              className="flex items-center gap-2 text-base lg:text-lg font-semibold text-gray-900 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.svg" alt="Ftn" className="w-6 h-6 lg:w-7 lg:h-7 object-contain" />
              <span className="hidden sm:inline">Ftn</span>
            </Link>
            <span className="text-xs lg:text-sm text-gray-500 border-l border-gray-300 pl-2 lg:pl-3">{t.employer}</span>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => {
              const isActive = item.href && pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href || "#"}
                  prefetch={true}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon size={16} />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop user section */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSelector />
            <EmployerProfileMenu 
              userName={user?.user_metadata?.full_name}
              companyName={user?.user_metadata?.company_name}
              userEmail={user?.email}
              onSignOut={handleSignOut}
            />
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = item.href && pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href || "#"}
                    prefetch={true}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Mobile user info and sign out */}
              <div className="pt-4 mt-4 border-t border-gray-200 px-3 py-2">
                <div className="flex items-center justify-between">
                  <EmployerProfileMenu 
                    userName={user?.user_metadata?.full_name}
                    companyName={user?.user_metadata?.company_name}
                    userEmail={user?.email}
                    onSignOut={handleSignOut}
                  />
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 p-4 lg:p-6 bg-gray-50">{children}</main>
    </div>
  );
}
