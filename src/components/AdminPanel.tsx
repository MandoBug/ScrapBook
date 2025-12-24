import { useEffect, useState } from "react";
import type { Memory } from "../types/memory";
import { uploadToS3 } from "../utils/uploadToS3";

type UploadedMedia =
  | { kind: "image"; s3Key: string }
  | { kind: "video"; s3Key: string; posterS3Key?: string };

type Props = {
  memories: Memory[];
  onCreated: (m: Memory) => void;
  onUpdated: (m: Memory) => void;
  onDeleted: (id: string) => void;
};

export default function AdminPanel({
  memories,
  onCreated,
  onUpdated,
  onDeleted,
}: Props) {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [adminKey, setAdminKey] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const toggle = () => {
    setShow((s) => !s);
    setError(null);
    setSuccess("");
  };

  // preload fields when editing
  useEffect(() => {
    if (mode !== "edit" || !selectedId) return;

    const m = memories.find((x) => x.id === selectedId);
    if (!m) return;

    setTitle(m.title || "");
    setDate(m.date || "");
    setLocation(m.location || "");
    setDescription(m.description || "");
    setUploadedMedia([]);
  }, [mode, selectedId, memories]);

  // reset on create
  useEffect(() => {
    if (mode === "create") {
      setSelectedId("");
      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");
      setUploadedMedia([]);
      setError(null);
      setSuccess("");
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    setSaving(true);

    try {
      const isEdit = mode === "edit" && selectedId;
      const baseUrl = "http://localhost:4000/api/memories";

      const body: any = {
        title,
        date,
        location,
        description,
      };

      let url = baseUrl;
      let method: "POST" | "PUT" = "POST";

      if (isEdit) {
        url = `${baseUrl}/${selectedId}`;
        method = "PUT";
      } else {
        if (!title || !date || uploadedMedia.length === 0) {
          throw new Error(
            uploading
              ? "Please wait for uploads to finish."
              : "Title, date, and at least one photo/video are required."
          );
        }
        body.photos = uploadedMedia;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Request failed");
      }

      const memory: Memory = await res.json();

      if (isEdit) {
        onUpdated(memory);
        setSuccess("Updated!");
      } else {
        onCreated(memory);
        setSuccess("Created!");
        setTitle("");
        setDate("");
        setLocation("");
        setDescription("");
        setUploadedMedia([]);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this memory?")) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/memories/${selectedId}`,
        {
          method: "DELETE",
          headers: { "x-admin-key": adminKey },
        }
      );

      if (!res.ok && res.status !== 204) {
        throw new Error("Delete failed");
      }

      onDeleted(selectedId);
      setSuccess("Deleted.");
      setSelectedId("");
      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("create")}
                className={`flex-1 rounded px-2 py-1 ${
                  mode === "create"
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800"
                }`}
              >
                New
              </button>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`flex-1 rounded px-2 py-1 ${
                  mode === "edit"
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800"
                }`}
              >
                Edit
              </button>
            </div>

            {mode === "edit" && (
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
            )}

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

            {mode === "create" && (
              <>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={async (e) => {
                    if (!e.target.files) return;

                    const files = Array.from(e.target.files);
                    setUploading(true);

                    try {
                      for (const file of files) {
                        const { key } = await uploadToS3(file);

                        setUploadedMedia((prev) => [
                          ...prev,
                          {
                            kind: file.type.startsWith("video")
                              ? "video"
                              : "image",
                            s3Key: key,
                          },
                        ]);
                      }
                    } catch {
                      alert("Upload failed");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />

                {uploadedMedia.length > 0 && (
                  <ul className="text-[10px] text-zinc-400">
                    {uploadedMedia.map((m, i) => (
                      <li key={i}>
                        {m.kind} — {m.s3Key}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {error && <p className="text-red-400">{error}</p>}
            {success && <p className="text-emerald-400">{success}</p>}

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full rounded bg-emerald-500 py-1 text-black font-semibold disabled:opacity-50"
            >
              {uploading
                ? "Uploading…"
                : saving
                ? "Saving…"
                : mode === "edit"
                ? "Update"
                : "Create Memory"}
            </button>

            {mode === "edit" && selectedId && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full rounded bg-red-500 py-1 text-white"
              >
                Delete
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
