// src/components/TagChip.tsx
type Props = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function TagChip({ label, active, onClick }: Props) {
  const interactive = !!onClick;
  const TagRoot: any = interactive ? "button" : "span";

  return (
    <TagRoot
      onClick={onClick}
      aria-pressed={interactive ? !!active : undefined}
      className={[
        "group relative inline-flex items-center",
        interactive ? "text-sm" : "text-[12px]",
        "rounded-full p-[1.4px]",
        "bg-[conic-gradient(from_130deg_at_50%_50%,rgba(16,185,129,.8),rgba(59,130,246,.7),rgba(147,51,234,.8),rgba(16,185,129,.8))]",
        "[mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]",
        "[mask-composite:exclude]",
        interactive
          ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          : "",
        interactive
          ? "transition-shadow hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]"
          : "",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center gap-1 rounded-full border",
          interactive ? "px-3 py-1" : "px-2.5 py-0.5",
          active
            ? "bg-emerald-500/22 border-white/10"
            : "bg-zinc-900/80 border-white/8",
          "backdrop-blur-md",
          "text-zinc-100",
        ].join(" ")}
      >
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            active ? "bg-emerald-400" : "bg-cyan-300/80",
            "shadow-[0_0_10px_rgba(16,185,129,0.6)]",
            interactive ? "opacity-90 group-hover:opacity-100" : "opacity-80",
            "transition-opacity",
          ].join(" ")}
        />
        <span className="bg-gradient-to-r from-emerald-200 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
          #{label}
        </span>
      </span>
      {interactive && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ boxShadow: "0 0 0 1px rgba(16,185,129,0.18) inset" }}
        />
      )}
    </TagRoot>
  );
}
