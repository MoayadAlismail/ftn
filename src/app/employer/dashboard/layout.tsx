// src/app/employer/layout.tsx
"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Bookmark, Building2, CreditCard, LayoutDashboard, Settings, TableOfContents, Users } from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
}

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
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
      href: "/employer/home/candidates"
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      href: "/employer/home/billing"
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
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b shadow-sm bg-white">
        <h1 className="text-xl flex flex-row font-bold items-center">
          <span>
            <img
              src="/logo.svg"
              alt="Dashboard Logo"
              className="w-8 h-8 mr-2 object-contain"
            />
          </span>
          Ftn Dashboard
        </h1>
        <div>
          <span className="inline-flex items-center space-x-4 mr-5 text-gray-500">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <span
                  key={item.id}
                  className="flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleNavigationClick(item.href)}
                >
                  <IconComponent size={15} />
                  <span className="text-sm">{item.label}</span>
                </span>
              );
            })}
          </span>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50 mt-18">{children}</main>
    </div>
  );
}
