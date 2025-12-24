// src/types/memory.ts
export type MediaItem = {
  kind: "image" | "video";
  url: string;
  poster?: string;
};

// raw media stored on a Memory (string or object)
export type RawMedia =
  | string
  | { url: string; kind?: "image" | "video"; poster?: string };

export type Memory = {
  id: string;
  title: string;
  date: string; // ISO
  location?: string;
  tags: string[];
  photos: RawMedia[];
  description?: string;
};

// === helpers ===

// Best display image for cards (prefer poster, else url, else first string)
export const coverOf = (items: RawMedia[] = []): string => {
  const first = items[0];
  if (!first) return "";
  if (typeof first === "string") return first;
  return first.poster || first.url;
};

export function normalizeMedia(photos: RawMedia[] = []): MediaItem[] {
  const isVideo = (u: string) => /\.(mp4|webm|ogg|mov|m4v)$/i.test(u);
  return photos.map((p) => {
    if (typeof p === "string") {
      return { kind: isVideo(p) ? "video" : "image", url: p };
    }
    const url = p.url || "";
    const kind: "image" | "video" =
      p.kind ?? (isVideo(url) ? "video" : "image");
    return { kind, url, poster: p.poster };
  });
}

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const allTagsFrom = (memories: Memory[]) =>
  [...new Set(memories.flatMap((m) => m.tags))].sort((a, b) =>
    a.localeCompare(b)
  );
