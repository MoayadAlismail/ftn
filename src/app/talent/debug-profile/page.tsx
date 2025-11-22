"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTalentProfile } from "@/hooks/useTalentProfile";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DebugProfilePage() {
  const { user, authUser } = useAuth();
  const { profile } = useTalentProfile();
  const [talentData, setTalentData] = useState<any>(null);
  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    loadDebugData();
  }, [user]);

  const loadDebugData = async () => {
    if (!user?.id) return;

    // Get auth user data
    const { data: { user: authUserData } } = await supabase.auth.getUser();
    setAuthData(authUserData);

    // Get talent profile data
    const { data: talentProfileData } = await supabase
      .from("talents")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setTalentData(talentProfileData);
  };

  const fixAuthMetadata = async () => {
    if (!profile || !user) return;

    try {
      await supabase.auth.updateUser({
        data: {
          name: profile.full_name,
          full_name: profile.full_name,
        }
      });
      
      alert("Auth metadata updated! Please refresh the page.");
      window.location.reload();
    } catch (error) {
      console.error("Error updating auth metadata:", error);
      alert("Failed to update auth metadata");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Profile Debug Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Auth Context Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify({ user, authUser }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auth User Metadata (from Supabase)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(authData?.user_metadata, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Talent Profile (from useTalentProfile hook)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Talent Table Data (direct query)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(talentData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card className="border-yellow-500 bg-yellow-50">
        <CardHeader>
          <CardTitle>Data Mismatch Detected?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {authData && talentData && (
            <div className="space-y-2">
              <p>
                <strong>Auth Name:</strong> {authData.user_metadata?.name || authData.user_metadata?.full_name || "Not set"}
              </p>
              <p>
                <strong>Profile Name:</strong> {profile?.full_name || "Not set"}
              </p>
              <p>
                <strong>Match:</strong>{" "}
                {(authData.user_metadata?.name === profile?.full_name ||
                  authData.user_metadata?.full_name === profile?.full_name) ? (
                  <span className="text-green-600 font-bold">✓ Names match</span>
                ) : (
                  <span className="text-red-600 font-bold">✗ Names DO NOT match</span>
                )}
              </p>

              {(authData.user_metadata?.name !== profile?.full_name &&
                authData.user_metadata?.full_name !== profile?.full_name) && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Click below to sync auth metadata with your profile name:
                  </p>
                  <Button onClick={fixAuthMetadata} variant="default">
                    Fix Auth Metadata → Set to "{profile?.full_name}"
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle>User ID Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Auth User ID:</strong> {user?.id}
          </p>
          <p>
            <strong>Talent user_id:</strong> {talentData?.user_id}
          </p>
          <p>
            <strong>Match:</strong>{" "}
            {user?.id === talentData?.user_id ? (
              <span className="text-green-600 font-bold">✓ IDs match correctly</span>
            ) : (
              <span className="text-red-600 font-bold">✗ IDs DO NOT match (CRITICAL ERROR)</span>
            )}
          </p>
          {user?.id !== talentData?.user_id && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ CRITICAL: The talents table has the wrong user_id! This means you're seeing someone else's profile data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


