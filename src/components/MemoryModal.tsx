// src/components/MemoryModal.tsx
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Play,
  X,
} from "lucide-react";
import type { Memory } from "../types/memory";
import { formatDate, normalizeMedia } from "../types/memory";

type Props = {
  memory: Memory;
  onClose: () => void;
};

export default function MemoryModal({ memory, onClose }: Props) {
  const media = useMemo(() => normalizeMedia(memory.photos), [memory.photos]);
  const [idx, setIdx] = useState(0);

  const clampIdx = (n: number) =>
    media.length ? (n + media.length) % media.length : 0;
  const goPrev = () => setIdx((i) => clampIdx(i - 1));
  const goNext = () => setIdx((i) => clampIdx(i + 1));
  const onThumb = (i: number) => setIdx(i);

  // lock background scroll
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${memory.title} media viewer`}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-xl"
          >
            {/* TOP OVERLAY BAR (counter + close button) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 pt-3">
              {/* counter */}
              {media.length > 1 && (
                <span className="pointer-events-auto rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur">
                  {idx + 1} / {media.length}
                </span>
              )}

              {/* close */}
              <button
                onClick={onClose}
                className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/80"
                aria-label="Close"
                autoFocus
              >
                <X />
              </button>
            </div>

            {/* media viewer */}
            <div className="relative bg-black">
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
              <h2 className="mt-1 text-2xl font-semibold">
                {memory.title}
              </h2>
              {memory.description && (
                <p className="mt-2 leading-relaxed text-zinc-300">
                  {memory.description}
                </p>
              )}

              {media.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {media.map((m, i) => (
                    <button
                      key={`${m.url}-${i}`}
                      onClick={() => onThumb(i)}
                      className={[
                        "relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border",
                        i === idx
                          ? "border-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,.3)]"
                          : "border-zinc-700",
                      ].join(" ")}
                      aria-label={`Go to media ${i + 1}`}
                    >
                      {m.kind === "video" ? (
                        <>
                          <video
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                            poster={m.poster}
                          >
                            <source src={m.url} />
                          </video>
                          <span className="absolute inset-0 grid place-items-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                              <Play size={12} /> video
                            </span>
                          </span>
                        </>
                      ) : (
                        <img
                          src={m.url}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
