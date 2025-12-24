// src/types/memory.ts

export type RawMedia =
  | {
      kind: "image";
      s3Key: string;
    }
  | {
      kind: "video";
      s3Key: string;
      posterS3Key?: string;
    };

export type NormalizedMedia = {
  kind: "image" | "video";
  url: string;
  poster?: string;
};

export type Memory = {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  photos: RawMedia[];
};

const S3_BASE =
  "https://mando-scrapbook-gf.s3.us-west-1.amazonaws.com";

/**
 * Convert raw S3 media entries into browser-ready URLs
 */
export function normalizeMedia(
  photos: RawMedia[] | undefined
): NormalizedMedia[] {
  if (!Array.isArray(photos)) return [];

  return photos
    .map((p) => {
      if (p.kind === "image") {
        return {
          kind: "image",
          url: `${S3_BASE}/${p.s3Key}`,
        };
      }

      if (p.kind === "video") {
        return {
          kind: "video",
          url: `${S3_BASE}/${p.s3Key}`,
          poster: p.posterS3Key
            ? `${S3_BASE}/${p.posterS3Key}`
            : undefined,
        };
      }

      return null;
    })
    .filter(Boolean) as NormalizedMedia[];
}

/**
 * Pretty date formatter (used in cards + modal)
 */
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
