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
  const cover = media[0]; // ✅ normalized, always has .url

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
        {cover && (
          <img
            src={cover.url}
            alt={memory.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 text-white">
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
          <h3 className="mt-1 text-lg font-semibold">
            {memory.title}
          </h3>
        </div>
      </div>
    </motion.button>
  );
}
