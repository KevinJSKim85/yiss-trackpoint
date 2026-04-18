"use client";

import { Trophy } from "lucide-react";
import { WidgetShell } from "./widget-shell";

const GAMES = [
  {
    sport: "Volleyball (V)",
    opponent: "vs. SIS",
    location: "Home",
    date: "Fri 4/24",
    time: "5:30 pm",
    status: "upcoming",
    result: null as string | null,
  },
  {
    sport: "Basketball (JV)",
    opponent: "@ KIS",
    location: "Away",
    date: "Sat 4/25",
    time: "2:00 pm",
    status: "upcoming",
    result: null,
  },
  {
    sport: "Volleyball (V)",
    opponent: "vs. TCIS",
    location: "Home",
    date: "Wed 4/22",
    time: "—",
    status: "final",
    result: "W 3–1",
  },
  {
    sport: "Cross Country",
    opponent: "KAIAC Invitational",
    location: "Away",
    date: "Mon 4/20",
    time: "—",
    status: "final",
    result: "2nd",
  },
];

export function SportsWidget({ editMode }: { editMode?: boolean }) {
  return (
    <WidgetShell
      title="Guardians Athletics"
      eyebrow="KAIAC · Recent + upcoming"
      accent="crimson"
      href="https://www.kaiac.org/"
      hrefLabel="KAIAC"
      editMode={editMode}
      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-gold">
          <Trophy className="h-3 w-3" />
        </span>
      }
    >
      <ul className="divide-y divide-[color:var(--line)]">
        {GAMES.map((g, i) => (
          <li key={i} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
            <div className="flex w-14 flex-col items-center rounded-md border border-[color:var(--line)] bg-[color:var(--parchment-soft)] py-1 text-center">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">
                {g.date.split(" ")[0]}
              </span>
              <span className="font-display text-[13px] font-semibold leading-none text-ink">
                {g.date.split(" ")[1]}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-ink">
                {g.sport}
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {g.opponent} · {g.location}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {g.status === "final" ? (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${
                    g.result?.startsWith("W")
                      ? "border-[color:var(--sage)] text-[color:var(--sage)]"
                      : "border-[color:var(--line-strong)] text-ink-soft"
                  }`}
                >
                  {g.result}
                </span>
              ) : (
                <span className="text-[11px] tabular-nums text-ink-soft">
                  {g.time}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
