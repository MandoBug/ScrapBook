// src/components/ZigZagTimeline.tsx
import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import type { Memory } from "../types/memory";
import { normalizeMedia, formatDate } from "../types/memory";

type Pt = { x: number; y: number };
type Segment = { p: Pt; cp1: Pt; cp2: Pt; n: Pt };

const THREAD_STAR_DENSITY = 6;

// ---------------- geometry helpers ----------------
function makeSegments(points: Pt[], curve = 0.45, minPull = 40): Segment[] {
  const segs: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const n = points[i + 1];
    const dx = n.x - p.x;
    const pull = Math.max(minPull, Math.abs(dx) * curve);
    const cp1: Pt = { x: p.x + Math.sign(dx) * pull, y: p.y };
    const cp2: Pt = { x: n.x - Math.sign(dx) * pull, y: n.y };
    segs.push({ p, cp1, cp2, n });
  }
  return segs;
}

function bezierAt(t: number, p: Pt, c1: Pt, c2: Pt, n: Pt): Pt {
  const mt = 1 - t;
  return {
    x:
      mt * mt * mt * p.x +
      3 * mt * mt * t * c1.x +
      3 * mt * t * t * c2.x +
      t * t * t * n.x,
    y:
      mt * mt * mt * p.y +
      3 * mt * mt * t * c1.y +
      3 * mt * t * t * c2.y +
      t * t * t * n.y,
  };
}

function pathFromSegments(segs: Segment[]): string {
  if (!segs.length) return "";
  let d = `M ${segs[0].p.x} ${segs[0].p.y}`;
  for (const s of segs)
    d += ` C ${s.cp1.x} ${s.cp1.y}, ${s.cp2.x} ${s.cp2.y}, ${s.n.x} ${s.n.y}`;
  return d;
}

function sampleThreadStars(segs: Segment[], perSegment = THREAD_STAR_DENSITY) {
  const beads: Array<Pt & { delay: number; size: number }> = [];
  segs.forEach((s, si) => {
    for (let j = 1; j <= perSegment; j++) {
      const t = j / (perSegment + 1);
      const pt = bezierAt(t, s.p, s.cp1, s.cp2, s.n);
      beads.push({
        ...pt,
        delay: ((si * 0.6 + j * 0.25) % 3),
        size: 1 + Math.random() * 1.6,
      });
    }
  });
  return beads;
}

// ---------------- component ----------------
type TimelineProps = {
  memories: Memory[];
  onOpen: (m: Memory) => void;
};

export default function ZigZagTimeline({ memories, onOpen }: TimelineProps) {
  const sorted = [...memories].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const rafId = useRef<number | null>(null);

  const [pathD, setPathD] = useState("");
  const [height, setHeight] = useState(400);
  const [beads, setBeads] = useState<
    Array<Pt & { delay: number; size: number }>
  >([]);
  const [minH, setMinH] = useState(0);

  const buildPath = () => {
    const container = containerRef.current;
    if (!container) return;

    const crect = container.getBoundingClientRect();
    const baseTop = crect.top + window.scrollY;
    const baseLeft = crect.left + window.scrollX;

    const viewportBottom = window.scrollY + window.innerHeight;
    setMinH(Math.max(0, viewportBottom - baseTop - 24));

    const pts: Pt[] = [];
    pinRefs.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      pts.push({
        x: r.left + r.width / 2 - baseLeft,
        y: r.top + r.height / 2 - baseTop,
      });
    });

    const segs = makeSegments(pts, 0.5, 60);
    setPathD(pathFromSegments(segs));
    setBeads(sampleThreadStars(segs));
    setHeight(Math.max(container.scrollHeight, minH));
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
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [sorted.length]);

  return (
    <div ref={containerRef} className="relative mt-6" style={{ minHeight: minH || undefined }}>
      {/* SVG thread */}
      <svg className="pointer-events-none absolute inset-0 z-0" width="100%" height={height}>
        <path d={pathD} fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth={6} />
        <path d={pathD} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1} />
      </svg>

      {beads.map((b, i) => (
        <span
          key={i}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            background: "rgba(248,250,252,0.95)",
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      <div className="relative z-10">
        {sorted.map((m, i) => (
          <TimelineCard
            key={m.id}
            memory={m}
            onOpen={onOpen}
            side={i % 2 === 0 ? "left" : "right"}
            pinRef={(el) => {
              pinRefs.current[i] = el;
              schedule();
            }}
            onImgLoad={schedule}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------- card ----------------
type CardProps = {
  memory: Memory;
  onOpen: (m: Memory) => void;
  side: "left" | "right";
  pinRef: (el: HTMLSpanElement | null) => void;
  onImgLoad: () => void;
};

function TimelineCard({ memory, onOpen, side, pinRef, onImgLoad }: CardProps) {
  const media = normalizeMedia(memory.photos);
  const cover = media[0];

  return (
    <motion.button
      onClick={() => onOpen(memory)}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative w-full text-left py-6 px-2"
    >
      <div className="rounded-2xl border border-zinc-700/70 bg-zinc-900/85 p-3 shadow-md">
        <div className="flex gap-4">
          {cover && (
            <img
              src={cover.url}
              onLoad={onImgLoad}
              alt={memory.title}
              className="h-20 w-28 rounded-lg object-cover"
            />
          )}

          <span
            ref={pinRef}
            className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full opacity-0 ${
              side === "left" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
            }`}
          />

          <div className="flex-1">
            <div className="text-xs text-zinc-300 flex items-center gap-2">
              <CalendarDays size={14} /> {formatDate(memory.date)}
              {memory.location && (
                <>
                  <span>•</span>
                  <MapPin size={14} /> {memory.location}
                </>
              )}
            </div>
            <div className="mt-0.5 font-medium text-zinc-50">
              {memory.title}
            </div>
            {memory.description && (
              <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                {memory.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
