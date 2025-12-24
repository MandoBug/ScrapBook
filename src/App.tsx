// src/App.tsx
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
import AdminPanel from "./components/AdminPanel";

import type { Memory } from "./types/memory";

export default function App() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Memory | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showLetter, setShowLetter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/memories");
        if (!res.ok) throw new Error("API failed");
        const data = (await res.json()) as Memory[];
        setMemories(data);
      } catch {
        setError("Failed to load memories.");
        setMemories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return memories.filter((m) =>
      !qlc
        ? true
        : `${m.title} ${m.description ?? ""} ${m.location ?? ""}`
            .toLowerCase()
            .includes(qlc)
    );
  }, [memories, q]);

  return (
    <div className="relative min-h-screen text-zinc-100">
      <StarField />
      <Astronaut onClick={() => setShowLetter(true)} />

      <div className="relative z-30">
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <img src="/aj.svg" className="h-10 w-10 scale-125" />
              <h1 className="text-lg font-semibold">Book of Memories</h1>
            </div>
            <button
              onClick={() => setView(v => v === "grid" ? "list" : "grid")}
              className="rounded-full border px-3 py-1 text-sm"
            >
              {view === "grid" ? <LayoutList /> : <Grid />}
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-3">
          <SearchBar value={q} onChange={setQ} />

          {loading && <p className="mt-6 text-zinc-400">Loading…</p>}
          {error && <p className="mt-3 text-amber-400">{error}</p>}

          {!loading && filtered.length > 0 && (
            view === "grid" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {filtered.map(m => (
                    <MemoryCard key={m.id} memory={m} onOpen={setActive} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <ZigZagTimeline memories={filtered} onOpen={setActive} />
            )
          )}
        </section>
      </div>

      {active && <MemoryModal memory={active} onClose={() => setActive(null)} />}
      {showLetter && <LoveLetterModal onClose={() => setShowLetter(false)} />}
      <AdminPanel
  memories={memories}
  onCreated={(m) =>
    setMemories((prev) =>
      [...prev, m].sort((a, b) => b.date.localeCompare(a.date))
    )
  }
  onUpdated={(m) =>
    setMemories((prev) =>
      prev
        .map((x) => (x.id === m.id ? m : x))
        .sort((a, b) => b.date.localeCompare(a.date))
    )
  }
  onDeleted={(id) =>
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }
/>

    </div>
  );
}
