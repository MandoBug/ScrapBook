// src/components/StarField.tsx
import { useLayoutEffect, useMemo, useState } from "react";
import { INSIDE_JOKES } from "../data/insideJokes";

const STAR_COUNT = 600;
const SHOOTING_STARS = 20;

// ===== Moon (crescent) =====
function MoonCrescent() {
  return (
    <svg
      className="absolute left-1/2 -translate-x-1/2 top-[-14vmin] z-10"
      width="44vmin"
      height="44vmin"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <defs>
        <radialGradient id="cresFill" cx="48%" cy="44%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f4f4f4" />
          <stop offset="78%" stopColor="#d9e0e4" />
          <stop offset="100%" stopColor="#c2ccd3" />
        </radialGradient>

        <filter id="cresGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <mask id="cresMask">
          <rect width="100%" height="100%" fill="black" />
          <circle cx="50" cy="50" r="35" fill="white" />
          <circle cx="62" cy="46" r="35" fill="black" />
        </mask>
      </defs>

      <g filter="url(#cresGlow)" mask="url(#cresMask)">
        <circle cx="50" cy="50" r="35" fill="url(#cresFill)" />
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.2"
        />
      </g>

      <g opacity="0.7">
        <circle cx="36" cy="22" r="0.9" fill="#fff" />
        <circle cx="30" cy="30" r="0.7" fill="#fff" />
        <circle cx="72" cy="28" r="0.8" fill="#fff" />
      </g>
    </svg>
  );
}



