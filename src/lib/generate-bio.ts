export interface GenerateBioRequest {
  resumeText: string;
  workStylePreference?: string[];
  industryPreference?: string[];
  locationPreference?: string[];
}

export interface GenerateBioResponse {
  bio: string;
  success: boolean;
  error?: string;
}

export async function generateBioFromResume(data: GenerateBioRequest): Promise<GenerateBioResponse> {
  try {
    const response = await fetch("/api/generate-bio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to generate bio");
    }

    return result;
  } catch (error) {
    console.error("Error calling bio generation API:", error);
    return {
      bio: "",
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate bio",
    };
  }
}
