// server/s3.js
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION || "us-west-1";

if (!BUCKET) {
  console.warn("[S3] S3_BUCKET_NAME is not set");
}

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

/**
 * 🔹 Signed GET URL (used when reading memories)
 */
export async function getSignedMediaUrl(key, expiresIn = 60 * 10) {
  if (!BUCKET) throw new Error("S3_BUCKET_NAME not set");
  if (!key) throw new Error("Missing S3 key");

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn });
}

/**
 * 🔹 Signed PUT URL (used for uploads)
 */
export async function getUploadUrl({ key, contentType }) {
  if (!BUCKET) throw new Error("S3_BUCKET_NAME not set");

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3, command, { expiresIn: 60 });
}
