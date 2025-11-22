"use client";
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import { Button } from '@/components/ui/button';
import { Role } from '@/constants/enums'
import { useAuth } from '@/contexts/AuthContext';
import { User, Home, FileText, Menu, X, Settings, CreditCard, LogOut, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ProfileMenu } from '@/components/profile-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { talentTranslations } from '@/lib/language';

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const t = talentTranslations[language];
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems: Array<{
    href: string;
    icon: typeof Home;
    label: string;
    description?: string;
    badge?: number;
  }> = [
    {
      href: "/talent/opportunities",
      icon: Home,
      label: t.navHome,
      description: t.navHomeDescription
    },
    {
      href: "/talent/applications",
      icon: FileText,
      label: t.navApplications
    },
    {
      href: "/talent/services",
      icon: Sparkles,
      label: "Services"
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
                <span className="hidden sm:inline">{t.talentDashboard}</span>
                <span className="sm:hidden">{t.dashboard}</span>
              </h1>
            </div>

            {/* Desktop Navigation - hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium relative ${pathname === item.href
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
              {/* Desktop Profile Dropdown */}
              <div className="hidden lg:block">
                <ProfileMenu 
                  userName={user?.user_metadata.name}
                  userEmail={user?.email}
                  onSignOut={signOut}
                />
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
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium relative ${pathname === item.href
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

                {/* Mobile user info and menu */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 mx-2 bg-gray-50 rounded-lg">
                    <User size={18} className="text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">{user?.user_metadata.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/talent/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg mx-2 cursor-pointer"
                    >
                      <User size={18} />
                      <span>{t.personalInfo}</span>
                    </Link>
                    
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 rounded-lg mx-2 cursor-not-allowed">
                      <CreditCard size={18} />
                      <span>{t.myPayments}</span>
                    </div>
                    
                    <div className="mx-2 my-2 border-t border-gray-200"></div>
                    
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg mx-2 cursor-pointer w-full"
                    >
                      <LogOut size={18} />
                      <span>{t.signOut}</span>
                    </button>
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
