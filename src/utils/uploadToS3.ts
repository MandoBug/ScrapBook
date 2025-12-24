export async function uploadToS3(file: File): Promise<{ key: string }> {
  // 1️⃣ Ask backend for signed upload URL
  const res = await fetch("http://localhost:4000/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to get upload URL");
  }

  const { uploadUrl, key } = await res.json();

  // 2️⃣ Upload file directly to S3
  await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });


  if (!uploadUrl.ok) {
    throw new Error("S3 upload failed");
  }

  // 3️⃣ Return S3 key so we can save it in memory.photos
  return { key };
}
