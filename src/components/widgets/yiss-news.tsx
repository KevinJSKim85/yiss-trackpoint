"use client";

import useSWR from "swr";
import { Newspaper } from "lucide-react";
import { WidgetShell } from "./widget-shell";
import { relativeTime } from "@/lib/utils";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  thumbnail: string | null;
  published: string;
};

type NewsPayload = {
  items: NewsItem[];
  count: number;
  error?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function YissNewsWidget() {
  const { data, error, isLoading } = useSWR<NewsPayload>(
    "/api/yiss-news",
    fetcher,
    { refreshInterval: 1000 * 60 * 15 },
  );

  return (
    <WidgetShell
      title="News"
      eyebrow="YISS · SCHOOL WEBSITE"
      accent="ink"
      href="https://www.yisseoul.org/news"
      hrefLabel="All news"
    >
      {isLoading && <Skeleton />}
      {error && <p className="text-sm text-ink-muted">Could not load news.</p>}
      {data && data.items.length === 0 && (
        <div className="flex h-full items-center justify-center px-2 text-center text-sm text-ink-muted">
          No news right now — visit yisseoul.org/news
        </div>
      )}
      {data && data.items.length > 0 && (
        <ul className="divide-y divide-[color:var(--line)]">
          {data.items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment-soft)]">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-muted">
                      <Newspaper className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-soft">
                    {item.excerpt}
                  </p>
                  <div className="mt-1 flex justify-end">
                    <span className="text-[10.5px] text-ink-muted">
                      {relativeTime(new Date(item.published))}
                    </span>
                  </div>
                </div>
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
        <li key={i} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-[color:var(--line)]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-[color:var(--line)]" />
            <div className="h-3 w-full animate-pulse rounded bg-[color:var(--line)]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[color:var(--line)]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
