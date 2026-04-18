"use client";

import { Users } from "lucide-react";
import { WidgetShell } from "./widget-shell";

const MEETINGS = [
  { club: "NHS", day: "Mon", time: "3:30 pm", where: "Library mezz" },
  { club: "Model UN", day: "Tue", time: "3:45 pm", where: "Room 212" },
  { club: "YISS Press", day: "Wed", time: "3:30 pm", where: "Newsroom" },
  { club: "Debate", day: "Thu", time: "3:45 pm", where: "Room 304" },
  { club: "Key Club", day: "Fri", time: "Lunch", where: "Commons" },
];

export function ClubsWidget({ editMode }: { editMode?: boolean }) {
  return (
    <WidgetShell
      title="Club meetings"
      eyebrow="From Gmail invites"
      accent="gold"
      editMode={editMode}
      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-ink-muted">
          <Users className="h-3 w-3" />
        </span>
      }
    >
      <ul className="space-y-1.5">
        {MEETINGS.map((m) => (
          <li
            key={m.club}
            className="flex items-center gap-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment-soft)]/50 px-2.5 py-1.5"
          >
            <span className="flex w-10 flex-col items-center rounded-md border border-[color:var(--line)] bg-[color:var(--porcelain)] py-0.5 text-center leading-tight">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">
                {m.day}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-ink">
                {m.club}
              </p>
              <p className="truncate text-[10.5px] text-ink-muted">
                {m.time} · {m.where}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
