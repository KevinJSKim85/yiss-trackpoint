import { NextResponse } from "next/server";

const SITE_ORIGIN = "https://www.yisseoul.org";
const NEWS_URL = `${SITE_ORIGIN}/news?format=json`;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export const revalidate = 900;

const FETCH_TIMEOUT_MS = 15000;

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  thumbnail: string | null;
  published: string;
};

type SquarespaceNewsItem = {
  id?: string;
  urlId?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  publishOn?: number;
  assetUrl?: string;
  fullUrl?: string;
};

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'");
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsoluteUrl(path: string | undefined): string {
  if (!path) return SITE_ORIGIN;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function toThumbnail(assetUrl: string | undefined): string | null {
  if (!assetUrl) return null;
  return `${assetUrl}${assetUrl.includes("?") ? "&" : "?"}format=300w`;
}

function normalize(raw: SquarespaceNewsItem, index: number): NewsItem {
  const excerptText = stripHtml(raw.excerpt ?? "");
  const excerpt = excerptText || stripHtml(raw.body ?? "").slice(0, 220);
  return {
    id: raw.id ?? raw.urlId ?? String(index),
    title: stripHtml(raw.title ?? "Untitled"),
    excerpt,
    url: toAbsoluteUrl(raw.fullUrl),
    thumbnail: toThumbnail(raw.assetUrl),
    published: raw.publishOn
      ? new Date(raw.publishOn).toISOString()
      : new Date(0).toISOString(),
  };
}

export async function GET() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(NEWS_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      next: { revalidate: 86400, tags: ["yiss-news"] },
    });
    if (!res.ok) throw new Error(`YISS news ${res.status}`);
    const raw = await res.json();
    const rawItems: SquarespaceNewsItem[] = Array.isArray(raw?.items)
      ? raw.items
      : [];

    const items = rawItems
      .map(normalize)
      .sort(
        (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
      )
      .slice(0, 6);

    return NextResponse.json({ items, count: items.length });
  } catch (e) {
    return NextResponse.json({ items: [], count: 0, error: String(e) });
  } finally {
    clearTimeout(timer);
  }
}
