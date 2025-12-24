// src/utils/s3.ts
const BUCKET = "mando-scrapbook-gf";
const REGION = "us-west-1";

export function s3Url(key?: string) {
  if (!key) return "";
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}
