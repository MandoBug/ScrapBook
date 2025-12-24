// src/components/ZigZagTimeline.tsx
import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import type { Memory } from "../types/memory";
import { coverOf, formatDate } from "../types/memory";

type Pt = { x: number; y: number };
type Segment = { p: Pt; cp1: Pt; cp2: Pt; n: Pt };

const THREAD_STAR_DENSITY = 6;

// Build cubic Bezier segments for the zig-zag curve
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

// Evaluate cubic Bezier at t (0..1)
function bezierAt(t: number, p: Pt, c1: Pt, c2: Pt, n: Pt): Pt {
  const mt = 1 - t;
  const x =
    mt * mt * mt * p.x +
    3 * mt * mt * t * c1.x +
    3 * mt * t * t * c2.x +
    t * t * t * n.x;
  const y =
    mt * mt * mt * p.y +
    3 * mt * mt * t * c1.y +
    3 * mt * t * t * c2.y +
    t * t * t * n.y;
  return { x, y };
}

function pathFromSegments(segs: Segment[]): string {
  if (!segs.length) return "";
  let d = `M ${segs[0].p.x} ${segs[0].p.y}`;
  for (const s of segs)
    d += ` C ${s.cp1.x} ${s.cp1.y}, ${s.cp2.x} ${s.cp2.y}, ${s.n.x} ${s.n.y}`;
  return d;
}

function sampleThreadStars(
  segs: Segment[],
  perSegment = THREAD_STAR_DENSITY
) {
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

type TimelineProps = {
  memories: Memory[];
  onOpen: (m: Memory) => void;
};

export default function ZigZagTimeline({ memories, onOpen }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const rafId = useRef<number | null>(null);
  const [pathD, setPathD] = useState("");
  const [height, setHeight] = useState(400);
  const [beads, setBeads] = useState<
    Array<Pt & { delay: number; size: number }>
  >([]);
  const [minH, setMinH] = useState<number>(0);

  const buildPath = () => {
    const container = containerRef.current;
    if (!container) return;
    const crect = container.getBoundingClientRect();
    const baseTop = crect.top + window.scrollY;
    const baseLeft = crect.left + window.scrollX;

    const viewportBottom = window.scrollY + window.innerHeight;
    const minHeightToBottom = Math.max(0, viewportBottom - baseTop - 24);
    setMinH(minHeightToBottom);

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

    const natural = container.scrollHeight;
    setHeight(Math.max(natural, minHeightToBottom));
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
  }, [memories.length]);

  return (
    <div
      ref={containerRef}
      className="relative mt-6"
      style={{ minHeight: minH || undefined }}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-0"
        width="100%"
        height={height}
        style={{ mixBlendMode: "screen" }}
      >
        <defs>
          <linearGradient id="threadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(248,250,252,0.00)" />
            <stop offset="18%" stopColor="rgba(226,232,240,0.55)" />
            <stop offset="50%" stopColor="rgba(191,219,254,0.60)" />
            <stop offset="82%" stopColor="rgba(226,232,240,0.50)" />
            <stop offset="100%" stopColor="rgba(248,250,252,0.00)" />
          </linearGradient>

          <filter id="threadGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={pathD}
          fill="none"
          stroke="rgba(148,163,184,0.45)" // slate-ish
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#threadGlow)"
        />

        <path
          d={pathD}
          fill="none"
          stroke="url(#threadGrad)"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={pathD}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.28}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1000}
          strokeDasharray="4 80"
          className="threadPulse"
        />

        <style>{`
          @keyframes threadDash { to { stroke-dashoffset: -1000; } }
          .threadPulse { animation: threadDash 5.8s linear infinite; }
        `}</style>
      </svg>

      {beads.map((b, i) => (
        <span
          key={`bead-${i}`}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow shadow-sky-200/40 animate-pulse"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            background: "rgba(248,250,252,0.98)", // softer white
            animationDuration: "2.6s",
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      <div className="relative z-10">
        {memories.map((m, i) => {
          const leftSide = i % 2 === 0;
          return (
            <div
              key={m.id}
              className="relative grid md:grid-cols-2 items-center py-6 px-2"
            >
              <div className={leftSide ? "md:pr-10" : "md:col-start-2 md:pl-10"}>
                <TimelineCard
                  memory={m}
                  onOpen={onOpen}
                  side={leftSide ? "left" : "right"}
                  pinRef={(el) => {
                    pinRefs.current[i] = el;
                    schedule();
                  }}
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

type CardProps = {
  memory: Memory;
  onOpen: (m: Memory) => void;
  side: "left" | "right";
  pinRef: (el: HTMLSpanElement | null) => void;
  onImgLoad: () => void;
};

function TimelineCard({
  memory,
  onOpen,
  side,
  pinRef,
  onImgLoad,
}: CardProps) {
  return (
    <motion.button
      onClick={() => onOpen(memory)}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="group relative w-full text-left"
      aria-label={`Open ${memory.title}`}
    >
      {/* Outer shell – simple glass, no neon gradient */}
      <div className="relative rounded-2xl border border-zinc-700/70 bg-zinc-900/85 backdrop-blur-md shadow-md">
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
            {/* soft corner shine */}
            <span
              className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(120px 120px at 15% -25%, rgba(255,255,255,.12), transparent 60%)",
              }}
            />

            {/* invisible geometry pin */}
            <span
              ref={pinRef}
              className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full opacity-0 ${side === "left"
                ? "right-0 translate-x-1/2"
                : "left-0 -translate-x-1/2"
                }`}
            />

            {/* visible glowing pin (softened) */}
            <span
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${side === "left" ? "right-[-10px]" : "left-[-10px]"
                }`}
            >
              <span className="block h-2 w-2 rounded-full bg-sky-100 ring-2 ring-sky-200/40 shadow-[0_0_10px_rgba(148,163,184,0.9)]" />
            </span>
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="text-xs sm:text-sm text-zinc-300 flex items-center gap-2">
              <CalendarDays size={16} /> {formatDate(memory.date)}
              {memory.location && (
                <span className="inline-flex items-center gap-1">
                  • <MapPin size={14} /> {memory.location}
                </span>
              )}
            </div>
            <div className="mt-0.5 font-medium text-zinc-50">
              <span className="bg-gradient-to-r from-zinc-100 via-slate-100 to-zinc-100 bg-clip-text text-transparent">
                {memory.title}
              </span>
            </div>
            {memory.description && (
              <p className="mt-1 text-xs sm:text-sm text-zinc-400 line-clamp-2">
                {memory.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* super subtle texture overlay */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-[.04] mix-blend-soft-light [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.4)_0,rgba(255,255,255,.4)_1px,transparent_1px,transparent_2px)]" />
    </motion.button>
  );
}
