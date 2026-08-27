"use client";

import useSWR from "swr";
import { Trophy } from "lucide-react";
import { WidgetShell } from "./widget-shell";
import { relativeTime } from "@/lib/utils";

type Kind = "recap" | "schedule" | "announcement";

type AthleticsItem = {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  thumbnail: string | null;
  published: string;
  kind: Kind;
};

type AthleticsPayload = {
  items: AthleticsItem[];
  source?: string;
  error?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const KIND_LABEL: Record<Kind, string> = {
  recap: "Recap",
  schedule: "Schedule",
  announcement: "Announcement",
};

const KIND_COLOR: Record<Kind, string> = {
  recap: "var(--sage)",
  schedule: "var(--gold)",
  announcement: "var(--ink-muted)",
};

export function SportsWidget() {
  const { data, error, isLoading } = useSWR<AthleticsPayload>(
    "/api/athletics",
    fetcher,
    { refreshInterval: 1000 * 60 * 15 },
  );

  return (
    <WidgetShell
      title="Guardians Athletics"
      eyebrow="KAIAC · Recent + upcoming"
      accent="crimson"
      href="https://www.kaiac.org/"
      hrefLabel="KAIAC"
      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-gold">
          <Trophy className="h-3 w-3" />
        </span>
      }
    >
      {isLoading && <Skeleton />}
      {error && (
        <p className="text-sm text-ink-muted">Could not load athletics updates.</p>
      )}
      {data && data.items.length === 0 && (
        <div className="flex h-full items-center justify-center text-center text-sm text-ink-muted">
          No recent athletics updates.
        </div>
      )}
      {data && data.items.length > 0 && (
        <ul className="divide-y divide-[color:var(--line)] overflow-hidden">
          {data.items.slice(0, 3).map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1.5 rounded-md py-3 first:pt-0 last:pb-0 transition hover:bg-[color:var(--parchment-soft)]/60"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      borderColor: KIND_COLOR[item.kind],
                      color: KIND_COLOR[item.kind],
                    }}
                  >
                    {KIND_LABEL[item.kind]}
                  </span>
                  <p className="line-clamp-1 min-w-0 flex-1 font-display text-[12.5px] font-semibold leading-snug text-ink">
                    {item.title}
                  </p>
                  <span className="shrink-0 text-[10px] tabular-nums text-ink-muted">
                    {relativeTime(new Date(item.published))}
                  </span>
                </div>
                {item.excerpt && (
                  <p className="line-clamp-1 text-xs leading-relaxed text-ink-muted">
                    {item.excerpt}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

function Skeleton() {
  return (
    <ul className="divide-y divide-[color:var(--line)]">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3 w-16 animate-pulse rounded-full bg-[color:var(--line)]" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[color:var(--line)]" />
            <div className="h-3 w-full animate-pulse rounded bg-[color:var(--line)]" />
          </div>
          <div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[color:var(--line)]" />
        </li>
      ))}
    </ul>
  );
}
