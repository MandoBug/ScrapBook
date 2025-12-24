// server/memoryStore.js
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// path to your JSON file
const DATA_PATH = path.join(__dirname, "data", "memories.json");

export async function loadMemories() {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Error reading memories.json:", err);
    return [];
  }
}

export async function saveMemories(memories) {
  try {
    await writeFile(
      DATA_PATH,
      JSON.stringify(memories, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("Error writing memories.json:", err);
    throw err;
  }
}
