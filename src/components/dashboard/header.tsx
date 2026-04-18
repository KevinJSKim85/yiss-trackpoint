"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, RotateCcw } from "lucide-react";
import { YissCrest, YissWordmark } from "@/components/brand/crest";

type HeaderProps = {
  onResetLayout: () => void;
  greetingName?: string;
};

export function DashboardHeader({
  onResetLayout,
  greetingName = "Guardian",
}: HeaderProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setNow(new Date());
    const iv = setInterval(() => setNow(new Date()), 1000 * 15);
    const initial = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setTheme(initial);
    return () => clearInterval(iv);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("yiss-theme", next);
    } catch {}
  };

  const hour = now?.getHours() ?? 8;
  const greeting =
    hour < 5
      ? "Still up,"
      : hour < 12
        ? "Good morning,"
        : hour < 18
          ? "Good afternoon,"
          : "Good evening,";

  const dateStr = now
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(now)
    : "";

  const timeStr = now
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(now)
    : "";

  return (
    <header className="relative border-b border-[color:var(--line)] bg-[color:var(--parchment-soft)]/60 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-5 pb-5 pt-6 md:flex-row md:items-end md:justify-between md:px-8 md:pt-7">
        <div className="flex items-start gap-4">
          <YissCrest size={52} />
          <div className="flex flex-col gap-1.5">
            <YissWordmark />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
              Yongsan International School of Seoul · Est. 1990
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-display text-[1.55rem] leading-none text-ink">
                {greeting}
              </span>
              <span className="font-display text-[1.55rem] leading-none italic text-gold-ink">
                {greetingName}.
              </span>
            </div>
            <p className="text-sm text-ink-muted">
              {dateStr}
              {timeStr && (
                <>
                  <span className="mx-2 text-[color:var(--line-strong)]">·</span>
                  <span className="tabular-nums">{timeStr} KST</span>
                </>
              )}
            </p>
            <p className="mt-1 text-[11px] italic text-ink-muted">
              Drag any panel from its header to rearrange — positions save automatically.
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
