import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MapPin, Search, X, Grid, LayoutList, Heart, ChevronLeft, ChevronRight, Play } from "lucide-react";

// ---------- Types ----------
type MediaItem = { kind: "image" | "video"; url: string; poster?: string };

// raw media stored on a Memory (string or object)
type RawMedia = string | { url: string; kind?: "image" | "video"; poster?: string };

type Memory = {
  id: string;
  title: string;
  date: string; // ISO
  location?: string;
  tags: string[];
  photos: RawMedia[];   // <-- accept strings or objects
  description?: string;
};

// Best display image for cards (prefer poster, else url, else first string)
const coverOf = (items: RawMedia[] = []): string => {
  const first = items[0];
  if (!first) return "";
  if (typeof first === "string") return first;
  return first.poster || first.url;
};

function normalizeMedia(photos: RawMedia[] = []): MediaItem[] {
  const isVideo = (u: string) => /\.(mp4|webm|ogg|mov|m4v)$/i.test(u);
  return photos.map((p) => {
    if (typeof p === "string") {
      return { kind: isVideo(p) ? "video" : "image", url: p };
    }
    const url = p.url || "";
    const kind: "image" | "video" = p.kind ?? (isVideo(url) ? "video" : "image");
    return { kind, url, poster: p.poster };
  });
}
// ---------- Config ----------
const STAR_COUNT = 600; // star field density
const SHOOTING_STARS = 20; // how many shooting star animations
const THREAD_STAR_DENSITY = 6; // small beads per segment on the thread

const INSIDE_JOKES: string[] = [
  "Tú eres mi cielo",
  "clock itttttt",
  "2/22",
  "that's not the keys!",
  "banger or nah?",
  "AATJ",
  "Embarrassinggggg",
  "And what else",
  "What the flip",
  "USS USS USS USS",
  "IN DA MORNIN WHEN IT WAINS",
  "GRAVYYYYYYYYY",
  " ☆⋆｡°✩",
  "⋆｡°✩",
  " ˖.𖥔 ݁ ˖ ⊹ ࣪ ˖ ",
  " ˖.𖥔 ݁ ˖ ⊹ ࣪ ˖ ",
  "Say Hi Mochi Baby",
  "JINX!!",
  "Big Gulp",
  ""
];

// ---------- Mock Data (replaced later) ----------
const MOCK: Memory[] = [
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

// ---------- Utilities ----------
const formatDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const allTagsFrom = (memories: Memory[]) => [...new Set(memories.flatMap((m) => m.tags))].sort((a, b) => a.localeCompare(b));

type Pt = { x: number; y: number };

type Segment = { p: Pt; cp1: Pt; cp2: Pt; n: Pt };

// Build cubic Bezier segments for the zig-zag curve
function makeSegments(points: Pt[], curve = 0.45, minPull = 40): Segment[] {
  const segs: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const n = points[i + 1];
    const dx = n.x - p.x;
    const pull = Math.max(minPull, Math.abs(dx) * curve); // stronger = wavier
    const cp1: Pt = { x: p.x + Math.sign(dx) * pull, y: p.y };
    const cp2: Pt = { x: n.x - Math.sign(dx) * pull, y: n.y };
    segs.push({ p, cp1, cp2, n });
  }
  return segs;
}

// Evaluate cubic Bezier at t (0..1)
function bezierAt(t: number, p: Pt, c1: Pt, c2: Pt, n: Pt): Pt {
  const mt = 1 - t;
  const x = mt * mt * mt * p.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * n.x;
  const y = mt * mt * mt * p.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * n.y;
  return { x, y };
}

// Build a path string from segments
function pathFromSegments(segs: Segment[]): string {
  if (!segs.length) return "";
  let d = `M ${segs[0].p.x} ${segs[0].p.y}`;
  for (const s of segs) d += ` C ${s.cp1.x} ${s.cp1.y}, ${s.cp2.x} ${s.cp2.y}, ${s.n.x} ${s.n.y}`;
  return d;
}

// Sample small twinkling beads along the segments
function sampleThreadStars(segs: Segment[], perSegment = THREAD_STAR_DENSITY) {
  const beads: Array<Pt & { delay: number; size: number }> = [];
  segs.forEach((s, si) => {
    for (let j = 1; j <= perSegment; j++) {
      const t = j / (perSegment + 1);
      const pt = bezierAt(t, s.p, s.cp1, s.cp2, s.n);
      beads.push({ ...pt, delay: ((si * 0.6 + j * 0.25) % 3), size: 1 + Math.random() * 1.6 });
    }
  });
  return beads;
}

