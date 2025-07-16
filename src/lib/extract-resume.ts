export async function extractResumeText(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/extract-resume", {
    method: "POST",
    body: formData,
  });
  if (res.ok) {
    const data = await res.json();
    console.log("Response from resume extraction fetcheddddd:", data);
    return data.text;
  } else {
    alert("Failed to extract resume text");
    return null;
  }
};


