// src/app/employer/layout.tsx
"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CreditCard, LayoutDashboard, Settings, TableOfContents, Users } from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
}

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Home",
      icon: LayoutDashboard,
      href: "/employer/dashboard/home"
    },
    {
      id: "opportunities",
      label: "My Opportunities",
      icon: TableOfContents,
      href: "/employer/dashboard/my-opportunities"
    },
    {
      id: "candidates",
      label: "Saved Candidates",
      icon: Users,
      href: "/employer/dashboard/saved-candidates"
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      href: "/employer/dashboard/billing"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/employer/dashboard/settings"
    }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleNavigationClick = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-scroll font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-3 flex items-center justify-between">
          <button
            className="flex items-center gap-2 text-lg font-semibold text-gray-900"
            onClick={() => router.push("/")}
          >
            <img src="/logo.svg" alt="Ftn" className="w-7 h-7 object-contain" />
            <span>Ftn</span>
          </button>

          <nav className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => {
              const isActive = item.href && pathname?.startsWith(item.href);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigationClick(item.href)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50 mt-20">{children}</main>
    </div>
  );
}