// ===== Moon (crescent) =====
function MoonCrescent() {
  return (
    <>
      {/* Halo (big soft glow behind the moon) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[-22vmin] z-0"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="w-[80vmin] h-[80vmin] rounded-full blur-3xl opacity-85"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.22), rgba(59,130,246,0.22) 35%, rgba(147,51,234,0.18) 60%, transparent 70%)",
            boxShadow:
              "0 0 160px 50px rgba(16,185,129,0.18), 0 0 240px 110px rgba(59,130,246,0.14), 0 0 300px 160px rgba(147,51,234,0.12)",
          }}
        />
      </div>

      {/* Crescent moon (SVG) */}
      <svg
        className="absolute left-1/2 -translate-x-1/2 top-[-14vmin] z-10"
        width="44vmin"
        height="44vmin"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <defs>
          {/* Soft fill */}
          <radialGradient id="cresFill" cx="48%" cy="44%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f4f9f0" />
            <stop offset="78%" stopColor="#e1f3e6" />
            <stop offset="100%" stopColor="#cfe9dc" />
          </radialGradient>

          {/* Glow filter for the rim */}
          <filter id="cresGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Mask to carve the crescent (big circle minus offset circle) */}
          <mask id="cresMask">
            <rect width="100%" height="100%" fill="black" />
            <circle cx="50" cy="50" r="35" fill="white" />
            {/* subtractor circle (shifted toward light source) */}
            <circle cx="62" cy="46" r="35" fill="black" />
          </mask>
        </defs>

        {/* Moon body clipped by crescent mask */}
        <g filter="url(#cresGlow)" mask="url(#cresMask)">
          <circle cx="50" cy="50" r="35" fill="url(#cresFill)" />
          {/* subtle stroke for a clean graphic edge */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.2"
          />
        </g>

        {/* Tiny sparkle stars near the rim */}
        <g opacity="0.8">
          <circle cx="36" cy="22" r="0.9" fill="#fff" />
          <circle cx="30" cy="30" r="0.7" fill="#fff" />
          <circle cx="72" cy="28" r="0.8" fill="#fff" />
        </g>
      </svg>
    </>
  );
}

// ===== Canvas-based Aurora (feathered + non-overlapping ribbons) =====
function AuroraCanvas({
  topVh,
  heightVh,
  intensity,                 // 0..1 from scroll
  ribbonCount = 3,
  blobCount = 8,
  opacity = 1,
  seedKey,
  fadeTop = 0.28,            // ← NEW: top feather (0..1 of canvas height)
  fadeBottom = 0.28,         // ← NEW: bottom feather
  minRibbonGap = 0.12,       // ← NEW: min vertical spacing between ribbons (0..1)
}: {
  topVh: number;
  heightVh: number;
  intensity: number;
  ribbonCount?: number;
  blobCount?: number;
  opacity?: number;
  seedKey?: string | number;
  fadeTop?: number;
  fadeBottom?: number;
  minRibbonGap?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const frame = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  type RibbonSeed = { yNorm: number; amp: number; hue: number; width: number; speed: number; phase: number };
  type BlobSeed   = { xNorm: number; yNorm: number; rNorm: number; hue: number; drift: number; phase: number; squish: number };

  // helper: generate spaced positions in [low, high]
  const spacedPositions = (count: number, minGap: number, low = 0.18, high = 0.86) => {
    const ys: number[] = [];
    let guard = 0;
    while (ys.length < count && guard++ < 400) {
      const y = low + Math.random() * (high - low);
      if (ys.every(v => Math.abs(v - y) >= minGap)) ys.push(y);
    }
    return ys.sort((a, b) => a - b);
  };

  // stable seeds
  const seeds = useMemo(() => {
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const ySlots = spacedPositions(ribbonCount, minRibbonGap);

    const ribbons: RibbonSeed[] = Array.from({ length: ribbonCount }, (_, i) => ({
      yNorm: ySlots[i] ?? 0.5,
      amp: rand(18, 30),
      hue: 150 + rand(-18, 32),
      width: rand(78, 120),
      speed: rand(0.55, 0.95),
      phase: rand(0, Math.PI * 2),
    }));

    const blobs: BlobSeed[] = Array.from({ length: blobCount }, () => ({
      xNorm: rand(-0.05, 1.05),
      yNorm: rand(0.15, 0.9),
      rNorm: rand(0.045, 0.10),
      hue: 155 + rand(-25, 40),
      drift: rand(0.06, 0.18),
      phase: rand(0, Math.PI * 2),
      squish: rand(1.2, 2.0),
    }));

    return { ribbons, blobs };
  }, [ribbonCount, blobCount, minRibbonGap, seedKey]);

  // visibility pause
  useLayoutEffect(() => {
    const check = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setIsVisible(r.bottom > -100 && r.top < innerHeight + 100);
    };
    check();
    const onScroll = () => check();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // fit
  const fit = () => {
    const c = ref.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    c.width = Math.max(1, rect.width | 0);
    c.height = Math.max(1, rect.height | 0);
  };
  useLayoutEffect(() => {
    fit();
    const onResize = () => fit();
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    const c = ref.current;
    if (!c || !isVisible) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let t = 0;
    const TAU = Math.PI * 2;

    const drawRibbon = (baseY: number, amp: number, hue: number, width: number, speed: number, phase: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const w = c.width;
      const wave = (x: number) =>
        baseY +
        Math.sin(x * 0.003 + t * speed + phase) * amp * (0.6 + intensity) +
        Math.cos(x * 0.0016 - t * speed * 0.7 + phase * 0.6) * amp * 0.38;

      ctx.beginPath();
      const x0 = -120;
      ctx.moveTo(x0, wave(x0));
      for (let x = -120; x <= w + 120; x += 8) ctx.lineTo(x, wave(x));

      const grad = ctx.createLinearGradient(0, baseY - width / 2, 0, baseY + width / 2);
      grad.addColorStop(0, `hsla(${hue},90%,75%,0)`);
      grad.addColorStop(0.5, `hsla(${hue},90%,75%,${(0.16 + 0.30 * intensity) * opacity})`); // slightly toned down
      grad.addColorStop(1, `hsla(${hue},90%,75%,0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = width * (0.85 + intensity * 0.45); // a tad slimmer to reduce stacking
      ctx.stroke();
      ctx.restore();
    };

    const drawBlob = (xNorm: number, yNorm: number, rNorm: number, hue: number, drift: number, phase: number, squish: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const cx = xNorm * c.width + Math.sin(t * drift + phase) * (34 + 70 * intensity);
      const cy = yNorm * c.height + Math.cos(t * drift * 0.7 + phase) * (6 + 18 * intensity);
      const r = rNorm * c.height;
      const alpha = (0.05 + 0.12 * intensity) * opacity;

      ctx.translate(cx, cy);
      ctx.scale(squish, 1);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0.0, `hsla(${hue},95%,80%,${alpha})`);
      g.addColorStop(0.6, `hsla(${hue + 12},95%,75%,${alpha * 0.7})`);
      g.addColorStop(1.0, `hsla(${hue},95%,80%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.restore();
    };

    const applyVerticalFeather = () => {
      // soft mask so layers cross-fade instead of stacking
      ctx.save();
      const g = ctx.createLinearGradient(0, 0, 0, c.height);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(Math.max(0.001, fadeTop), "rgba(0,0,0,1)");
      g.addColorStop(Math.min(0.999, 1 - fadeBottom), "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.restore();
    };

    const loop = () => {
      if (!isVisible) return;
      frame.current = requestAnimationFrame(loop);
      t += 0.008 + intensity * 0.012;

      ctx.clearRect(0, 0, c.width, c.height);

      // background glow
      for (const b of seeds.blobs) drawBlob(b.xNorm, b.yNorm, b.rNorm, b.hue, b.drift, b.phase, b.squish);
      // non-overlapping ribbons
      for (const r of seeds.ribbons) {
        const baseY = r.yNorm * c.height;
        drawRibbon(baseY, r.amp * (1 + intensity * 0.8), r.hue, r.width, r.speed, r.phase);
      }

      applyVerticalFeather();
    };

    loop();
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [intensity, isVisible, seeds, opacity, fadeTop, fadeBottom, minRibbonGap]);

  return (
    <canvas
      ref={ref}
      className="absolute left-0 w-full"
      style={{
        top: `${topVh}vh`,
        height: `${heightVh}vh`,
        pointerEvents: "none",
        filter: "saturate(115%) blur(0.7px)",
        opacity: 0.32 + intensity * 0.45,
        mixBlendMode: "screen",
      }}
    />
  );
}

// ===== Starfield wrapper (moon + full-page aurora + stars + shooting stars) =====
function StarField({ jokes = INSIDE_JOKES }: { jokes?: string[] }) {
  // Dynamically size the background to the full document height (in vh)
  const [skyVh, setSkyVh] = useState(280);

  useLayoutEffect(() => {
    const calc = () => {
      const docEl = document.documentElement;
      const body = document.body;
      const docHeight =
        Math.max(
          docEl.scrollHeight, docEl.offsetHeight, docEl.clientHeight,
          body?.scrollHeight ?? 0, body?.offsetHeight ?? 0
        ) || window.innerHeight;

      // Convert px → vh, add a little cushion so we never undershoot
      const vh = (docHeight / window.innerHeight) * 100;
      setSkyVh(Math.max(180, Math.ceil(vh + 10)));
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);
    window.addEventListener("resize", calc);
    window.addEventListener("load", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calc);
      window.removeEventListener("load", calc);
    };
  }, []);

  // Scroll progress drives aurora strength
  const [scrollProg, setScrollProg] = useState(0);
  const raf = useRef<number | null>(null);
  useLayoutEffect(() => {
    const onScroll = () => {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const p = Math.min(1, window.scrollY / (window.innerHeight * 1.8));
        setScrollProg(p);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // === Stars & notes spread across the whole sky ===
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * skyVh,               // NOTE: use dynamic sky height
        size: Math.random() * 2 + 1.2,
        delay: Math.random() * 2,
        blur: Math.random() < 0.15,
      })),
    [skyVh]
  );

  const notes = useMemo(
    () =>
      jokes.map((text, i) => ({
        left: (i * 37.7) % 100,
        top: ((i * 19.3) % Math.max(20, skyVh - 20)) + 10,
        rotate: (i * 23) % 20 - 10,
        delay: (i * 0.37) % 2,
        text,
      })),
    [jokes, skyVh]
  );

  // === Shooting stars (unchanged) ===
  const SHOOTING = Math.max(4, Math.min(10, SHOOTING_STARS));
  const streaks = useMemo(
    () =>
      Array.from({ length: SHOOTING }).map((_, i) => {
        const sign = Math.random() < 0.5 ? -1 : 1;
        const angle = sign * (20 + Math.random() * 55);
        return {
          top: (i * 35 + Math.random() * 50) % Math.max(40, skyVh - 20), // use skyVh
          left: Math.random() * 90 - 5,
          delay: Math.random() * 8,
          duration: 12 + Math.random() * 10,
          angle,
          length: 70 + Math.random() * 90,
        };
      }),
    [skyVh]
  );

  // === Auto-generate aurora layers to cover the whole sky ===
  const layers = useMemo(() => {
    const STEP = 52;     // vertical spacing between bands (vh)
    const H = 64;        // band height (vh)
    const start = 14;    // first band offset from top (vh)
    const out: Array<{
      topVh: number; heightVh: number; ribbonCount: number; blobCount: number;
      opacity: number; fadeTop: number; fadeBottom: number; seedKey: string;
    }> = [];

    // Create bands down the page
    let top = start;
    let i = 0;
    while (top < skyVh + 20) {
      // Vary density gently (deterministic from index)
      const ribbonCount = [2, 3, 1, 0][i % 4];
      const blobCount   = 10 + ((i * 7) % 7);  // 10..16
      const opacity     = 0.78 + ((i * 13) % 5) * 0.03; // ~0.78..0.90
      const fadeTop     = 0.24 + ((i % 3) * 0.04);
      const fadeBottom  = 0.26 + (((i + 1) % 3) * 0.04);

      out.push({
        topVh: top,
        heightVh: H,
        ribbonCount,
        blobCount,
        opacity,
        fadeTop,
        fadeBottom,
        seedKey: `L${i}`,
      });

      top += STEP;
      i += 1;
    }
    return out;
  }, [skyVh]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-visible bg-zinc-950"
      style={{ height: `${skyVh}vh` }} // full-page (and then some) height
    >
      {/* Moon (glow + crescent) */}
      <MoonCrescent />

      {/* Aurora layers across the whole page */}
      {layers.map((L) => (
        <AuroraCanvas
          key={L.seedKey}
          topVh={L.topVh}
          heightVh={L.heightVh}
          intensity={scrollProg}
          ribbonCount={L.ribbonCount}
          blobCount={L.blobCount}
          opacity={L.opacity}
          seedKey={L.seedKey}
          fadeTop={L.fadeTop}
          fadeBottom={L.fadeBottom}
        />
      ))}

      {/* Stars */}
      {stars.map((s, idx) => (
        <span
          key={idx}
          className={`absolute block rounded-full ${s.blur ? "blur-[1px]" : ""}`}
          style={{
            left: `${s.left}vw`,
            top: `${s.top}vh`,
            width: s.size,
            height: s.size,
            background: "rgba(255,255,255,0.95)",
            opacity: 0.9,
            animation: `twinkle 2.4s ease-in-out ${s.delay}s infinite` as any,
          }}
        />
      ))}

      {/* Inside-joke labels */}
      {notes.map((n, idx) => (
        <span
          key={`j-${idx}`}
          className="absolute text-[10px] sm:text-xs md:text-sm italic text-emerald-200/40 select-none"
          style={{
            left: `${n.left}vw`,
            top: `${n.top}vh`,
            transform: `rotate(${n.rotate}deg)`,
            animation: `twinkle 3s ease-in-out ${n.delay}s infinite` as any,
          }}
        >
          {n.text}
        </span>
      ))}

      {/* Shooting stars */}
      {streaks.map((s, idx) => (
        <span
          key={`shoot-${idx}`}
          className="absolute will-change-transform"
          style={{ top: `${s.top}vh`, left: `${s.left}vw`, transform: `rotate(${s.angle}deg)` }}
        >
          <span
            className="block h-[2px] rounded-full bg-gradient-to-r from-white/0 via-white to-white/0"
            style={{
              width: s.length,
              animation: `shootX ${s.duration}s linear ${s.delay}s infinite`,
              filter: "drop-shadow(0 0 6px rgba(255,255,255,.7))",
            }}
          />
        </span>
      ))}

      {/* Keyframes */}
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: .35; } 50% { opacity: .98; } }
        @keyframes shootX {
          0%   { opacity: 0; transform: translateX(-14vmin); }
          6%   { opacity: 1; }
          16%  { opacity: 1; transform: translateX(60vmin); }
          18%  { opacity: 0; }
          100% { opacity: 0; transform: translateX(60vmin); }
        }
      `}</style>
    </div>
  );
}

// ---------- UI Bits ----------
// Cooler gradient-glass hashtag chip (same props/signature)
function TagChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const interactive = !!onClick;
  const TagRoot: any = interactive ? "button" : "span";

  return (
    <TagRoot
      onClick={onClick}
      aria-pressed={interactive ? !!active : undefined}
      className={[
        "group relative inline-flex items-center",
        // compact if non-interactive so modal chips feel lighter
        interactive ? "text-sm" : "text-[12px]",
        "rounded-full p-[1.4px]",
        // static gradient border ring
        "bg-[conic-gradient(from_130deg_at_50%_50%,rgba(16,185,129,.8),rgba(59,130,246,.7),rgba(147,51,234,.8),rgba(16,185,129,.8))]",
        // gradient-as-border mask trick
        "[mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]",
        "[mask-composite:exclude]",
        // cursor & focus
        interactive ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60" : "",
        // hover glow for clickable chips
        interactive ? "transition-shadow hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]" : "",
      ].join(" ")}
    >
      {/* inner glass pill */}
      <span
        className={[
          "inline-flex items-center gap-1 rounded-full border",
          interactive ? "px-3 py-1" : "px-2.5 py-0.5",
          // thicker, more opaque glass
          active
            ? "bg-emerald-500/22 border-white/10"
            : "bg-zinc-900/80 border-white/8",
          "backdrop-blur-md",
          "text-zinc-100",
        ].join(" ")}
      >
        {/* subtle glow dot */}
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            active ? "bg-emerald-400" : "bg-cyan-300/80",
            "shadow-[0_0_10px_rgba(16,185,129,0.6)]",
            interactive ? "opacity-90 group-hover:opacity-100" : "opacity-80",
            "transition-opacity",
          ].join(" ")}
        />
        {/* hashtag text with gentle gradient */}
        <span className="bg-gradient-to-r from-emerald-200 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
          #{label}
        </span>
      </span>

      {/* soft outer ring when hovered/clicked (purely cosmetic) */}
      {interactive && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ boxShadow: "0 0 0 1px rgba(16,185,129,0.18) inset" }}
        />
      )}
    </TagRoot>
  );
}

// Grid card (solid background under image so thread never shows through)
function MemoryCard({ memory, onOpen }: { memory: Memory; onOpen: (m: Memory) => void }) {
  const cover = coverOf(memory.photos); // <-- was memory.photos[0]
  return (
    <motion.button
      layout
      onClick={() => onOpen(memory)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm"
      aria-label={`Open ${memory.title}`}
    >
      {/* Solid bg wrapper so nothing bleeds through */}
      <div className="relative h-56 w-full bg-zinc-900">
        <img src={cover} alt={memory.title} className="absolute inset-0 h-full w-full object-cover" />
        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Hover-reveal */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 p-4 text-white">
          <div className="flex items-center gap-2 text-xs opacity-90">
            <CalendarDays size={16} /> <span>{formatDate(memory.date)}</span>
            {memory.location && (<span className="inline-flex items-center gap-1">• <MapPin size={14} /> {memory.location}</span>)}
          </div>
          <h3 className="mt-1 text-lg font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{memory.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {memory.tags.slice(0, 3).map((t) => (<span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-white/90 text-zinc-900">#{t}</span>))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function MemoryModal({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const media = useMemo(() => normalizeMedia(memory.photos), [memory.photos]);
  const [idx, setIdx] = useState(0);

  const clampIdx = (n: number) => (media.length ? (n + media.length) % media.length : 0);
  const goPrev = () => setIdx((i) => clampIdx(i - 1));
  const goNext = () => setIdx((i) => clampIdx(i + 1));
  const onThumb = (i: number) => setIdx(i);

  // --- NEW: lock background scroll while modal is open (desktop + iOS friendly)
  const restoreYRef = useRef(0);
  useLayoutEffect(() => {
    const body = document.body;
    restoreYRef.current = window.scrollY;

    const { position, top, width, overflow } = body.style;
    body.style.position = "fixed";
    body.style.top = `-${restoreYRef.current}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = position;
      body.style.top = top;
      body.style.width = width;
      body.style.overflow = overflow;
      // restore scroll to where the user was
      window.scrollTo(0, restoreYRef.current);
    };
  }, []);

  // keyboard nav
  useLayoutEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = media[idx];

  return (
    <AnimatePresence>
      {memory && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 overscroll-contain"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          role="dialog" aria-modal="true" aria-label={`${memory.title} media viewer`}
          // prevent wheel/touch from bubbling (extra safety on some browsers)
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-xl"
          >
            {/* close */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70"
              aria-label="Close"
              autoFocus
            >
              <X />
            </button>

            {/* media viewer */}
            <div className="relative bg-black">
              {/* count chip */}
              {media.length > 1 && (
                <span className="absolute left-3 top-3 z-10 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white backdrop-blur">
                  {idx + 1} / {media.length}
                </span>
              )}

              {/* main area */}
              <div className="h-[60vh] sm:h-[68vh] grid place-items-center">
                {current?.kind === "video" ? (
                  <video
                    key={current.url}
                    className="max-h-[60vh] sm:max-h-[68vh] w-full object-contain bg-black"
                    controls
                    preload="metadata"
                    poster={current.poster}
                  >
                    <source src={current.url} />
                  </video>
                ) : (
                  <img
                    key={current?.url}
                    src={current?.url}
                    alt={memory.title}
                    className="max-h-[60vh] sm:max-h-[68vh] w-full object-contain"
                    draggable={false}
                  />
                )}
              </div>

              {/* nav arrows */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur"
                    aria-label="Previous"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur"
                    aria-label="Next"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* meta + thumbs */}
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
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
                <p className="mt-2 leading-relaxed text-zinc-300">{memory.description}</p>
              )}

              {media.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {media.map((m, i) => (
                    <button
                      key={`${m.url}-${i}`}
                      onClick={() => onThumb(i)}
                      className={[
                        "relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border",
                        i === idx ? "border-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,.3)]" : "border-zinc-700",
                      ].join(" ")}
                      aria-label={`Go to media ${i + 1}`}
                    >
                      {m.kind === "video" ? (
                        <>
                          <video className="h-full w-full object-cover" muted playsInline preload="metadata" poster={m.poster}>
                            <source src={m.url} />
                          </video>
                          <span className="absolute inset-0 grid place-items-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                              <Play size={12} /> video
                            </span>
                          </span>
                        </>
                      ) : (
                        <img src={m.url} className="h-full w-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
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
// =====================================================
// ZIG‑ZAG TIMELINE — anchored pins + thread stars
// =====================================================
function ZigZagTimeline({ memories, onOpen }: { memories: Memory[]; onOpen: (m: Memory) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const rafId = useRef<number | null>(null);
  const [pathD, setPathD] = useState("");
  const [height, setHeight] = useState(400);
  const [beads, setBeads] = useState<Array<Pt & { delay: number; size: number }>>([]);
  const [minH, setMinH] = useState<number>(0); // NEW

  const buildPath = () => {
    const container = containerRef.current;
    if (!container) return;
    const crect = container.getBoundingClientRect();
    const baseTop = crect.top + window.scrollY;
    const baseLeft = crect.left + window.scrollX;

    // ensure the wrapper reaches the page bottom
    const viewportBottom = window.scrollY + window.innerHeight;              // NEW
    const minHeightToBottom = Math.max(0, viewportBottom - baseTop - 24);    // NEW (24px bottom breathing room)
    setMinH(minHeightToBottom);                                              // NEW

    const pts: Pt[] = [];
    pinRefs.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2 - baseLeft;
      const y = r.top + r.height / 2 - baseTop;
      pts.push({ x, y });
    });

    const segs = makeSegments(pts, 0.5, 60);
    setPathD(pathFromSegments(segs));
    setBeads(sampleThreadStars(segs));

    // make the SVG tall enough to fill to page bottom even if content is short
    const natural = container.scrollHeight;
    setHeight(Math.max(natural, minHeightToBottom));                         // NEW
  };

  const schedule = () => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      buildPath();
    });
  };

  useLayoutEffect(() => {
    buildPath();
    const ro = new ResizeObserver(schedule);
    if (containerRef.current) ro.observe(containerRef.current);
    pinRefs.current.forEach((el) => el && ro.observe(el));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memories.length]);

  return (
    <div
      ref={containerRef}
      // remove the rounded border “box” and let thread bleed naturally
      className="relative mt-6"                               // CHANGED (no rounded/border/overflow-hidden)
      style={{ minHeight: minH || undefined }}                // NEW: stretch to page bottom
    >
      {/* The emerald thread behind the items */}
<svg
  className="pointer-events-none absolute inset-0 z-0"
  width="100%"
  height={height}
  style={{ mixBlendMode: "screen" }}   // additive look on dark bg
>
  <defs>
    {/* gentle color/opacity along the line */}
    <linearGradient id="threadGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="rgba(16,185,129,0.00)" />
      <stop offset="18%"  stopColor="rgba(16,185,129,0.55)" />
      <stop offset="50%"  stopColor="rgba(59,130,246,0.60)" />
      <stop offset="82%"  stopColor="rgba(16,185,129,0.55)" />
      <stop offset="100%" stopColor="rgba(16,185,129,0.00)" />
    </linearGradient>

    {/* soft halo around the thread */}
    <filter id="threadGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  {/* outer glow (blurred, thicker, semi-transparent) */}
  <path
    d={pathD}
    fill="none"
    stroke="rgba(16,185,129,0.55)"
    strokeWidth={8}
    strokeLinecap="round"
    strokeLinejoin="round"
    filter="url(#threadGlow)"
  />

  {/* crisp core with vertical gradient */}
  <path
    d={pathD}
    fill="none"
    stroke="url(#threadGrad)"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
  />

  {/* faint moving highlight for a “living” feel */}
  <path
    d={pathD}
    fill="none"
    stroke="#ffffff"
    strokeOpacity={0.35}
    strokeWidth={1.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1000}
    strokeDasharray="12 260"
    className="threadPulse"
  />

  <style>{`
    @keyframes threadDash { to { stroke-dashoffset: -1000; } }
    .threadPulse { animation: threadDash 5.8s linear infinite; }
  `}</style>
</svg>

      {/* Little stars (beads) on the thread */}
      {beads.map((b, i) => (
        <span
          key={`bead-${i}`}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow shadow-emerald-400/40 animate-pulse"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            background: "rgba(255,255,255,0.95)",
            animationDuration: "2.6s",
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {/* Items above the thread */}
      <div className="relative z-10">
        {memories.map((m, i) => {
          const leftSide = i % 2 === 0;
          return (
            <div key={m.id} className="relative grid md:grid-cols-2 items-center py-6 px-2">
              <div className={leftSide ? "md:pr-10" : "md:col-start-2 md:pl-10"}>
                <TimelineCard
                  memory={m}
                  onOpen={onOpen}
                  side={leftSide ? "left" : "right"}
                  pinRef={(el) => { pinRefs.current[i] = el; schedule(); }}
                  onImgLoad={schedule}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Glassy timeline card (static gradient border, more opaque)
function TimelineCard({
  memory,
  onOpen,
  side,
  pinRef,
  onImgLoad,
}: {
  memory: Memory;
  onOpen: (m: Memory) => void;
  side: "left" | "right";
  pinRef: (el: HTMLSpanElement | null) => void;
  onImgLoad: () => void;
}) {
  return (
    <motion.button
      onClick={() => onOpen(memory)}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group relative w-full text-left" // note: relative for overlays
      aria-label={`Open ${memory.title}`}
    >
      {/* Static gradient border (no animation) */}
      <div className="relative rounded-2xl p-[1.4px] bg-[conic-gradient(from_140deg_at_50%_50%,rgba(16,185,129,.65),rgba(59,130,246,.55),rgba(147,51,234,.65),rgba(16,185,129,.65))] [mask-composite:exclude] [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]">
        {/* Inner glass (less transparent) */}
        <div className="rounded-2xl border border-white/8 bg-zinc-900/80 backdrop-blur-lg shadow-lg">
          <div className="flex items-center gap-4 p-3">
            {/* Image + pin anchor */}
            <div className="relative">
              <motion.img
                src={coverOf(memory.photos)}
                onLoad={onImgLoad}
                alt={memory.title}
                className="h-20 w-28 rounded-lg object-cover"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
              />
              {/* subtle hover shine */}
              <span
                className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(120px 120px at 20% -30%, rgba(255,255,255,.12), transparent 60%)",
                }}
              />
              {/* invisible geometry pin (for the thread path) */}
              <span
                ref={pinRef}
                className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full opacity-0 ${
                  side === "left" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
                }`}
              />
              {/* visible glowing pin */}
              <span
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
                  side === "left" ? "right-[-10px]" : "left-[-10px]"
                }`}
              >
                <span className="block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse" />
              </span>
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="text-sm text-zinc-300 flex items-center gap-2">
                <CalendarDays size={16} /> {formatDate(memory.date)}
                {memory.location && (
                  <span className="inline-flex items-center gap-1">
                    • <MapPin size={14} /> {memory.location}
                  </span>
                )}
              </div>
              <div className="font-medium text-zinc-50">
                <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent transition-opacity opacity-100">
                  {memory.title}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* soft hover glow ring */}
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow:
              "0 10px 40px -12px rgba(16,185,129,0.25), 0 0 0 1px rgba(16,185,129,0.15) inset",
          }}
        />
      </div>

      {/* super subtle texture */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-[.06] mix-blend-soft-light [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.6)_0,rgba(255,255,255,.6)_1px,transparent_1px,transparent_2px)]" />
    </motion.button>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder = "Search moments, places, vibes…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label
      className={[
        "group relative block rounded-2xl p-[1.6px]",
        // same palette as TagChip (static, no spin)
        "bg-[conic-gradient(from_130deg_at_50%_50%,rgba(16,185,129,.8),rgba(59,130,246,.7),rgba(147,51,234,.8),rgba(16,185,129,.8))]",
        // gradient-as-border
        "[mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]",
        "[mask-composite:exclude]",
        "focus-within:shadow-[0_0_0_2px_rgba(16,185,129,.25)]",
      ].join(" ")}
      aria-label="Search memories"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-zinc-900/85 backdrop-blur-lg px-4 py-3">
        <Search size={18} className="opacity-80" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent placeholder:opacity-60 outline-none text-zinc-100"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/5"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </label>
  );
}
// ---------- Main App ----------
export default function App() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Memory | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const tags = useMemo(() => allTagsFrom(MOCK), []);
  // DESC sort: newest first at top
  const memories = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return MOCK.filter((m) => {
      const matchesQ = !qlc || m.title.toLowerCase().includes(qlc) || m.description?.toLowerCase().includes(qlc) || m.location?.toLowerCase().includes(qlc);
      const matchesTags = selected.size === 0 || m.tags.some((t) => selected.has(t));
      return matchesQ && matchesTags;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [q, selected]);

  const toggleTag = (t: string) => {
    const next = new Set(selected);
    next.has(t) ? next.delete(t) : next.add(t);
    setSelected(next);
  };

  return (
    <div className="relative min-h-screen text-zinc-100">
      {/* Star background sits BEHIND the content */}
      <StarField />

      {/* Main content above stars */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2">
              <Heart className="text-emerald-500" />
              <h1 className="text-lg sm:text-xl font-semibold">Book of Memories</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900">
                {view === "grid" ? (<><LayoutList size={16} /> Timeline</>) : (<><Grid size={16} /> Grid</>)}
              </button>
            </div>
          </div>
        </header>

        {/* Controls */}
<section className="mx-auto max-w-6xl px-3">
  <div className="mt-4 grid gap-3 items-start [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
    <SearchBar value={q} onChange={setQ} />
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <TagChip
          key={t}
          label={t}
          active={selected.has(t)}
          onClick={() => toggleTag(t)}
        />
      ))}
    </div>
  </div>


          {/* Content */}
          {view === "grid" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {memories.map((m) => (<MemoryCard key={m.id} memory={m} onOpen={setActive} />))}
              </AnimatePresence>
            </div>
          ) : (
            <ZigZagTimeline memories={memories} onOpen={setActive} />
          )}

          <footer className="mx-auto max-w-6xl py-10 text-center opacity-70">
            <p className="text-sm">I 💚 you Jadyn!</p>
          </footer>
        </section>
      </div>

      {active && <MemoryModal memory={active} onClose={() => setActive(null)} />}
    </div>
  );
}