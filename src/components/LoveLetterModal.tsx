import { motion } from "framer-motion";

const LETTER_LINES = [
  "Hey love,",
  "",
  "I don’t even really know where to start, because every time I think about you my brain just fills with moments — the quiet ones, the loud ones, the silly ones, the ones that don’t mean much to anyone else but somehow mean everything to me.",
  "",
  "These past months with you have quietly reshaped my heart. You’ve helped me slow down, breathe, and appreciate the little moments instead of rushing past them. Loving you doesn’t feel like something I had to learn — it feels familiar and safe, like something I was always meant to grow into.",
  "",
  "I love the way you laugh when something catches you off guard. I love the little looks we share when we don’t even need words. I love how safe you make me feel just by being you. Even on hard days, knowing I have you makes everything feel lighter.",
  "",
  "This scrapbook is just a small attempt at holding onto all the memories we’ve made so far — and a promise that there are so many more coming. Trips we haven’t taken yet, late nights, random photos, inside jokes no one else would understand.",
  "",
  "Thank you for choosing me. Thank you for loving me the way you do. Thank you for being my person, my comfort, and my favorite part of every day.",
  "",
  "Happy 10 months, my love. I’m so excited for everything that’s still ahead of us.",
];

export default function LoveLetterModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const lineDelay = 0.7; // slower + calmer

  return (
    <>
      {/* 🌙 Dim the starfield behind */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-40 bg-black"
      />

      {/* Modal wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{
            opacity: 0,
            rotateX: -6,
            y: 30,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            rotateX: 0,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="
            relative
            w-full
            max-w-xl
            max-h-[85vh]
            overflow-hidden
            rounded-2xl
            shadow-[0_40px_100px_rgba(0,0,0,0.45)]
            origin-top
          "
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          {/* 🕯 Candle flicker glow */}
          <div className="pointer-events-none absolute inset-0 animate-candleGlow rounded-2xl" />

          {/* 📜 Paper texture */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundColor: "#fdf8f2",
              backgroundImage: `
                radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)
              `,
              backgroundSize: "4px 4px, 7px 7px",
              backgroundPosition: "0 0, 2px 2px",
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-zinc-400 hover:text-zinc-700 transition"
          >
            ✕
          </button>

          {/* Scrollable content */}
          <div className="relative z-10 max-h-[85vh] overflow-y-auto px-8 py-9 sm:px-10 sm:py-11">
            <div className="space-y-4 text-[1.05rem] sm:text-[1.1rem] leading-relaxed text-zinc-800">
              {LETTER_LINES.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * lineDelay,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                >
                  {line || "\u00A0"}
                </motion.p>
              ))}
            </div>

            {/* Signature */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: LETTER_LINES.length * lineDelay + 1.2,
                duration: 1,
              }}
              className="mt-10 text-right text-[1.25rem] sm:text-[1.4rem] text-zinc-700"
            >
              Always yours,
              <br />
              <span className="text-[1.45rem] sm:text-[1.65rem]">
                — Mando 💫
              </span>
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes candleGlow {
          0% {
            box-shadow:
              inset 0 0 70px rgba(255, 190, 120, 0.18),
              inset 0 0 140px rgba(255, 210, 150, 0.12);
          }
          50% {
            box-shadow:
              inset 0 0 95px rgba(255, 190, 120, 0.28),
              inset 0 0 180px rgba(255, 220, 160, 0.18);
          }
          100% {
            box-shadow:
              inset 0 0 70px rgba(255, 190, 120, 0.18),
              inset 0 0 140px rgba(255, 210, 150, 0.12);
          }
        }

        .animate-candleGlow {
          animation: candleGlow 5.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
