"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function EmployerDashboard() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/auth/login");
        return;
      }
      setEmail(data.user.email || "");
    };

    fetchUser();
  }, [router]);

  return (
    <main className="max-w-2xl mx-auto py-16 px-4 space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Ftn Find, Employer 👋</h1>
      <p className="text-lg text-gray-600">Logged in as: {email}</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Create a new AI prompt</h2>
        <Button onClick={() => router.push("/employer/new-prompt")}>
          ✨ Create New Prompt
        </Button>
      </div>
    </main>
  );
}
