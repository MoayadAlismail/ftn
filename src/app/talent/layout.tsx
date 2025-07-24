// src/app/employer/layout.tsx
"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TalentLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b shadow-sm bg-white">
        <h1 className="text-lg font-semibold">� Talent Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
