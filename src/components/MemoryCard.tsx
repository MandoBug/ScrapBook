import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import type { Memory } from "../types/memory";
import { formatDate, normalizeMedia } from "../types/memory";

type Props = {
  memory: Memory;
  onOpen: (m: Memory) => void;
};

export default function MemoryCard({ memory, onOpen }: Props) {
  const media = normalizeMedia(memory.photos);

  // prefer an image cover; otherwise use first item (video poster is already in normalizeMedia)
  const cover =
    media.find((m) => m.kind === "image") ??
    media[0];

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
        {cover?.url && (
          <img
            src={cover.url}
            alt={memory.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
        )}

        {/* ✅ only show overlay on hover like before */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* ✅ pop-up meta on hover */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex items-center gap-2 text-xs opacity-90">
            <CalendarDays size={14} />
            <span>{formatDate(memory.date)}</span>
            {memory.location && (
              <>
                <span>•</span>
                <MapPin size={14} />
                <span>{memory.location}</span>
              </>
            )}
          </div>

          <h3 className="mt-1 text-lg font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
            {memory.title}
          </h3>

          {memory.description && (
            <p className="mt-1 text-xs text-zinc-200/90 line-clamp-2">
              {memory.description}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
