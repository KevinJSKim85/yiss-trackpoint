"use client";

import { CalendarClock, UserCheck } from "lucide-react";
import { WidgetShell } from "./widget-shell";

const STATS = [
  { label: "On-time", value: "98.4%", tone: "good" },
  { label: "Absences", value: "2", tone: "neutral" },
  { label: "Tardies", value: "1", tone: "warn" },
];

export function PowerSchoolWidget({ editMode }: { editMode?: boolean }) {
  return (
    <WidgetShell
      title="PowerSchool"
      eyebrow="Attendance · Schedule"
      accent="ink"
      editMode={editMode}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment-soft)]/60 p-2 text-center"
            >
              <div className="font-display text-lg font-semibold tabular-nums text-ink">
                {s.value}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://yisseoul.powerschool.com/guardian/attendance.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--porcelain)] p-2.5 transition hover:border-[color:var(--gold)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--ink)]/5 text-ink">
              <UserCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-ink">Attendance</p>
              <p className="truncate text-[10.5px] text-ink-muted">
                Guardian portal
              </p>
            </div>
          </a>
          <a
            href="https://yisseoul.powerschool.com/guardian/myschedule.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--porcelain)] p-2.5 transition hover:border-[color:var(--gold)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--ink)]/5 text-ink">
              <CalendarClock className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-ink">Schedule</p>
              <p className="truncate text-[10.5px] text-ink-muted">
                Full term view
              </p>
            </div>
          </a>
        </div>

        <p className="mt-auto text-[10.5px] leading-relaxed text-ink-muted">
          Sign in with your YISS Google account at
          <span className="mx-1 font-mono text-[10.5px] text-ink">
            yisseoul.powerschool.com
          </span>
          to see live data.
        </p>
      </div>
    </WidgetShell>
  );
}
