import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MapPin, Search, X, Grid as GridIcon, LayoutList, Heart } from "lucide-react";

/**
 * ================================
 *  SCRAPBOOK APP (React + TS)
 *  — Teaching version with comments —
 * ================================
 * What this file includes:
 *  1) Types + mock data so the UI looks real immediately
 *  2) A starry-night background with twinkling stars
 *     + scattered "inside jokes" you can customize
 *  3) Grid view (cards) with hover-reveal metadata animation
 *  4) Timeline view (a vertical "string" that connects events)
 *  5) Search + tag filter
 *
 * How to use:
 *  - Replace your src/App.tsx contents with this file.
 *  - Put your own photos/notes into the MOCK array below.
 *  - Add your inside jokes to the INSIDE_JOKES array.
 *
 * Styling notes:
 *  - Accent color switched to emerald (your favorite green 💚)
 *  - Dark-mode friendly by default
 */

// ---------- Types ----------
// "Memory" is the shape of one scrapbook entry (card / timeline item)
type Memory = {
  id: string;
  title: string;
  date: string; // ISO "2024-07-16"
  location?: string;
  tags: string[];
  photos: string[]; // first image is used as the cover
  description?: string;
};

// ---------- Configuration you can tweak ----------
const STAR_COUNT = 100; // how many stars to render in the background
const INSIDE_JOKES: string[] = [
  // Add your own short inside jokes or phrases here.
  // They'll appear sprinkled across the sky with a gentle twinkle.
  "te amo 3000",
  "ramen weather crew",
  "our secret bench",
  "left lane DJ",
  "the latte art laugh",
];

