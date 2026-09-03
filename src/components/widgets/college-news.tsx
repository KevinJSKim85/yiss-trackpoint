"use client";

import useSWR from "swr";
import { ExternalLink } from "lucide-react";
import { WidgetShell } from "./widget-shell";

type CollegeNewsCategory =
  | "admissions"
  | "scholarship"
  | "campus"
  | "policy"
  | "college-life";

type CollegeNewsItem = {
  id: string;
  source: string;
  title: string;
  blurb: string;
  url: string;
  published: string;
  category: CollegeNewsCategory;
};

type CollegeNewsPayload = {
  items: CollegeNewsItem[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORY_LABEL: Record<CollegeNewsCategory, string> = {
  admissions: "Admissions",
  scholarship: "Scholarship",
  campus: "Campus",
  policy: "Policy",
  "college-life": "College Life",
};

const CATEGORY_COLOR: Record<CollegeNewsCategory, string> = {
  admissions: "var(--ink)",
  scholarship: "var(--gold-ink)",
  campus: "var(--sage)",
  policy: "var(--crimson)",
  "college-life": "var(--ink-soft)",
};

function timeAgo(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffH = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffH) < 24) return rtf.format(diffH, "hour");
  const diffD = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return rtf.format(diffD, "day");
}

export function CollegeNewsWidget() {
  const { data, error, isLoading } = useSWR<CollegeNewsPayload>(
    "/api/college-news",
    fetcher,
    { refreshInterval: 1000 * 60 * 75 },
  );

  const items = data?.items ?? [];

  return (
    <WidgetShell
      title="College News"
      eyebrow="COUNSELING · HIGHER ED"
      accent="gold"
    >
      {isLoading && <Skeleton />}
      {error && (
        <p className="text-sm text-ink-muted">Could not load college news.</p>
      )}
      {!isLoading && !error && items.length === 0 && (
        <p className="text-sm text-ink-muted">No college news right now.</p>
      )}
      {!isLoading && !error && items.length > 0 && (
        <ul className="divide-y divide-[color:var(--line)] overflow-hidden">
          {items.slice(0, 3).map((item) => (
            <li key={item.id} className="py-3.5 first:pt-1 last:pb-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: CATEGORY_COLOR[item.category],
                    color: CATEGORY_COLOR[item.category],
                  }}
                >
                  {CATEGORY_LABEL[item.category]}
                </span>
                <span className="shrink-0 text-[10px] text-ink-muted">
                  {timeAgo(item.published)}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 font-display text-[13px] font-semibold leading-snug text-ink md:text-sm">
                {item.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-muted">
                {item.blurb}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-ink-muted">
                <span className="truncate">{item.source}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-ink-muted transition hover:text-ink"
                  aria-label={`Open ${item.source}`}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

function Skeleton() {
  return (
    <div className="flex h-full flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 w-16 animate-pulse rounded-full bg-[color:var(--line)]" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-[color:var(--line)]" />
          <div className="h-3 w-full animate-pulse rounded bg-[color:var(--line)]" />
        </div>
      ))}
    </div>
  );
}
