import { NextRequest, NextResponse } from "next/server";
import { EnvVars } from "@/env";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: EnvVars.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body as string;

    if (!text) {
      return NextResponse.json({ error: "Missing or invalid 'texts' array." }, { status: 400 });
    }
    console.log("processing texts for embedding:", text);
    const response = await genAI.models.embedContent({
      model: "gemini-embedding-exp-03-07",
      contents: text,
      config: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    });
    console.log("Embedding response without values iterator:", response.embeddings);
    console.log("Embedding response received:", response.embeddings as number[]);

    return NextResponse.json({ embeddings: response.embeddings as number[] ?? null });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}