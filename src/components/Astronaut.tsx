import { motion } from "framer-motion";

export default function Astronaut({
    onClick,
}: {
    onClick: () => void;
}) {
    return (
        <motion.div
            className="
        group
        fixed
        top-24
        right-10
        z-50
        pointer-events-auto
        cursor-pointer
      "
            animate={{ y: [0, -10, 0] }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            onClick={onClick}
        >
            {/* Astronaut */}
            <img
                src="/supermochi.png"
                alt="Astronaut holding a letter"
                draggable={false}
                className="
          w-28
          opacity-95
          transition-all
          duration-300
          hover:scale-105
          hover:drop-shadow-[0_0_35px_rgba(167,243,208,0.9)]
          drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]
        "
            />

            {/* Tooltip */}
<div
  className="
    absolute
    top-full
    mt-2
    left-1/2
    -translate-x-1/2
    px-3
    py-1
    rounded-md
    text-[11px]
    leading-tight
    text-emerald-200
    bg-zinc-950/90
    border
    border-emerald-400/30
    backdrop-blur
    text-center
    w-[190px]
    opacity-0
    group-hover:opacity-100
    transition-opacity
    pointer-events-none
  "
>
  Pssst. I got something from Mando!
  
  Click me ✉️
</div>


        </motion.div>
    );
}
