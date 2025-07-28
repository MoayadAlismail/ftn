import { NextRequest, NextResponse } from "next/server";
import { EnvVars } from "@/env";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabase/client";



const genAI = new GoogleGenAI({
  apiKey: EnvVars.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Match API route hit");
    const body = await req.json();
    const prompt = body as string;

    if (!prompt) {
      return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }
    console.log("processing texts for embedding:", prompt);
    const response = await genAI.models.embedContent({
      model: "gemini-embedding-exp-03-07",
      contents: prompt,
      config: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    });
    console.log("Prompt Embedding response received:", response.embeddings as number[]);
    const promptEmbedding = response.embeddings![0].values as number[];
    console.log("Refined Prompt Embedding response received:", response.embeddings![0].values as number[]);


    const { data, error } = await supabase.rpc("match_talents", {
      prompt_embedding: promptEmbedding,
      match_threshold: 0.75,   
      match_count: 5
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } 
    
    console.log("🚀 Matched data fetched wohooo:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("🚨 Error in match API route:", error); 
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}