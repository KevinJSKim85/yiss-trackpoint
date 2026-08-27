import { NextResponse } from "next/server";

export const revalidate = 900;

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

type MirrorName = "picuki" | "imginn" | "gramhir" | "iyeni";

type InstagramApiResponse = {
  posts: InstagramPost[];
  source: MirrorName | "mock";
};

const ACCENT_HEX: Record<string, string> = {
  yissguardians: "0b1e3f",
  yisspn: "9a2b2b",
};

function placeholderThumbnail(username: string) {
  const hex = ACCENT_HEX[username] ?? "5a6478";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">` +
    `<rect width="400" height="400" fill="#${hex}"/>` +
    `<rect x="128" y="118" width="144" height="144" rx="30" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.9"/>` +
    `<circle cx="200" cy="190" r="36" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.9"/>` +
    `<circle cx="250" cy="144" r="6" fill="#ffffff" opacity="0.9"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function isoAgo(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

const MOCK_POSTS: Record<string, InstagramPost[]> = {
  yissguardians: [
    {
      id: "mock-yg-1",
      permalink: "https://www.instagram.com/yissguardians/",
      thumbnail: placeholderThumbnail("yissguardians"),
      caption: "Student Council recap: Spirit Week closes with a Guardians gold pep rally.",
      likes: 268,
      comments: 14,
      timestamp: isoAgo(5 * HOUR),
      isVideo: false,
    },
    {
      id: "mock-yg-2",
      permalink: "https://www.instagram.com/yissguardians/",
      thumbnail: placeholderThumbnail("yissguardians"),
      caption: "Senior portrait shoot on the front lawn. Class of 2026 looking sharp.",
      likes: 351,
      comments: 22,
      timestamp: isoAgo(1 * DAY),
      isVideo: false,
    },
    {
      id: "mock-yg-3",
      permalink: "https://www.instagram.com/yissguardians/",
      thumbnail: placeholderThumbnail("yissguardians"),
      caption: "Spring concert teaser: student composers take the stage next Thursday.",
      likes: 412,
      comments: 38,
      timestamp: isoAgo(2 * DAY),
      isVideo: true,
    },
    {
      id: "mock-yg-4",
      permalink: "https://www.instagram.com/yissguardians/",
      thumbnail: placeholderThumbnail("yissguardians"),
      caption: "Dress-down day Friday. Wear navy and gold to support the playoffs.",
      likes: 197,
      comments: 9,
      timestamp: isoAgo(4 * DAY),
      isVideo: false,
    },
  ],
  yisspn: [
    {
      id: "mock-pn-1",
      permalink: "https://www.instagram.com/yisspn/",
      thumbnail: placeholderThumbnail("yisspn"),
      caption: "Guardians V volleyball sweeps TCIS 3-1. Captain Park drops 14 kills.",
      likes: 224,
      comments: 17,
      timestamp: isoAgo(3 * HOUR),
      isVideo: true,
    },
    {
      id: "mock-pn-2",
      permalink: "https://www.instagram.com/yisspn/",
      thumbnail: placeholderThumbnail("yisspn"),
      caption: "JV basketball tips off Saturday at KIS. Bring your gold.",
      likes: 133,
      comments: 6,
      timestamp: isoAgo(1 * DAY),
      isVideo: false,
    },
    {
      id: "mock-pn-3",
      permalink: "https://www.instagram.com/yisspn/",
      thumbnail: placeholderThumbnail("yisspn"),
      caption: "Cross country places 2nd at the KAIAC Invitational.",
      likes: 176,
      comments: 11,
      timestamp: isoAgo(2 * DAY),
      isVideo: false,
    },
    {
      id: "mock-pn-4",
      permalink: "https://www.instagram.com/yisspn/",
      thumbnail: placeholderThumbnail("yisspn"),
      caption: "Coach spotlight: Coach Reyes on building a KAIAC contender.",
      likes: 145,
      comments: 8,
      timestamp: isoAgo(4 * DAY),
      isVideo: true,
    },
  ],
};

function mocksFor(username: string): InstagramPost[] {
  return MOCK_POSTS[username] ?? MOCK_POSTS.yissguardians;
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
}

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MINUTE = 1000 * 60;
const WEEK = DAY * 7;
const FETCH_TIMEOUT_MS = 15000;

// Public Instagram mirrors that server-render a profile's recent posts as
// plain HTML (no login, no official API). Tried in order; the first one that
// responds with parseable posts wins. Any single mirror failing (blocked,
// down, redesigned) is expected — only exhausting the whole list falls back
// to the mock feed.
const MIRRORS: { name: MirrorName; url: (username: string) => string }[] = [
  { name: "picuki", url: (username) => `https://www.picuki.com/profile/${username}` },
  { name: "imginn", url: (username) => `https://imginn.com/${username}/` },
  { name: "gramhir", url: (username) => `https://gramhir.pro/profile/${username}` },
  { name: "iyeni", url: (username) => `https://iyeni.com/@${username}` },
];

