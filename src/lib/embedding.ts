export async function getEmbeddingsFromApi(text: string): Promise<number[] | null> {
    console.log("Fetching embeddings for text:", text);
  const response = await fetch("/api/get-embedding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(text),
  });

  if (!response.ok) {
    // Optionally handle error here
    console.error("Failed to fetch embeddings:", await response.json(), "status::", response.statusText);
    return null;
  }
  const data = await response.json();
  console.log('Api response:', data);
  console.log("Api response refined:", data.embeddings[0].values);
  return data.embeddings[0].values ?? null;
}