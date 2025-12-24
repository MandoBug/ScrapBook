// server/index.js
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadMemories, saveMemories } from "./memoryStore.js";
import "dotenv/config";
import { getSignedMediaUrl, getUploadUrl } from "./s3.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// body parser for JSON
app.use(express.json());

// simple CORS for local dev (Vite is usually on 5173)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-key");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// serve static files (for media etc.)
app.use(
  "/media",
  express.static(path.join(__dirname, "..", "public", "media"))
);

// ---- API: GET memories (already using this on the frontend) ----
app.get("/api/memories", async (req, res) => {
  try {
    const all = await loadMemories();

    // support both:
    // 1) legacy photos: string or { url, kind?, poster? }
    // 2) S3-based photos: { kind?, s3Key?, posterS3Key? }
    const transformed = await Promise.all(
      all.map(async (m) => {
        const photos = await Promise.all(
          (m.photos ?? []).map(async (p) => {
            // Case 1: string (local path or full URL) -> just return as-is
            if (typeof p === "string") return p;

            // Case 2: has s3Key / posterS3Key
            const { kind, url, poster, s3Key, posterS3Key, ...rest } = p;

            // If no S3 keys, treat as normal { url, poster } object
            if (!s3Key && !posterS3Key) {
              return { kind, url, poster, ...rest };
            }

            const signedUrl = s3Key ? await getSignedMediaUrl(s3Key) : undefined;
            const signedPoster = posterS3Key
              ? await getSignedMediaUrl(posterS3Key)
              : undefined;

            return {
              ...rest,
              ...(kind && { kind }),
              ...(signedUrl && { url: signedUrl }),
              ...(signedPoster && { poster: signedPoster }),
            };
          })
        );

        return { ...m, photos };
      })
    );

    res.json(transformed);
  } catch (err) {
    console.error("Error loading memories:", err);
    res.status(500).json({ error: "Server error loading memories" });
  }
});


// tiny admin “auth”: header x-admin-key must match env var
const ADMIN_KEY = process.env.ADMIN_KEY || "mando-local-secret";

function requireAdmin(req, res, next) {
  const key = req.header("x-admin-key");
  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ---- API: update an existing memory ----
app.put("/api/memories/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const all = await loadMemories();
    const idx = all.findIndex((m) => m.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: "Memory not found" });
    }

    // Only patch allowed fields; keep photos as-is unless explicitly sent
    const { title, date, location, description, photos } = req.body;

    const updated = {
      ...all[idx],
      ...(title !== undefined && { title }),
      ...(date !== undefined && { date }),
      ...(location !== undefined && { location }),
      ...(description !== undefined && { description }),
      ...(photos !== undefined && { photos }),
    };

    all[idx] = updated;
    await saveMemories(all);

    res.json(updated);
  } catch (err) {
    console.error("Error updating memory:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---- API: delete a memory ----
app.delete("/api/memories/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const all = await loadMemories();
    const next = all.filter((m) => m.id !== id);

    if (next.length === all.length) {
      return res.status(404).json({ error: "Memory not found" });
    }

    await saveMemories(next);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting memory:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/upload-url", express.json(), async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({ error: "Missing file info" });
    }

    const safeName = fileName.replace(/\s+/g, "_");

    const key = `I_love_Jadyn/${Date.now()}-${safeName}`;

    const uploadUrl = await getUploadUrl({ key, contentType });

    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("Upload URL error:", err);
    res.status(500).json({ error: "Failed to create upload URL" });
  }
});



app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log(`Admin key (dev): ${ADMIN_KEY}`);
});


console.log("Bucket:", process.env.S3_BUCKET_NAME);

