import { NextResponse } from "next/server";

const SITE_ORIGIN = "https://www.yisseoul.org";
const EVENTS_URL = `${SITE_ORIGIN}/events?format=json`;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export const revalidate = 900;

const FETCH_TIMEOUT_MS = 15000;

type EventItem = {
  id: string;
  title: string;
  url: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  thumbnail: string | null;
};

type SquarespaceLocation =
  | string
  | { addressLine1?: string; addressLine2?: string }
  | null;

type SquarespaceEventItem = {
  id?: string;
  urlId?: string;
  title?: string;
  startDate?: number;
  endDate?: number;
  location?: SquarespaceLocation;
  fullUrl?: string;
  assetUrl?: string;
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

function toLocation(loc: SquarespaceLocation | undefined): string | null {
  if (!loc) return null;
  if (typeof loc === "string") return stripHtml(loc) || null;
  const parts = [loc.addressLine1, loc.addressLine2].filter(
    (p): p is string => !!p,
  );
  return parts.length ? parts.join(", ") : null;
}

function normalize(raw: SquarespaceEventItem, index: number): EventItem {
  return {
    id: raw.id ?? raw.urlId ?? String(index),
    title: stripHtml(raw.title ?? "Untitled event"),
    url: toAbsoluteUrl(raw.fullUrl),
    startDate: raw.startDate
      ? new Date(raw.startDate).toISOString()
      : new Date(0).toISOString(),
    endDate: raw.endDate ? new Date(raw.endDate).toISOString() : null,
    location: toLocation(raw.location),
    thumbnail: toThumbnail(raw.assetUrl),
  };
}

export async function GET() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(EVENTS_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      next: { revalidate: 86400, tags: ["yiss-events"] },
    });
    if (!res.ok) throw new Error(`YISS events ${res.status}`);
    const raw = await res.json();
    const rawItems: SquarespaceEventItem[] = Array.isArray(raw?.items)
      ? raw.items
      : [];

    const now = Date.now();
    const normalized = rawItems.map(normalize);

    const upcoming = normalized
      .filter((e) => new Date(e.startDate).getTime() >= now)
      .sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
    const past = normalized
      .filter((e) => new Date(e.startDate).getTime() < now)
      .sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );

    const items = [...upcoming, ...past].slice(0, 6);

    return NextResponse.json({ items, count: items.length });
  } catch (e) {
    return NextResponse.json({ items: [], count: 0, error: String(e) });
  } finally {
    clearTimeout(timer);
  }
}
