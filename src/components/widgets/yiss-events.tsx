"use client";

import useSWR from "swr";
import { Clock, MapPin } from "lucide-react";
import { WidgetShell } from "./widget-shell";
import { formatTime } from "@/lib/utils";

type EventItem = {
  id: string;
  title: string;
  url: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  thumbnail: string | null;
};

type EventsPayload = {
  items: EventItem[];
  count: number;
  error?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function isToday(date: Date, now: Date) {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function YissEventsWidget() {
  const { data, error, isLoading } = useSWR<EventsPayload>(
    "/api/yiss-events",
    fetcher,
    { refreshInterval: 1000 * 60 * 15 },
  );

  const now = new Date();

  return (
    <WidgetShell
      title="Events"
      eyebrow="YISS · CAMPUS CALENDAR"
      accent="gold"
      href="https://www.yisseoul.org/events"
      hrefLabel="All events"
    >
      {isLoading && <Skeleton />}
      {error && (
        <p className="text-sm text-ink-muted">Could not load events.</p>
      )}
      {data && data.items.length === 0 && (
        <div className="flex h-full items-center justify-center px-2 text-center text-sm text-ink-muted">
          No upcoming events — visit yisseoul.org/events
        </div>
      )}
      {data && data.items.length > 0 && (
        <ul className="divide-y divide-[color:var(--line)] overflow-hidden">
          {data.items.slice(0, 3).map((item) => {
            const start = new Date(item.startDate);
            const today = isToday(start, now);
            return (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex gap-3 rounded-lg px-1 py-3 first:pt-0 last:pb-0 transition hover:bg-[color:var(--parchment-soft)]/60 ${
                    today ? "bg-[color:var(--parchment-soft)]" : ""
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border py-1 text-center ${
                      today
                        ? "border-[color:var(--gold)] text-[color:var(--gold-ink)]"
                        : "border-[color:var(--line)] text-ink"
                    }`}
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-wider">
                      {start.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="font-display text-[15px] font-semibold leading-none">
                      {start.getDate()}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="font-display line-clamp-1 text-[13px] font-semibold leading-snug text-ink">
                      {item.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-muted">
                      {item.location && (
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                      )}
                      <span className="inline-flex shrink-0 items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {formatTime(start)}
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetShell>
  );
}

function Skeleton() {
  return (
    <ul className="divide-y divide-[color:var(--line)]">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-[color:var(--line)]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-[color:var(--line)]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[color:var(--line)]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
