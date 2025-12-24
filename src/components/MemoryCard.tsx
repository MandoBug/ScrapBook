import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import type { Memory } from "../types/memory";
import { formatDate } from "../types/memory";

type Props = {
  memory: Memory;
  onOpen: (m: Memory) => void;
};
function isMediaObject(
  item: any
): item is { kind: "image" | "video"; url: string; poster?: string } {
  return typeof item === "object" && item !== null && "url" in item;
}


export default function MemoryCard({ memory, onOpen }: Props) {
  const rawCover = memory.photos?.[0];
const cover = isMediaObject(rawCover) ? rawCover : null;

const coverSrc =
  cover?.kind === "image"
    ? cover.url
    : cover?.kind === "video"
    ? cover.poster
    : undefined;


  return (
    <motion.button
      layout
      onClick={() => onOpen(memory)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm"
      aria-label={`Open ${memory.title}`}
    >
      <div className="relative h-56 w-full bg-zinc-900">
        {coverSrc && (
          <img
            src={coverSrc}
            alt={memory.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 p-4 text-white">
          <div className="flex items-center gap-2 text-xs opacity-90">
            <CalendarDays size={16} />
            <span>{formatDate(memory.date)}</span>
            {memory.location && (
              <span className="inline-flex items-center gap-1">
                • <MapPin size={14} /> {memory.location}
              </span>
            )}
          </div>

          <h3 className="mt-1 text-lg font-semibold">
            {memory.title}
          </h3>
        </div>
      </div>
    </motion.button>
  );
}
