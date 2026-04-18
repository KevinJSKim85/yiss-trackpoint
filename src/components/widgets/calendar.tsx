"use client";

import { Calendar, MapPin, Video } from "lucide-react";
import { WidgetShell } from "./widget-shell";

const EVENTS = [
  {
    start: "08:00",
    end: "08:50",
    title: "AP Biology — Chapter 14 quiz",
    where: "Room 304",
    color: "#9a2b2b",
    virtual: false,
  },
  {
    start: "10:55",
    end: "11:45",
    title: "NHS council meeting",
    where: "Library mezzanine",
    color: "#b8923a",
    virtual: false,
  },
  {
    start: "13:25",
    end: "14:15",
    title: "AP Lit — Beloved seminar",
    where: "Room 212",
    color: "#0b1e3f",
    virtual: false,
  },
  {
    start: "16:30",
    end: "17:30",
    title: "Volleyball practice",
    where: "Main gym",
    color: "#5d7a5a",
    virtual: false,
  },
  {
    start: "19:00",
    end: "20:00",
    title: "Violin lesson with Mr. Choi",
    where: "Zoom",
    color: "#6b1d3d",
    virtual: true,
  },
];

export function CalendarWidget() {
  const today = new Date();
  const dow = today.toLocaleDateString("en-US", { weekday: "short" });
  const day = today.getDate();

  return (
    <WidgetShell
      title="Today's schedule"
      eyebrow="Google Calendar"
      accent="ink"
      href="https://calendar.google.com"
      hrefLabel="Calendar"

      headerExtra={
        <div className="flex flex-col items-center rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment-soft)] px-2 py-1 leading-none">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">
            {dow}
          </span>
          <span className="font-display text-sm font-semibold tabular-nums text-ink">
            {day}
          </span>
        </div>
      }
    >
      <ul className="space-y-2.5 text-[12.5px]">
        {EVENTS.map((e) => (
          <li key={e.title} className="flex gap-2.5">
            <div className="flex flex-col items-end pt-0.5 text-[10.5px] font-medium tabular-nums text-ink-muted">
              <span>{e.start}</span>
              <span className="text-[9.5px]">{e.end}</span>
            </div>
            <div
              className="w-[3px] shrink-0 rounded-full"
              style={{ background: e.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{e.title}</p>
              <p className="flex items-center gap-1 truncate text-[11px] text-ink-muted">
                {e.virtual ? (
                  <Video className="h-3 w-3" />
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                {e.where}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-1.5 border-t border-[color:var(--line)] pt-2 text-[11px] text-ink-muted">
        <Calendar className="h-3 w-3" />
        <span>5 events · 3h of class</span>
      </div>
    </WidgetShell>
  );
}
