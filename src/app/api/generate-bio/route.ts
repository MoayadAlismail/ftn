import { NextRequest, NextResponse } from "next/server";
import { EnvVars } from "@/env";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: EnvVars.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, workStylePreference, industryPreference, locationPreference } = body;

    console.log("Generating bio from resume text and preferences");

    let prompt = "";
    
    if (!resumeText) {
      // Generate bio based on preferences only
      prompt = `
Generate a professional and engaging bio for a job seeker based on their preferences. The bio should be:
- 2-3 sentences long
- Professional yet personable
- Show personality and career aspirations
- Be suitable for a job matching platform

Work Style Preferences: ${workStylePreference?.join(", ") || "Not specified"}
Industry Preferences: ${industryPreference?.join(", ") || "Not specified"}
Location Preferences: ${locationPreference?.join(", ") || "Not specified"}

Generate a compelling bio that would help this person stand out to potential employers. Focus on their interests, preferred work style, and career goals. Keep it concise but impactful.
Make sure to use first person pronouns and make it sound like the person is talking about themselves.
Bio:`;
    } else {
      // Generate bio based on resume and preferences
      prompt = `
Based on the following resume and preferences, generate a professional and engaging bio for a job seeker. The bio should be:
- 2-3 sentences long
- Professional yet personable
- Highlight key skills and experience
- Show personality and passion
- Be suitable for a job matching platform

Resume Content:
${resumeText}

Work Style Preferences: ${workStylePreference?.join(", ") || "Not specified"}
Industry Preferences: ${industryPreference?.join(", ") || "Not specified"}
Location Preferences: ${locationPreference?.join(", ") || "Not specified"}

Generate a compelling bio that would help this person stand out to potential employers. Focus on their strengths, experience, and what makes them unique. Keep it concise but impactful.
Make sure to use first person pronouns and make it sound like the person is talking about themselves.
Bio:`;
    }
    
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const generatedBio = response.text || "";

    console.log("Bio generated successfully:", generatedBio);

    return NextResponse.json({ 
      bio: generatedBio.trim(),
      success: true 
    });
  } catch (error) {
    console.error("Error generating bio:", error);
    return NextResponse.json({ 
      error: "Failed to generate bio. Please try again.",
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
