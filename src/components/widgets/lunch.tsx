"use client";

import useSWR from "swr";
import { UtensilsCrossed, Flame } from "lucide-react";
import { WidgetShell } from "./widget-shell";

type MenuLine = { k: string; v: string };

type LunchPayload = {
  day: string;
  menu: MenuLine[];
  tags: string[];
  source: string;
  updated: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function LunchWidget() {
  const { data, error, isLoading } = useSWR<LunchPayload>(
    "/api/lunch",
    fetcher,
    { refreshInterval: 1000 * 60 * 60 },
  );

  const fallbackDow = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const dow = data?.day ?? fallbackDow;
  const menu = data?.menu ?? [];
  const tags = data?.tags ?? [];

  return (
    <WidgetShell
      title="Lunch today"
      eyebrow={`${dow} · Cafeteria`}
      accent="sage"
      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-ink-muted">
          <UtensilsCrossed className="h-3 w-3" />
        </span>
      }
    >
      {isLoading && <Skeleton />}
      {!isLoading && error && (
        <p className="text-sm text-ink-muted">Could not load today&apos;s menu.</p>
      )}
      {!isLoading && !error && (
        <>
          <dl className="space-y-1.5 text-[12.5px]">
            {menu.map((m) => (
              <div
                key={m.k}
                className="flex items-baseline justify-between gap-2 border-b border-dashed border-[color:var(--line)] pb-1 last:border-b-0"
              >
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  {m.k}
                </dt>
                <dd className="text-right font-medium text-ink">{m.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--parchment-soft)]/80 px-2 py-0.5 text-[10px] font-medium text-ink-soft"
              >
                <Flame className="h-2.5 w-2.5 text-gold" />
                {t}
              </span>
            ))}
          </div>
        </>
      )}
    </WidgetShell>
  );
}

function Skeleton() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-baseline justify-between gap-2 border-b border-dashed border-[color:var(--line)] pb-1 last:border-b-0"
        >
          <div className="h-3 w-12 animate-pulse rounded bg-[color:var(--line)]" />
          <div className="h-3 w-24 animate-pulse rounded bg-[color:var(--line)]" />
        </div>
      ))}
    </div>
  );
}