async function fetchMirrorHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const RELATIVE_UNIT_RE =
  "(s|sec|secs|second|seconds|mo|month|months|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks|y|yr|yrs|year|years)";

// "3d", "2h ago", "1 month" -> ISO timestamp computed from the fetch time.
// Mirrors render Instagram's relative post age as plain text instead of a
// machine-readable timestamp, so this is the only way to recover one.
function parseRelativeTimestamp(text: string): string | null {
  const match = text
    .trim()
    .toLowerCase()
    .match(new RegExp(`^(\\d+)\\s*${RELATIVE_UNIT_RE}\\b`));
  if (!match) return null;
  const amount = parseInt(match[1], 10);
  if (Number.isNaN(amount)) return null;

  const unit = match[2];
  let unitMs: number;
  if (unit.startsWith("mo")) unitMs = DAY * 30;
  else if (unit.startsWith("s")) unitMs = 1000;
  else if (unit.startsWith("m")) unitMs = MINUTE;
  else if (unit.startsWith("h")) unitMs = HOUR;
  else if (unit.startsWith("d")) unitMs = DAY;
  else if (unit.startsWith("w")) unitMs = WEEK;
  else if (unit.startsWith("y")) unitMs = DAY * 365;
  else return null;

  return isoAgo(amount * unitMs);
}

