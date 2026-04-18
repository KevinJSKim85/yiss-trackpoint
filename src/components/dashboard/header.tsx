"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, RotateCcw } from "lucide-react";
import { YissCrest, YissWordmark } from "@/components/brand/crest";

type HeaderProps = {
  onResetLayout: () => void;
};

export function DashboardHeader({ onResetLayout }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initial = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("yiss-theme", next);
    } catch {}
  };

  return (
    <header className="relative border-b border-[color:var(--line)] bg-[color:var(--parchment-soft)]/60 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-5 py-3.5 md:px-8">
        <div className="flex items-center gap-3">
          <YissCrest size={40} />
          <div className="flex flex-col gap-0.5">
            <YissWordmark />
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted">
              Yongsan International · Est. 1990
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetLayout}
            className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--porcelain)] px-3.5 py-2 text-xs font-medium text-ink-soft transition hover:border-[color:var(--gold)] hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset layout
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line-strong)] bg-[color:var(--porcelain)] text-ink-soft transition hover:border-[color:var(--gold)] hover:text-ink"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="rule-gold" />
    </header>
  );
}
