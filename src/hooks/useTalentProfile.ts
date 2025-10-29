"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TalentProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  bio: string;
  work_style_pref: string[];
  industry_pref: string[];
  location_pref: string;
  resume_url?: string | null;
  skills?: string[];
  is_onboarded?: boolean;
  created_at: string;
}

interface UseTalentProfileReturn {
  profile: TalentProfile | null;
  hasResume: boolean;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

export function useTalentProfile(): UseTalentProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (fetchInProgressRef.current) {
      return;
    }

    fetchInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("talents")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching talent profile:", fetchError);
        setError(fetchError.message);
        setProfile(null);
        return;
      }

      if (isMountedRef.current) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
        setProfile(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchProfile();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    hasResume: !!(profile?.resume_url),
    isLoading,
    error,
    refreshProfile,
  };
}

