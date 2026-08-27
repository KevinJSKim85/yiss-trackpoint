import { NextResponse } from "next/server";

// YISS's Squarespace site doesn't have a dedicated athletics collection at
// any of the guessed slugs below (all 404 as of this writing). The real feed
// lives under the "Athletics" category of the general news collection,
// discovered via https://www.yisseoul.org/sitemap.xml. Keep the originally
// guessed slugs first in case YISS adds one of them later; the working feed
// is listed last before the calendar/live fallback.
const CANDIDATE_SOURCES = [
  "https://www.yisseoul.org/athletics?format=json",
  "https://www.yisseoul.org/athletics-news?format=json",
  "https://www.yisseoul.org/guardians-athletics?format=json",
  "https://www.yisseoul.org/sports?format=json",
  "https://www.yisseoul.org/news/category/Athletics?format=json",
];

const SITE_ORIGIN = "https://www.yisseoul.org";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export const revalidate = 900;

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

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rdquo;/gi, "”")
    .replace(/&ldquo;/gi, "“")
    .replace(/\s+/g, " ")
    .trim();
}

function inferKind(title: string): Kind {
  const t = title.toLowerCase();
  if (/\b(schedule|tickets|upcoming|preview)\b/.test(t)) return "schedule";
  if (
    /\bvs\.?\b/.test(t) ||
    /\d+\s*-\s*\d+/.test(t) ||
    /\b(win|wins|won|championship|champions|victory|victorious|defeat|defeats|finishes|finish|concludes|conclude|clinches|shatter|shatters|record-breaking)\b/.test(
      t,
    )
  )
    return "recap";
  return "announcement";
}

function mockItems(): AthleticsItem[] {
  const now = Date.now();
  const day = 86400000;
  return [
    {
      id: "mock-1",
      title: "Volleyball (V) vs. SIS — Friday Home Match",
      excerpt:
        "Guardians varsity volleyball hosts SIS this Friday at 5:30 PM. Doors open at 5.",
      url: `${SITE_ORIGIN}/student-life/athletics`,
      thumbnail: null,
      published: new Date(now - 0.5 * day).toISOString(),
      kind: "schedule",
    },
    {
      id: "mock-2",
      title: "Volleyball (V) def. TCIS 3-1 in Home Opener",
      excerpt:
        "Guardians varsity volleyball opened KAIAC play with a straight-sets win over TCIS.",
      url: `${SITE_ORIGIN}/student-life/athletics`,
      thumbnail: null,
      published: new Date(now - 2 * day).toISOString(),
      kind: "recap",
    },
    {
      id: "mock-3",
      title: "Cross Country Takes 2nd at KAIAC Invitational",
      excerpt:
        "The Guardians cross country team finished second overall at the KAIAC Invitational meet.",
      url: `${SITE_ORIGIN}/student-life/athletics`,
      thumbnail: null,
      published: new Date(now - 4 * day).toISOString(),
      kind: "recap",
    },
    {
      id: "mock-4",
      title: "Athletics Booster Club Meeting Announcement",
      excerpt:
        "Parents and guardians are invited to the next Athletics Booster Club meeting in the library.",
      url: `${SITE_ORIGIN}/student-life/athletics`,
      thumbnail: null,
      published: new Date(now - 6 * day).toISOString(),
      kind: "announcement",
    },
  ];
}

export async function GET() {
  try {
    for (const url of CANDIDATE_SOURCES) {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT },
          next: { revalidate: 900 },
        });
        if (!res.ok) continue;

        const raw: unknown = await res.json();
        const rawItems: Record<string, unknown>[] =
          raw &&
          typeof raw === "object" &&
          Array.isArray((raw as { items?: unknown }).items)
            ? ((raw as { items: unknown[] }).items.filter(
                (v) => v && typeof v === "object",
              ) as Record<string, unknown>[])
            : [];
        if (rawItems.length === 0) continue;

        const items: AthleticsItem[] = rawItems
          .map((it): AthleticsItem => {
            const title = stripHtml(String(it?.title ?? "Untitled"));
            const fullUrl = typeof it?.fullUrl === "string" ? it.fullUrl : "";
            const publishOn =
              typeof it?.publishOn === "string" ||
              typeof it?.publishOn === "number"
                ? it.publishOn
                : null;
            return {
              id: String(it?.id ?? it?.urlId ?? title),
              title,
              excerpt: stripHtml(String(it?.excerpt ?? "")),
              url: fullUrl ? `${SITE_ORIGIN}${fullUrl}` : url,
              thumbnail:
                typeof it?.assetUrl === "string" ? it.assetUrl : null,
              published: publishOn
                ? new Date(publishOn).toISOString()
                : new Date().toISOString(),
              kind: inferKind(title),
            };
          })
          .sort(
            (a, b) =>
              new Date(b.published).getTime() - new Date(a.published).getTime(),
          )
          .slice(0, 6);

        return NextResponse.json({ items, source: url });
      } catch {
        continue;
      }
    }

    return NextResponse.json({ items: mockItems().slice(0, 6), source: "mock" });
  } catch (e) {
    return NextResponse.json({ items: [], error: String(e) }, { status: 200 });
  }
}
