// import type { NextApiRequest, NextApiResponse } from "next";
// import pdfParse from "pdf-parse";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   console.log("hey bini, righReceived request to extract resume text");
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     // Parse form data
//     const formData = req.body;
//     // If using formidable or multer, file handling would be different. For now, assume file is sent as base64 or buffer in req.body.file
//     const file = formData.file;
//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }
//     // If file is base64, decode it
//     const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file, "base64");
//     const data = await pdfParse(buffer);
//     return res.status(200).json({ text: data.text });
//   } catch (e) {
//     return res.status(500).json({ error: "Failed to extract text" });
//   }
// }



// export async function GET(req: Request) {
//   console.log("Received request to extract resume text");
//   return new Response(JSON.stringify({ message: "Hello from Next.js!" }), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }


export const runtime = "nodejs";
export const config = {
  api: {
    bodyParser: false,
  },
};


// import pdf from "pdf-parse";

export async function POST(req: Request) {
  try {
//     // Expecting multipart/form-data
    console.log("Received request to extract resume text");
    const formData = await req.formData();
    console.log("Form data received:", formData);
    const file = formData.get("file") as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Buffer created from file:", buffer);
    const pdf = (await import("pdf-parse")).default;
    const data = await pdf(buffer);
    console.log("PDF parsed successfully:", data.text);
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
