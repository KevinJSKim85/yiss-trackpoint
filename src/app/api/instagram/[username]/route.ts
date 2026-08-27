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

type InstagramApiResponse = {
  posts: InstagramPost[];
  source: "rsshub" | "instagram" | "mock";
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

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return null;
  let value = match[1].trim();
  const cdata = value.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdata) value = cdata[1];
  return value;
}

// RSSHub public instance mirrors an Instagram profile as an RSS feed. Parsed
// with a light regex scan instead of DOMParser (unavailable in the route's
// server runtime) or an XML dependency (none is installed for this project).
async function fetchFromRsshub(username: string): Promise<InstagramPost[] | null> {
  try {
    const res = await fetch(`https://rsshub.app/instagram/user/${username}`, {
      next: { revalidate: 900 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; yiss-trackpoint/1.0)" },
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g);
    if (!items || items.length === 0) return null;

    const posts = items.slice(0, 4).map((item, i) => {
      const title = extractTag(item, "title");
      const description = extractTag(item, "description") ?? "";
      const link = extractTag(item, "link") ?? `https://www.instagram.com/${username}/`;
      const pubDate = extractTag(item, "pubDate");
      const guid = extractTag(item, "guid");

      const imgMatch = description.match(/<img[^>]+src=["']([^"'\s]+)["']/i);
      const thumbnail = imgMatch?.[1]
        ? decodeEntities(imgMatch[1])
        : placeholderThumbnail(username);

      const caption = stripHtml(description) || stripHtml(title ?? "") || "View on Instagram";
      const isVideo = /<video[\s>]|\/reel\//i.test(item);
      const timestamp = pubDate && !Number.isNaN(new Date(pubDate).getTime())
        ? new Date(pubDate).toISOString()
        : new Date().toISOString();

      const post: InstagramPost = {
        id: guid || `${username}-rsshub-${i}`,
        permalink: link,
        thumbnail,
        caption: caption.slice(0, 200),
        likes: 0,
        comments: 0,
        timestamp,
        isVideo,
      };
      return post;
    });

    return posts;
  } catch {
    return null;
  }
}

type InstagramGraphNode = {
  id?: string;
  shortcode?: string;
  thumbnail_src?: string;
  display_url?: string;
  is_video?: boolean;
  taken_at_timestamp?: number;
  edge_media_to_caption?: { edges?: { node?: { text?: string } }[] };
  edge_liked_by?: { count?: number };
  edge_media_preview_like?: { count?: number };
  edge_media_to_comment?: { count?: number };
};

// Instagram's legacy embed JSON endpoint. It is almost always blocked with a
// 403 for server-side requests, but it costs nothing to attempt before
// falling back to the mock feed.
async function fetchFromInstagram(username: string): Promise<InstagramPost[] | null> {
  try {
    const res = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
      next: { revalidate: 900 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; yiss-trackpoint/1.0)",
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;

    const data: unknown = await res.json();
    const edges = (
      data as {
        graphql?: {
          user?: { edge_owner_to_timeline_media?: { edges?: { node?: InstagramGraphNode }[] } };
        };
      }
    )?.graphql?.user?.edge_owner_to_timeline_media?.edges;

    if (!Array.isArray(edges) || edges.length === 0) return null;

    return edges.slice(0, 4).map((edge, i) => {
      const node = edge.node ?? {};
      const captionText = node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "";
      const likes = node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? 0;
      const post: InstagramPost = {
        id: node.id ?? `${username}-instagram-${i}`,
        permalink: node.shortcode
          ? `https://www.instagram.com/p/${node.shortcode}/`
          : `https://www.instagram.com/${username}/`,
        thumbnail: node.thumbnail_src ?? node.display_url ?? placeholderThumbnail(username),
        caption: captionText.slice(0, 200) || "View on Instagram",
        likes,
        comments: node.edge_media_to_comment?.count ?? 0,
        timestamp: node.taken_at_timestamp
          ? new Date(node.taken_at_timestamp * 1000).toISOString()
          : new Date().toISOString(),
        isVideo: !!node.is_video,
      };
      return post;
    });
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    const rsshubPosts = await fetchFromRsshub(username);
    if (rsshubPosts && rsshubPosts.length > 0) {
      const body: InstagramApiResponse = { posts: rsshubPosts, source: "rsshub" };
      return NextResponse.json(body);
    }

    const instagramPosts = await fetchFromInstagram(username);
    if (instagramPosts && instagramPosts.length > 0) {
      const body: InstagramApiResponse = { posts: instagramPosts, source: "instagram" };
      return NextResponse.json(body);
    }

    const body: InstagramApiResponse = { posts: mocksFor(username), source: "mock" };
    return NextResponse.json(body);
  } catch {
    const { username } = await params.catch(() => ({ username: "yissguardians" }));
    const body: InstagramApiResponse = { posts: mocksFor(username), source: "mock" };
    return NextResponse.json(body);
  }
}
