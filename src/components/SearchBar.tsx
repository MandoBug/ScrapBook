// src/components/SearchBar.tsx
import { X, Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search memories by title or description…",
}: Props) {
  const hasValue = value.trim().length > 0;

  return (
    <label className="block" aria-label="Search memories">
      <div
        className={[
          "relative rounded-2xl p-[1px]",
          // soft galaxy border
          "bg-gradient-to-r from-emerald-500/35 via-sky-500/30 to-purple-500/35",
          hasValue ? "shadow-[0_0_22px_rgba(56,189,248,0.25)]" : "",
          "transition-shadow",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-700/70 bg-zinc-900/90 px-4 py-3 shadow-sm backdrop-blur-md">
          <Search size={18} className="opacity-75" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent placeholder:text-zinc-500 text-sm sm:text-base outline-none text-zinc-100"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-zinc-800/80 transition-colors"
            >
              <X size={16} className="opacity-75" />
            </button>
          )}
        </div>
      </div>
    </label>
  );
}
