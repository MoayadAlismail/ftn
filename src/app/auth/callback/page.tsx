'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRedirect = async () => {
      const role = searchParams.get('role');

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error('Auth error:', error);
        return;
      }

      // Optional: Store role in user metadata (once only)
      const { user } = data.session;
      const hasRole = user.user_metadata?.role;
      if (!hasRole && role) {
        await supabase.auth.updateUser({
          data: { role },
        });
      }

      // Redirect based on role
      if (role === 'talent') {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    };

    handleRedirect();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">Signing you in...</p>
    </main>
  );
}
