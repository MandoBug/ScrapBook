import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: any, res: any) {
  try {
    const bucket = process.env.AWS_BUCKET_NAME!;

    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "I_love_Jadyn/", // ← change ONLY if your folder is named differently
      })
    );

    const memories = (data.Contents || [])
      .filter(obj => obj.Key && !obj.Key.endsWith("/"))
      .map(obj => ({
        id: obj.Key,
        date: obj.Key!.split("/")[1],
        mediaUrl: `https://${bucket}.s3.amazonaws.com/${obj.Key}`,
      }));

    res.status(200).json(memories);
  } catch (err) {
    console.error("S3 error:", err);
    res.status(500).json({ error: "Failed to load memories" });
  }
}
