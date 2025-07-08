'use client';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10 bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="text-center max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Ftn Find — AI-powered talent discovery
        </h1>
        <p className="text-lg text-slate-600 mb-6">
          Smartly match early talents with the right opportunities using AI.
        </p>
        <Link href="/auth/login">
          <Button className="cursor-pointer" size="lg">Get Started</Button>
        </Link>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold mb-6">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          {[
            {
              title: "1. Describe your ideal candidate",
              desc: "Employers input a prompt describing who they’re looking for.",
            },
            {
              title: "2. Let AI do the matching",
              desc: "Ftn Find runs intelligent matchmaking using Gemini API.",
            },
            {
              title: "3. Invite promising talents",
              desc: "Review matches and send invites directly to candidates.",
            },
          ].map((step, i) => (
            <div key={i} className="p-4 rounded-lg border bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IT’S FOR */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold mb-6">Who is it for?</h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="border bg-white p-6 rounded-lg shadow-sm max-w-sm">
            <h3 className="text-xl font-bold mb-2">🎓 Talents</h3>
            <p className="text-slate-600 text-sm">
              Create your profile once, and get discovered by top employers.
            </p>
          </div>
          <div className="border bg-white p-6 rounded-lg shadow-sm max-w-sm">
            <h3 className="text-xl font-bold mb-2">🏢 Employers</h3>
            <p className="text-slate-600 text-sm">
              Describe your ideal hire — and let AI do the matchmaking.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-24 text-sm text-slate-500">
        © {new Date().getFullYear()} Ftn Find. All rights reserved.
      </footer>
    </main>
  );
}
