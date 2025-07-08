"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export enum Role {
  TALENT = "talent",
  EMPLOYER = "employer",
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  const handleLogin = async () => {
    if (!role) return alert("Please select a role");
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
    <main className="flex flex-col items-center justify-center h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">Login to Ftn Find</h1>
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 border rounded ${
            role === Role.TALENT ? "bg-blue-500 text-white" : ""
          }`}
          onClick={() => setRole(Role.TALENT)}
        >
          🎓 I'm a Talent
        </button>
        <button
          className={`px-4 py-2 border rounded ${
            role === Role.EMPLOYER ? "bg-green-500 text-white" : ""
          }`}
          onClick={() => setRole(Role.EMPLOYER)}
        >
          🏢 I'm an Employer
        </button>
      </div>
      <button
        onClick={handleLogin}
        className="mt-4 px-6 py-2 bg-black text-white rounded"
      >
        Sign in with Google
      </button>
    </main>
  );
}
