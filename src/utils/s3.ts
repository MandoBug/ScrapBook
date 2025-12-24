export function s3Url(key?: string) {
  if (!key) return undefined;
  return `${import.meta.env.VITE_S3_PUBLIC_BASE_URL}/${key}`;
}
