// src/data/mockMemories.ts
import type { Memory } from "../types/memory";

// ---------- Mock Data (replace later) ----------
export const MOCK_MEMORIES: Memory[] = [
  {
    id: "m-1",
    title: "First Coffee Together",
    date: "2024-02-18",
    location: "Verve, Santa Cruz",
    tags: ["firsts", "coffee", "cozy"],
    photos: [
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop",
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
      // sample public video (works for testing)
      { url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", kind: "video", poster: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop" },
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1523246191861-0692f0dc4d0d?q=80&w=1600&auto=format&fit=crop",
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
      // another public sample video
      { url: "https://www.w3schools.com/html/mov_bbb.mp4", kind: "video", poster: "https://images.unsplash.com/photo-1526075802221-1b13660334b0?q=80&w=800&auto=format&fit=crop" },
      "https://images.unsplash.com/photo-1520975682038-4f19c1b2cded?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Sunny blanket, strawberries, and a tiny candle that wouldn't stay lit.",
  },
  {
    id: "m-5",
    title: "Rainy Ramen Run",
    date: "2024-11-02",
    location: "Downtown",
    tags: ["food", "rain", "cozy"],
    photos: [
      "https://images.unsplash.com/photo-1542444459-db63c8bbae8e?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1600&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1451976426598-a7593bd6d0b2?q=80&w=1600&auto=format&fit=crop",
    ],
    description: "Windows down, chorus up. You nailed the harmonies.",
  },
];