// ===== Starfield wrapper =====
export default function StarField({ jokes = INSIDE_JOKES }: { jokes?: string[] }) {
  const [skyVh, setSkyVh] = useState(280);

  useLayoutEffect(() => {
    const calc = () => {
      const docEl = document.documentElement;
      const body = document.body;
      const docHeight =
        Math.max(
          docEl.scrollHeight,
          docEl.offsetHeight,
          docEl.clientHeight,
          body?.scrollHeight ?? 0,
          body?.offsetHeight ?? 0
        ) || window.innerHeight;

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

  //const [scrollY, setScrollY] = useState(0);

  useLayoutEffect(() => {
    //const onScroll = () => setScrollY(window.scrollY);
    //window.addEventListener("scroll", onScroll, { passive: true });
    //onScroll();
    //return () => window.removeEventListener("scroll", onScroll);
 }, []);


  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map(() => ({
        left: Math.random() * 100,
        baseTop: Math.random() * 300, // virtual sky depth
        size: Math.random() * 2 + 1.2,
        delay: Math.random() * 2,
        blur: Math.random() < 0.15,
      })),
    [skyVh]
  );

  const notes = useMemo(() => {
  const count = jokes.length;
  const paddingTop = 20;
  const paddingBottom = 20;
  const usableHeight = Math.max(100, skyVh - paddingTop - paddingBottom);

  return jokes.map((text, i) => {
    const progress = i / count; // 0 → 1
    const jitter = (Math.random() - 0.5) * 6; // small randomness

    return {
      left: (i * 60 + Math.random() * 20) % 100,
      top: paddingTop + progress * usableHeight + jitter,
      rotate: Math.random() * 16 - 8,
      delay: Math.random() * 2,
      text,
    };
  });
}, [jokes, skyVh]);


  const SHOOTING = Math.max(4, Math.min(10, SHOOTING_STARS));
  const streaks = useMemo(
    () =>
      Array.from({ length: SHOOTING }).map((_, i) => {
        const sign = Math.random() < 0.5 ? -1 : 1;
        const angle = sign * (20 + Math.random() * 55);
        return {
          top: (i * 35 + Math.random() * 50) % Math.max(40, skyVh - 20),
          left: Math.random() * 90 - 5,
          delay: Math.random() * 8,
          duration: 12 + Math.random() * 10,
          angle,
          length: 70 + Math.random() * 90,
        };
      }),
    [skyVh]
  );

  // === Planets (spread throughout the sky, more hues) ===
  const planets = useMemo(() => {
    const count = 10;
    const baseHues = [200, 150, 280, 35, 330, 210, 190]; // blue, teal, lilac, peach, pink, etc.

    const minTop = 8;
    const maxTop = Math.max(80, skyVh - 12);

    return Array.from({ length: count }).map((_, i) => {
      const leftVW = 5 + (i * 10) + Math.random() * 8;
      const topVH = minTop + (i * (maxTop - minTop) / count) + Math.random() * 15;
      const sizeVMin = 4 + Math.random() * 7;
      const baseHue = baseHues[i % baseHues.length];
      const hue = baseHue + (Math.random() * 16 - 8); // small variation
      const floatDelay = Math.random() * 3;

      return { leftVW, topVH, sizeVMin, hue, floatDelay };
    });
  }, [skyVh]);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-zinc-950"
    >
      <MoonCrescent />

      {/* Planets */}
      {planets.map((p, idx) => (
        <div
          key={`planet-${idx}`}
          className="absolute"
          style={{
            left: `${p.leftVW}vw`,
            top: `${p.topVH}vh`,
          }}
        >
          <div
            className="relative animate-planetFloat"
            style={{
              width: `${p.sizeVMin}vmin`,
              height: `${p.sizeVMin}vmin`,
              animationDelay: `${p.floatDelay}s`,
            }}
          >
            {/* Halo / fog */}
            <div
              className="absolute inset-[-45%] rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle at 40% 30%, hsla(${p.hue},80%,75%,0.55), transparent 68%)`,
                animation: "planetGlow 12s ease-in-out infinite",
              }}
            />

            {/* Planet disc */}
            <div
              className="relative h-full w-full rounded-full overflow-hidden"
              style={{
                boxShadow:
                  "0 0 16px rgba(191,219,254,0.65), 0 0 32px rgba(56,189,248,0.35)",
                background: `radial-gradient(
                  circle at 28% 22%,
                  rgba(255,255,255,0.98),
                  hsla(${p.hue},80%,78%,0.98) 32%,
                  hsla(${p.hue},80%,60%,0.65) 70%,
                  hsla(${p.hue},80%,55%,0.6) 100%
                )`,
              }}
            >
              {/* Highlight */}
              <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-white/45 via-transparent to-black/35 mix-blend-soft-light" />

              {/* Moving cloud band */}
              <div
                className="absolute inset-0 mix-blend-soft-light opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.35), rgba(255,255,255,0.06))",
                  backgroundSize: "220% 100%",
                  animation: "planetClouds 26s linear infinite",
                }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Stars */}
      {stars.map((s, idx) => (
        <span
          key={idx}
          className={`absolute block rounded-full ${s.blur ? "blur-[1px]" : ""}`}
          style={{
            left: `${s.left}vw`,
            top: `${s.baseTop}vh`,
            width: s.size,
            height: s.size,
            background: "rgba(255,255,255,0.95)",
            opacity: 0.9,
            animation: `twinkle 2.4s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Inside jokes */}
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
          style={{
            top: `${s.top}vh`,
            left: `${s.left}vw`,
            transform: `rotate(${s.angle}deg)`,
          }}
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

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: .35; }
          50% { opacity: .98; }
        }

        @keyframes shootX {
          0%   { opacity: 0; transform: translateX(-14vmin); }
          6%   { opacity: 1; }
          16%  { opacity: 1; transform: translateX(60vmin); }
          18%  { opacity: 0; }
          100% { opacity: 0; transform: translateX(60vmin); }
        }

        @keyframes planetFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-6px) translateX(3px) scale(1.03);
          }
        }

        @keyframes planetGlow {
          0%, 100% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.95;
          }
        }

        @keyframes planetClouds {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 220% 50%;
          }
        }

        .animate-planetFloat {
          animation: planetFloat 18s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}