export const runtime = "nodejs";
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
//     // Expecting multipart/form-data
    console.log("Received request to extract resume text");
    const formData = await req.formData();
    //console.log("Form data received:", formData);
    const file = formData.get("file") as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    //console.log("Buffer created from file:", buffer);
    const pdf = (await import("pdf-parse")).default;
    const data = await pdf(buffer);
    //console.log("PDF parsed successfully:", data.text);
    return new Response(JSON.stringify({ text: data.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error extracting text from resume:", e);
    return new Response(JSON.stringify({ error: "Failed to extract text" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
