import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Match Opportunities API route hit");
    const body = await req.json();
    const { id, offset = 0, limit = 10, match_threshold = 0.75 } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing or invalid ID" },
        { status: 400 }
      );
    }

    console.log("Processing match opportunities for ID:", id, { offset, limit });

    // Get talent data to check if embedding exists
    const { data: talentData, error: talentError } = await supabase
      .from("talents")
      .select("embedding, user_id")
      .eq("user_id", id)
      .maybeSingle();

    if (talentError) {
      return NextResponse.json({ error: talentError.message }, { status: 500 });
    }

    if (!talentData?.embedding) {
      return NextResponse.json({ 
        error: "User embedding not found. Please complete AI matching setup.",
        needsSetup: true 
      }, { status: 400 });
    }

    // Use RPC for AI matching with pagination
    const { data, error } = await supabase.rpc("match_opps_paginated", {
      talent_user_id: id,
      match_threshold: match_threshold,
      result_limit: limit,
      result_offset: offset,
    });

    if (error) {
      // Fallback to original function if new RPC doesn't exist
      console.log("Falling back to original match_opps function");
      const { data: fallbackData, error: fallbackError } = await supabase.rpc("match_opps", {
        talent_id: id,
        match_threshold: match_threshold,
        match_count: limit,
      });

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }

      // Apply manual pagination for fallback
      const paginatedData = fallbackData?.slice(offset, offset + limit) || [];
      console.log("🚀 Matched opportunities fetched (fallback):", paginatedData.length);
      return NextResponse.json(paginatedData);
    }

    console.log("🚀 Matched opportunities fetched:", data?.length || 0);

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("🚨 Error in match-opps API route:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
