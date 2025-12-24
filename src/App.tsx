// src/App.tsx
import AdminPanel from "./components/AdminPanel";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Grid, LayoutList } from "lucide-react";

import StarField from "./components/StarField";
import Astronaut from "./components/Astronaut";
import SearchBar from "./components/SearchBar";
import MemoryCard from "./components/MemoryCard";
import MemoryModal from "./components/MemoryModal";
import ZigZagTimeline from "./components/ZigZagTimeline";
import LoveLetterModal from "./components/LoveLetterModal";

import type { Memory } from "./types/memory";
import { MOCK_MEMORIES } from "./data/mockMemories";

export default function App() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Memory | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showLetter, setShowLetter] = useState(false);

  const handleMemoryCreated = (m: Memory) => {
    setMemories((prev) =>
      [...prev, m].sort((a, b) => b.date.localeCompare(a.date))
    );
  };

  const handleMemoryUpdated = (m: Memory) => {
    setMemories((prev) =>
      prev
        .map((x) => (x.id === m.id ? m : x))
        .sort((a, b) => b.date.localeCompare(a.date))
    );
  };

  const handleMemoryDeleted = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch memories from API on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/memories");
        if (!res.ok) throw new Error("Failed to load memories from API");

        const data = (await res.json()) as Memory[];

        if (!Array.isArray(data) || data.length === 0) {
          setMemories(MOCK_MEMORIES);
        } else {
          setMemories(data);
        }
      } catch (err) {
        setError("Could not load memories from the server. Using local data.");
        setMemories(MOCK_MEMORIES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return memories
      .filter((m) => {
        if (!qlc) return true;
        const text =
          (m.title ?? "") +
          " " +
          (m.description ?? "") +
          " " +
          (m.location ?? "");
        return text.toLowerCase().includes(qlc);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [memories, q]);

  return (
    <div className="relative min-h-screen text-zinc-100">
      {/* Background */}
      <StarField />

      {/* Easter egg astronaut */}
      <Astronaut onClick={() => setShowLetter(true)} />

      {/* Foreground UI */}
      <div className="relative z-30">
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2">
              <img
                src="/aj.svg"
                alt="A & J"
                className="
                  h-10 w-10
                  rounded-full
                  object-contain
                  scale-[1.3]
                  origin-left
                  drop-shadow-[0_0_8px_rgba(167,243,208,0.6)]
                "
              />
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Book of Memories
              </h1>
            </div>

            <button
              onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-950/60 px-3 py-1.5 text-xs sm:text-sm text-zinc-300 hover:bg-zinc-900/80 transition"
            >
              {view === "grid" ? (
                <>
                  <LayoutList size={16} />
                  Timeline
                </>
              ) : (
                <>
                  <Grid size={16} />
                  Grid
                </>
              )}
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-3">
          <div className="mt-4">
            <SearchBar value={q} onChange={setQ} />
          </div>

          {loading && (
            <p className="mt-6 text-sm text-zinc-400">Loading memories…</p>
          )}

          {!loading && error && (
            <p className="mt-3 text-sm text-amber-400">{error}</p>
          )}

          {!loading && filtered.length > 0 && (
            <>
              {view === "grid" ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((m) => (
                      <MemoryCard key={m.id} memory={m} onOpen={setActive} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <ZigZagTimeline memories={filtered} onOpen={setActive} />
              )}
            </>
          )}

          <footer className="py-10 text-center opacity-70">
            <p className="text-sm">This is just the beginning. I 💚 you Jadyn!</p>
          </footer>
        </section>
      </div>

      {active && (
        <MemoryModal memory={active} onClose={() => setActive(null)} />
      )}

      {showLetter && (
        <LoveLetterModal onClose={() => setShowLetter(false)} />
      )}

      <AdminPanel
        memories={memories}
        onCreated={handleMemoryCreated}
        onUpdated={handleMemoryUpdated}
        onDeleted={handleMemoryDeleted}
      />
    </div>
  );
}
