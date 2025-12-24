import { useLayoutEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import type { Memory } from "../types/memory";
import { normalizeMedia, formatDate } from "../types/memory";

type Pt = { x: number; y: number };
type Segment = { p: Pt; cp1: Pt; cp2: Pt; n: Pt };

const THREAD_STAR_DENSITY = 6;

// -------- geometry helpers (ORIGINAL CURVATURE) --------
function makeSegments(points: Pt[], curve = 0.45, minPull = 40): Segment[] {
  const segs: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const n = points[i + 1];
    const dx = n.x - p.x;
    const pull = Math.max(minPull, Math.abs(dx) * curve);

    segs.push({
      p,
      cp1: { x: p.x + Math.sign(dx || 1) * pull, y: p.y },
      cp2: { x: n.x - Math.sign(dx || 1) * pull, y: n.y },
      n,
    });
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
  for (const s of segs) {
    d += ` C ${s.cp1.x} ${s.cp1.y}, ${s.cp2.x} ${s.cp2.y}, ${s.n.x} ${s.n.y}`;
  }
  return d;
}

function sampleThreadStars(segs: Segment[]) {
  const beads: Array<Pt & { delay: number; size: number }> = [];
  segs.forEach((s, si) => {
    for (let j = 1; j <= THREAD_STAR_DENSITY; j++) {
      const t = j / (THREAD_STAR_DENSITY + 1);
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

// -------- component --------
type TimelineProps = {
  memories: Memory[];
  onOpen: (m: Memory) => void;
};

export default function ZigZagTimeline({ memories, onOpen }: TimelineProps) {
  const sorted = useMemo(
    () => [...memories].sort((a, b) => b.date.localeCompare(a.date)),
    [memories]
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const rafId = useRef<number | null>(null);

  const [pathD, setPathD] = useState("");
  const [height, setHeight] = useState(400);
  const [beads, setBeads] = useState<
    Array<Pt & { delay: number; size: number }>
  >([]);

  const buildPath = () => {
    const container = containerRef.current;
    if (!container) return;

    const crect = container.getBoundingClientRect();

    const pts: Pt[] = [];
    pinRefs.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      pts.push({
        x: r.left + r.width / 2 - crect.left,
        y: r.top + r.height / 2 - crect.top,
      });
    });

    if (pts.length < 2) return;

    const segs = makeSegments(pts);
    setPathD(pathFromSegments(segs));
    setBeads(sampleThreadStars(segs));
    setHeight(Math.max(container.scrollHeight, 300));
  };

  const schedule = () => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      buildPath();
    });
  };

  useLayoutEffect(() => {
    schedule();
    requestAnimationFrame(schedule);

    const ro = new ResizeObserver(schedule);
    containerRef.current && ro.observe(containerRef.current);
    pinRefs.current.forEach((el) => el && ro.observe(el));

    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [sorted.length]);

  return (
    <div ref={containerRef} className="relative mt-6">
      {/* THREAD - behind cards and fixed position */}
      <svg
        className="pointer-events-none absolute inset-0"
        width="100%"
        height={height}
        style={{ zIndex: 5, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="threadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(248,250,252,0)" />
            <stop offset="50%" stopColor="rgba(191,219,254,0.6)" />
            <stop offset="100%" stopColor="rgba(248,250,252,0)" />
          </linearGradient>
        </defs>

        <path
          d={pathD}
          fill="none"
          stroke="rgba(148,163,184,0.8)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d={pathD}
          fill="none"
          stroke="rgba(191,219,254,0.9)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>

      {/* BEADS - HIDDEN */}
      <div className="absolute inset-0 z-15 pointer-events-none hidden">
        {beads.map((b, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
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
      </div>

      {/* CARDS */}
      <div className="relative" style={{ zIndex: 10 }}>
        {sorted.map((m, i) => {
          const left = i % 2 === 0;
          return (
            <div
              key={m.id}
              className="relative grid md:grid-cols-2 items-center py-6 px-2"
            >
              <div className={left ? "md:pr-10" : "md:col-start-2 md:pl-10"}>
                <TimelineCard
                  memory={m}
                  side={left ? "left" : "right"}
                  onOpen={onOpen}
                  pinRef={(el) => {
                    pinRefs.current[i] = el;
                    schedule();
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------- card --------
function TimelineCard({
  memory,
  side,
  onOpen,
  pinRef,
}: {
  memory: Memory;
  side: "left" | "right";
  onOpen: (m: Memory) => void;
  pinRef: (el: HTMLSpanElement | null) => void;
}) {
  const media = normalizeMedia(memory.photos);
  const cover = media[0];

  return (
    <motion.button
      onClick={() => onOpen(memory)}
      className="group relative w-full text-left"
      whileHover={{ y: -2 }}
    >
      <div className="rounded-2xl border border-zinc-700/70 bg-zinc-900/85 p-3 shadow-md">
        <div className="flex gap-4">
          <div className="relative">
            {cover && (
              <img
                src={cover.url}
                alt={memory.title}
                className="h-20 w-28 rounded-lg object-cover"
              />
            )}

            <span
              ref={pinRef}
              className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 ${
                side === "left"
                  ? "right-0 translate-x-1/2"
                  : "left-0 -translate-x-1/2"
              }`}
              style={{ opacity: 0, pointerEvents: 'none' }}
            />
          </div>

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
            <div className="font-medium text-zinc-50">{memory.title}</div>
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