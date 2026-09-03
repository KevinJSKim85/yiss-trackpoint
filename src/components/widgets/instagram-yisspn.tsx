"use client";

import useSWR from "swr";
import { Heart, MessageCircle, Play } from "lucide-react";
import { InstagramGlyph } from "@/components/brand/icons";
import { relativeTime } from "@/lib/utils";
import { WidgetShell } from "./widget-shell";

type InstagramPost = {
  id: string;
  permalink: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isVideo: boolean;
};

type InstagramApiResponse = {
  posts: InstagramPost[];
  // Snapshot lives in public/instagram/yisspn/posts.json; the API reports
  // "no-snapshot" when the file is missing / empty so the widget can
  // render its Follow-only empty state instead of a broken grid.
  source: "snapshot" | "no-snapshot";
  fetchedAt?: string;
};

const PROFILE_URL = "https://www.instagram.com/yisspn/";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function InstagramYisspnWidget() {
  const { data, error, isLoading } = useSWR<InstagramApiResponse>(
    "/api/instagram/yisspn",
    fetcher,
    { refreshInterval: 1000 * 60 * 15 },
  );

  const posts = data?.posts ?? [];
  const showEmpty = !isLoading && (!!error || posts.length === 0);

  return (
    <WidgetShell
      title="@yisspn"
      eyebrow="Guardians Press Network · Sports"
      accent="crimson"
      href={PROFILE_URL}
      hrefLabel="Follow"

      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-ink-muted">
          <InstagramGlyph className="h-3.5 w-3.5" />
        </span>
      }
    >
      {isLoading && <PostListSkeleton />}
      {showEmpty && <EmptyState href={PROFILE_URL} />}
      {!isLoading && !showEmpty && (
        <ul className="space-y-1.5">
          {posts.slice(0, 4).map((post) => (
            <li key={post.id}>
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 rounded-lg border border-transparent p-1.5 transition hover:border-[color:var(--line)] hover:bg-[color:var(--parchment-soft)]/60"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[color:var(--parchment-soft)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.thumbnail}
                    alt={post.caption}
                    className="h-full w-full object-cover"
                  />
                  {post.isVideo && (
                    <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white">
                      <Play className="h-2.5 w-2.5 fill-white" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12px] leading-tight text-ink">
                    {post.caption}
                  </p>
                  <p className="mt-1 flex items-center gap-2.5 text-[10.5px] text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-2.5 w-2.5" />
                      {post.likes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-2.5 w-2.5" />
                      {post.comments}
                    </span>
                    <span>{relativeTime(new Date(post.timestamp))}</span>
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

function PostListSkeleton() {
  return (
    <ul className="space-y-1.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex items-center gap-2.5 p-1.5">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-[color:var(--line)]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-[color:var(--line)]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[color:var(--line)]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ href }: { href: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 py-6 text-center">
      <p className="text-[12px] text-ink-muted">
        Couldn&apos;t load posts — open on Instagram
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line-strong)] px-3 py-1 text-[11px] font-medium text-ink-soft transition hover:text-ink"
      >
        Follow
      </a>
    </div>
  );
}