// ---------- Mock Data ----------
// Replace these with your own memories when you're ready.
const MOCK: Memory[] = [
  {
    id: "m-1",
    title: "First Coffee Together",
    date: "2024-02-18",
    location: "Verve, Santa Cruz",
    tags: ["firsts", "coffee", "cozy"],
    photos: [
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Our first coffee date — your laugh over the latte art was everything.",
  },
  {
    id: "m-2",
    title: "Boardwalk Sunset",
    date: "2024-04-07",
    location: "Santa Cruz Beach Boardwalk",
    tags: ["sunset", "boardwalk", "walks"],
    photos: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Windswept hair, sand in shoes, zero regrets.",
  },
  {
    id: "m-3",
    title: "Study Date Win",
    date: "2024-05-12",
    location: "Science Library",
    tags: ["wins", "school", "late-night"],
    photos: [
      "https://images.unsplash.com/photo-1460518451285-97b6aa326961?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "You quizzed me, I aced the problem set. Teamwork.",
  },
  {
    id: "m-4",
    title: "Birthday Picnic",
    date: "2024-07-16",
    location: "Arboretum",
    tags: ["birthday", "picnic", "flowers"],
    photos: [
      "https://images.unsplash.com/photo-1526075802221-1b13660334b0?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Sunny blanket, strawberries, and a tiny candle that wouldn’t stay lit.",
  },
  {
    id: "m-5",
    title: "Rainy Ramen Run",
    date: "2024-11-02",
    location: "Downtown",
    tags: ["food", "rain", "cozy"],
    photos: [
      "https://images.unsplash.com/photo-1542444459-db63c8bbae8e?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Shared umbrella and shared noodles — peak romance.",
  },
  {
    id: "m-6",
    title: "Roadtrip Playlist",
    date: "2025-03-29",
    location: "Highway 1",
    tags: ["music", "roadtrip", "views"],
    photos: [
      "https://images.unsplash.com/photo-1508264165352-258a6ccde22a?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Windows down, chorus up. You nailed the harmonies.",
  },
];

// ---------- Small utilities ----------
// Human-friendly dates like "Jul 16, 2024"
const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Collect unique tags (for the filter chips)
const allTagsFrom = (memories: Memory[]) =>
  [...new Set(memories.flatMap((m) => m.tags))].sort((a, b) => a.localeCompare(b));

// ---------- Decorative: Starry background ----------
// A fixed, click-through layer with twinkling dots + inside-joke labels.
function StarField({ jokes = INSIDE_JOKES }: { jokes?: string[] }) {
  // Build a deterministic-ish set of random positions for stars.
  const stars = useMemo(() => {
    const arr = Array.from({ length: STAR_COUNT }).map(() => ({
      left: Math.random() * 100, // vw
      top: Math.random() * 200, // vh (taller so you can scroll)
      size: Math.random() * 2 + 1, // px
      delay: Math.random() * 2, // seconds
    }));
    return arr;
  }, []);

  const notes = useMemo(() => {
    return jokes.map((text, i) => ({
      left: (i * 37.7) % 100, // spread roughly
      top: ((i * 19.3) % 160) + 10, // avoid very top
      rotate: (i * 23) % 20 - 10, // -10..+10 deg
      delay: (i * 0.37) % 2,
      text,
    }));
  }, [jokes]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Star dots */}
      {stars.map((s, idx) => (
        <span
          key={idx}
          className="absolute block rounded-full bg-white/80 dark:bg-white/70 opacity-80 animate-pulse"
          style={{
            left: `${s.left}vw`,
            top: `${s.top}vh`,
            width: s.size,
            height: s.size,
            animationDuration: "2.4s",
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Inside-joke labels */}
      {notes.map((n, idx) => (
        <span
          key={`j-${idx}`}
          className="absolute text-[10px] sm:text-xs md:text-sm italic text-emerald-300/50 select-none animate-pulse"
          style={{
            left: `${n.left}vw`,
            top: `${n.top}vh`,
            transform: `rotate(${n.rotate}deg)`,
            animationDuration: "3s",
            animationDelay: `${n.delay}s`,
          }}
        >
          {n.text}
        </span>
      ))}
    </div>
  );
}

// ---------- UI Bits ----------
// Reusable tag chip. Active chips use emerald accents.
function TagChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm transition shadow-sm hover:shadow ${
        active
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white/80 dark:bg-zinc-800/60 backdrop-blur border-zinc-300 dark:border-zinc-700"
      }`}
    >
      #{label}
    </button>
  );
}

// One card in the grid view
function MemoryCard({ memory, onOpen }: { memory: Memory; onOpen: (m: Memory) => void }) {
  const cover = memory.photos[0];
  return (
    <motion.button
      layout
      onClick={() => onOpen(memory)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
      aria-label={`Open ${memory.title}`}
    >
      {/* Cover image */}
      <img src={cover} alt={memory.title} className="h-56 w-full object-cover" />

      {/* Dark gradient for contrast on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Hover-reveal metadata (title/date/location) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 p-4 text-white">
        <div className="flex items-center gap-2 text-xs opacity-90">
          <CalendarDays size={16} /> <span>{formatDate(memory.date)}</span>
          {memory.location && (
            <span className="inline-flex items-center gap-1">
              • <MapPin size={14} /> {memory.location}
            </span>
          )}
        </div>
        <h3 className="mt-1 text-lg font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{memory.title}</h3>
        {/* Keep hashtags for now but subtle */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {memory.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-white/90 text-zinc-900">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

// Fullscreen modal/lightbox for one memory
function MemoryModal({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const cover = memory.photos[0];
  return (
    <AnimatePresence>
      {memory && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70"
              aria-label="Close"
            >
              <X />
            </button>
            <img src={cover} alt={memory.title} className="h-72 w-full object-cover" />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CalendarDays size={16} /> {formatDate(memory.date)}
                {memory.location && (
                  <>
                    <span>•</span>
                    <MapPin size={16} /> {memory.location}
                  </>
                )}
              </div>
              <h2 className="mt-1 text-2xl font-semibold">{memory.title}</h2>
              {memory.description && (
                <p className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-300">{memory.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {memory.tags.map((t) => (
                  <TagChip key={t} label={t} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Timeline list item with a connecting "string"
function TimelineItem({ memory, onOpen }: { memory: Memory; onOpen: (m: Memory) => void }) {
  return (
    <button
      onClick={() => onOpen(memory)}
      className="relative flex w-full items-center gap-4 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900"
      aria-label={`Open ${memory.title}`}
    >
      {/* Dot on the string */}
      <span className="absolute left-8 top-6 h-3 w-3 -translate-x-1/2 rounded-full bg-emerald-500 shadow shadow-emerald-500/30" />
      {/* Content */}
      <img src={memory.photos[0]} className="h-20 w-28 rounded-xl object-cover" />
      <div className="flex-1">
        <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
          <CalendarDays size={16} /> {formatDate(memory.date)}
          {memory.location && (
            <span className="inline-flex items-center gap-1">
              • <MapPin size={14} /> {memory.location}
            </span>
          )}
        </div>
        <div className="font-medium">{memory.title}</div>
        {/* Optional hashtags remain subtle */}
        <div className="mt-1 flex flex-wrap gap-1.5">
          {memory.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ---------- Main App ----------
export default function App() {
  // Local UI state
  const [q, setQ] = useState(""); // search query
  const [selected, setSelected] = useState<Set<string>>(new Set()); // active tag filters
  const [active, setActive] = useState<Memory | null>(null); // modal memory
  const [view, setView] = useState<"grid" | "list">("grid"); // current layout

  // Derived data: available tag list, filtered memories sorted by date (newest first)
  const tags = useMemo(() => allTagsFrom(MOCK), []);
  const memories = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return MOCK.filter((m) => {
      const matchesQ =
        !qlc ||
        m.title.toLowerCase().includes(qlc) ||
        m.description?.toLowerCase().includes(qlc) ||
        m.location?.toLowerCase().includes(qlc);
      const matchesTags = selected.size === 0 || m.tags.some((t) => selected.has(t));
      return matchesQ && matchesTags;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [q, selected]);

  // Toggle a tag in the active set
  const toggleTag = (t: string) => {
    const next = new Set(selected);
    next.has(t) ? next.delete(t) : next.add(t);
    setSelected(next);
  };

  return (
    // Relative wrapper so the StarField sits behind everything
    <div className="relative min-h-screen text-zinc-100 bg-zinc-950">
      {/* Decorative: stars & inside jokes */}
      <StarField />

      {/* Main content (z-10 so it's above the stars) */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2">
              <Heart className="text-emerald-500" />
              <h1 className="text-lg sm:text-xl font-semibold">Our Scrapbook</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900"
              >
                {view === "grid" ? (
                  <>
                    <LayoutList size={16} /> Timeline
                  </>
                ) : (
                  <>
                    <GridIcon size={16} /> Grid
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Controls */}
        <section className="mx-auto max-w-6xl px-3">
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            {/* Search input */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2">
              <Search size={18} className="opacity-60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search moments, places, vibes…"
                className="w-full bg-transparent outline-none placeholder:opacity-60"
              />
            </div>

            {/* Tag filters (keep, but subtle) */}
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <TagChip key={t} label={t} active={selected.has(t)} onClick={() => toggleTag(t)} />
              ))}
            </div>
          </div>

          {/* Content */}
          {view === "grid" ? (
            // ===== GRID VIEW =====
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {memories.map((m) => (
                  <MemoryCard key={m.id} memory={m} onOpen={setActive} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            // ===== TIMELINE VIEW (with connecting string) =====
            <div className="relative mt-6 rounded-2xl border border-zinc-800 overflow-hidden">
              {/* The vertical connecting string */}
              <div className="pointer-events-none absolute left-8 top-0 bottom-0 w-px bg-emerald-600/30" />

              <div className="divide-y divide-zinc-800">
                {memories.map((m) => (
                  <TimelineItem key={m.id} memory={m} onOpen={setActive} />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mx-auto max-w-6xl py-10 text-center opacity-70">
            <p className="text-sm">Built with 💚 — make her smile.</p>
          </footer>
        </section>
      </div>

      {/* Modal lives at top level so it overlays everything */}
      {active && <MemoryModal memory={active} onClose={() => setActive(null)} />}
    </div>
  );
}
