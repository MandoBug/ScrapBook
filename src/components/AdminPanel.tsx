import { useEffect, useState } from "react";
import type { Memory } from "../types/memory";

type Props = {
  memories: Memory[];
  onUpdated: (m: Memory) => void;
};

export default function AdminPanel({ memories, onUpdated }: Props) {
  const [show, setShow] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const toggle = () => {
    setShow((s) => !s);
    setError(null);
    setSuccess("");
  };

  // Load selected memory into form
  useEffect(() => {
    if (!selectedId) return;
    const m = memories.find((x) => x.id === selectedId);
    if (!m) return;

    setTitle(m.title || "");
    setDate(m.date || "");
    setLocation(m.location || "");
    setDescription(m.description || "");
  }, [selectedId, memories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    setSaving(true);
    setError(null);
    setSuccess("");

    try {
      const res = await fetch(`/api/memories/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          title,
          date,
          location,
          description,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Update failed");
      }

      const updated: Memory = await res.json();
      onUpdated(updated);
      setSuccess("Updated!");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed top-3 left-3 z-40 text-xs sm:text-sm">
      <button
        onClick={toggle}
        className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:bg-zinc-800"
      >
        {show ? "Close Admin" : "Admin"}
      </button>

      {show && (
        <div className="mt-2 w-80 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              placeholder="Admin key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full rounded bg-zinc-900 px-2 py-1"
            />

            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded bg-zinc-900 px-2 py-1"
            >
              <option value="">Select memory</option>
              {memories.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.date} — {m.title}
                </option>
              ))}
            </select>

            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded bg-zinc-900 px-2 py-1"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded bg-zinc-900 px-2 py-1"
            />

            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded bg-zinc-900 px-2 py-1"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded bg-zinc-900 px-2 py-1"
              rows={2}
            />

            {error && <p className="text-red-400">{error}</p>}
            {success && <p className="text-emerald-400">{success}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded bg-emerald-500 py-1 text-black font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Update Memory"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