// "1,234" / "1.2K" / "3.4M" -> integer. Falls back to 0 for anything
// unparseable, per the "parse if available, else 0" spec for likes/comments.
function parseCount(text: string): number {
  const cleaned = text.trim().toUpperCase().replace(/,/g, "");
  const match = cleaned.match(/^([\d.]+)\s*(K|M)?$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  if (Number.isNaN(value)) return 0;
  if (match[2] === "K") return Math.round(value * 1000);
  if (match[2] === "M") return Math.round(value * 1_000_000);
  return Math.round(value);
}

function looksLikeVideo(card: string): boolean {
  return /\breel\b|\/reel\/|<video[\s>]|class=["'][^"']*(?:video|reel)[^"']*["']|play-icon|icon-video|fa-play/i.test(
    card,
  );
}

function extractThumbnail(card: string, username: string): string {
  const lazy = card.match(/<img[^>]+(?:data-src|data-original)=["']([^"']+)["']/i);
  if (lazy?.[1]) return decodeEntities(lazy[1]);
  const plain = card.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (plain?.[1] && !/^data:image\/gif/i.test(plain[1])) return decodeEntities(plain[1]);
  return placeholderThumbnail(username);
}

function extractCaption(card: string): string {
  const paragraph = card.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (paragraph?.[1] && stripHtml(paragraph[1])) return stripHtml(paragraph[1]).slice(0, 200);
  const figcaption = card.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
  if (figcaption?.[1] && stripHtml(figcaption[1])) return stripHtml(figcaption[1]).slice(0, 200);
  const alt = card.match(/<img[^>]+alt=["']([^"']*)["']/i);
  const altText = alt?.[1] ? decodeEntities(alt[1]).trim() : "";
  return (altText || "View on Instagram").slice(0, 200);
}

function extractTimestamp(card: string): string {
  const timeTag = card.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  if (timeTag?.[1]) {
    const parsed = new Date(timeTag[1]);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  const relative = card.match(new RegExp(`>\\s*(\\d+\\s*${RELATIVE_UNIT_RE})\\b[^<]*<`, "i"));
  if (relative?.[1]) return parseRelativeTimestamp(relative[1]) ?? relative[1].trim();
  return new Date().toISOString();
}

function extractLikes(card: string): number {
  const match = card.match(/([\d][\d.,]*\s*[KM]?)\s*(?:<[^>]*>\s*)*(?:likes?|❤)/i);
  return match?.[1] ? parseCount(match[1]) : 0;
}

function extractComments(card: string): number {
  const match = card.match(/([\d][\d.,]*\s*[KM]?)\s*(?:<[^>]*>\s*)*comments?/i);
  return match?.[1] ? parseCount(match[1]) : 0;
}

// Every mirror links each post card back to the real
// instagram.com/(p|reel|tv)/<code>/ URL -- the one anchor that stays
// consistent across all of them regardless of surrounding markup. A true
// nested-tag parse needs a DOM, which isn't available in this route's
// runtime (and no HTML/XML parsing dependency is installed for this
// project), so each card is approximated as a text window anchored on its
// permalink match and bounded by the surrounding <article>/card <div>
// wrapper tags the task's own spec describes -- not by raw distance to the
// neighboring match. The href sits near the top of a card (it wraps the
// thumbnail) while caption/likes/comments/time trail after it, so a
// distance-based split (e.g. the midpoint to the next match) systematically
// attributes that trailing content to the wrong neighbor once cards are
// packed tighter than half that distance, which is the common case in a
// grid. CARD_LOOKBEHIND/MAX_CARD_RADIUS are only a fallback for markup that
// doesn't use a recognizable wrapper tag.
const CARD_LOOKBEHIND = 300;
const MAX_CARD_RADIUS = 1200;

function parsePostsFromHtml(html: string, username: string): InstagramPost[] {
  const permalinkRe = /href=["']([^"']*instagram\.com\/(?:p|reel|tv)\/[a-zA-Z0-9_-]+\/?)[^"']*["']/gi;
  const rawMatches: { index: number; permalink: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = permalinkRe.exec(html)) !== null) {
    const rawUrl = decodeEntities(match[1]);
    const permalink = rawUrl.startsWith("http") ? rawUrl : `https://www.instagram.com${rawUrl}`;
    rawMatches.push({ index: match.index, permalink });
  }

  const wrapperRe =
    /<article\b[^>]*>|<div\b[^>]*class=["'][^"']*(?:post|card|item|photo|grid)[^"']*["'][^>]*>/gi;
  const wrapperStarts: number[] = [];
  let wrapperMatch: RegExpExecArray | null;
  while ((wrapperMatch = wrapperRe.exec(html)) !== null) {
    wrapperStarts.push(wrapperMatch.index);
  }

  function wrapperStartAtOrBefore(pos: number): number | null {
    let result: number | null = null;
    for (const w of wrapperStarts) {
      if (w <= pos) result = w;
      else break;
    }
    return result;
  }
  function wrapperStartAfter(pos: number): number | null {
    for (const w of wrapperStarts) {
      if (w > pos) return w;
    }
    return null;
  }

  const posts: InstagramPost[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < rawMatches.length && posts.length < 6; i++) {
    const { index, permalink } = rawMatches[i];
    if (seen.has(permalink)) continue;
    seen.add(permalink);

    const wrapStart = wrapperStartAtOrBefore(index);
    const start = Math.max(wrapStart ?? index - CARD_LOOKBEHIND, index - MAX_CARD_RADIUS);

    const nextPermalink = i < rawMatches.length - 1 ? rawMatches[i + 1].index : html.length;
    const wrapEnd = wrapperStartAfter(start);
    const end = Math.min(wrapEnd ?? nextPermalink, nextPermalink, index + MAX_CARD_RADIUS);

    const card = html.slice(start, Math.max(end, start));

    posts.push({
      id: permalink,
      permalink,
      thumbnail: extractThumbnail(card, username),
      caption: extractCaption(card),
      likes: extractLikes(card),
      comments: extractComments(card),
      timestamp: extractTimestamp(card),
      isVideo: looksLikeVideo(card),
    });
  }

  return posts;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  let username = "yissguardians";
  try {
    ({ username } = await params);

    for (const mirror of MIRRORS) {
      const html = await fetchMirrorHtml(mirror.url(username));
      if (!html) continue;
      const posts = parsePostsFromHtml(html, username);
      if (posts.length > 0) {
        const body: InstagramApiResponse = { posts, source: mirror.name };
        return NextResponse.json(body);
      }
    }

    const body: InstagramApiResponse = { posts: mocksFor(username), source: "mock" };
    return NextResponse.json(body);
  } catch {
    const body: InstagramApiResponse = { posts: mocksFor(username), source: "mock" };
    return NextResponse.json(body);
  }
}
