// src/app/employer/layout.tsx
"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bookmark, Building2, CreditCard, Settings } from "lucide-react";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col overflow-scroll font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b shadow-sm bg-white">
        <h1 className="text-xl flex flex-row font-bold items-center"><span><Building2 size={35} className="text-primary mr-2" /></span> Ftn Dashboard</h1>
        <div>
          <span className="inline-flex items-center space-x-4 mr-5 text-gray-500">
            <span className="flex items-center space-x-1 cursor-pointer">
              <Bookmark size={15} />
              <span className="text-sm">Saved candidates</span>
            </span>
            <span className="flex items-center space-x-1 cursor-pointer">
              <CreditCard size={15} />
              <span className="text-sm">Billings</span>
            </span>
            <span className="flex items-center space-x-1 cursor-pointer">
              <Settings size={15} />
              <span className="text-sm">Settings</span>
            </span>
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

      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
