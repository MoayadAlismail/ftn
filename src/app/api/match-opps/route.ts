import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Match Opportunities API route hit");
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing or invalid ID" },
        { status: 400 }
      );
    }

    console.log("Processing match opportunities for ID:", id);

    const { data, error } = await supabase.rpc("match_opps", {
      talent_id: id,
      match_threshold: 0.75,
      match_count: 5,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("🚀 Matched opportunities fetched:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("🚨 Error in match-opps API route:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
