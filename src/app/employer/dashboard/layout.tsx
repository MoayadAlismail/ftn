// src/app/employer/layout.tsx
"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, LayoutDashboard, Settings, TableOfContents, Users } from "lucide-react";
import Link from "next/link";
import SignOutButton from "@/features/auth/SignOutButton";

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
      label: "Opportunities",
      icon: TableOfContents,
      href: "/employer/dashboard/opportunities"
    },
    {
      id: "candidates",
      label: "Candidates",
      icon: Users,
      href: "/employer/dashboard/candidates"
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

  return (
    <div className="min-h-screen flex flex-col overflow-scroll font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-3 flex items-center justify-between">
          <Link 
            href="/" 
            prefetch={true}
            className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="Ftn" className="w-7 h-7 object-contain" />
            <span>Ftn</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <SignOutButton/>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50 mt-20">{children}</main>
    </div>
  );
}
