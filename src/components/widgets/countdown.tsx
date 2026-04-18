"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { WidgetShell } from "./widget-shell";

type Period = { label: string; start: string; end: string };

const BELL: Period[] = [
  { label: "Period 1", start: "08:00", end: "08:50" },
  { label: "Period 2", start: "08:55", end: "09:45" },
  { label: "Period 3", start: "09:50", end: "10:40" },
  { label: "Break", start: "10:40", end: "10:55" },
  { label: "Period 4", start: "10:55", end: "11:45" },
  { label: "Period 5", start: "11:50", end: "12:40" },
  { label: "Lunch", start: "12:40", end: "13:25" },
  { label: "Period 6", start: "13:25", end: "14:15" },
  { label: "Period 7", start: "14:20", end: "15:10" },
  { label: "Dismissal", start: "15:10", end: "15:30" },
];

function toMinutes(s: string) {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

function fmt(n: number) {
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = n % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CountdownWidget({ editMode }: { editMode?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  if (!now) return <WidgetShell title="Bell Schedule" eyebrow="Today" accent="ink" editMode={editMode}><div /></WidgetShell>;

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  const current = BELL.find(
    (p) => nowMin >= toMinutes(p.start) && nowMin < toMinutes(p.end),
  );
  const upcoming = BELL.find((p) => toMinutes(p.start) > nowMin);

  let activeLabel = "Outside school hours";
  let countdownSec = 0;
  let countdownTo = "";
  let progress = 0;

  if (isWeekend) {
    activeLabel = "Weekend";
    countdownTo = "Enjoy the break.";
  } else if (current) {
    activeLabel = current.label;
    const total = (toMinutes(current.end) - toMinutes(current.start)) * 60;
    const elapsed = (nowMin - toMinutes(current.start)) * 60;
    countdownSec = Math.max(0, Math.round(total - elapsed));
    countdownTo = `until ${current.end}`;
    progress = Math.min(100, (elapsed / total) * 100);
  } else if (upcoming) {
    activeLabel = `Before ${upcoming.label}`;
    countdownSec = Math.max(0, Math.round((toMinutes(upcoming.start) - nowMin) * 60));
    countdownTo = `starts at ${upcoming.start}`;
  }

  return (
    <WidgetShell
      title="Bell Schedule"
      eyebrow="Today"
      accent="ink"
      editMode={editMode}
    >
      <div className="flex h-full flex-col justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {activeLabel}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold tabular-nums leading-none text-ink">
              {isWeekend || !current && !upcoming ? "—" : fmt(countdownSec)}
            </span>
            <Timer className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-1 text-xs text-ink-muted">{countdownTo}</p>
        </div>

        {current && (
          <div>
            <div className="relative h-1 overflow-hidden rounded-full bg-[color:var(--line)]">
              <div
                className="absolute inset-y-0 left-0 bg-[color:var(--gold)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <ol className="space-y-1 text-[11px]">
          {BELL.slice(0, 6).map((p) => {
            const isCurrent = current?.label === p.label;
            const isPast = nowMin >= toMinutes(p.end);
            return (
              <li
                key={p.label}
                className={`flex items-center justify-between rounded px-1.5 py-0.5 ${
                  isCurrent
                    ? "bg-[color:var(--gold)]/10 font-semibold text-ink"
                    : isPast
                      ? "text-ink-muted line-through"
                      : "text-ink-soft"
                }`}
              >
                <span>{p.label}</span>
                <span className="tabular-nums">
                  {p.start}–{p.end}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </WidgetShell>
  );
}
