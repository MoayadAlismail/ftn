// src/app/employer/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { User } from "lucide-react";
import { User as UserType } from "@supabase/supabase-js";


export default function TalentLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex flex-row items-center justify-between px-6 py-4 border-b shadow-sm bg-white">
        <h1 className="text-lg font-semibold">Talent Dashboard</h1>
        <div className="flex flex-row items-center gap-2">
          <User />
          <p className="text-sm font-semibold">
            Welcome, {user?.user_metadata.name}
          </p>
          <Button className="cursor-pointer" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
