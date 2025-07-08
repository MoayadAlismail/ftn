"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Role } from "@/constants/enums";


export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!role) {
      setErrorMsg("Please select a role");
      return;
    }
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `${location.origin}/auth/callback?role=${role}`,
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50 px-4">
      <h1 className="text-3xl font-bold text-center">Login to Ftn Find</h1>
      <div className="flex gap-4">
              <Button
                  className="cursor-pointer"
          variant={role === Role.TALENT ? "default" : "outline"}
          onClick={() => setRole(Role.TALENT)}
        >
          🎓 I'm a Talent
        </Button>
              <Button
                  className="cursor-pointer"
          variant={role === Role.EMPLOYER ? "default" : "outline"}
          onClick={() => setRole(Role.EMPLOYER)}
        >
          🏢 I'm an Employer
        </Button>
      </div>
      {errorMsg && <div className="text-red-600 font-medium">{errorMsg}</div>}

      <Button
        onClick={handleLogin}
        className="bg-black text-white hover:bg-gray-800 cursor-pointer"
        size="lg"
      >
        Sign in with Google
      </Button>
    </main>
  );
}
