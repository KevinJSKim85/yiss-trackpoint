import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

// Served from the edge cache — the API is a thin passthrough of the
// snapshot committed by scripts/refresh_instagram.py (refreshed daily
// by .github/workflows/refresh-instagram.yml). Runtime scraping from
// serverless functions is unreliable against Instagram's WAF, so all
// fetching happens off the request path.
export const revalidate = 3600;
export const dynamic = "force-static";

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
  source: "snapshot" | "no-snapshot";
  fetchedAt?: string;
};

// Shape written by scripts/refresh_instagram.py — snake_case on disk,
// mapped to the widget's camelCase contract on read.
type SnapshotPost = {
  id: string;
  shortcode: string;
  permalink: string;
  caption: string;
  like_count: number;
  comment_count: number;
  timestamp: string;
  is_video: boolean;
  thumbnail: string;
};

type Snapshot = {
  username: string;
  fetched_at: string;
  posts: SnapshotPost[];
};

const ALLOWED_USERNAMES = new Set(["yissguardians", "yisspn"]);

async function readSnapshot(username: string): Promise<Snapshot | null> {
  const jsonPath = path.join(
    process.cwd(),
    "public",
    "instagram",
    username,
    "posts.json",
  );
  try {
    const raw = await fs.readFile(jsonPath, "utf-8");
    return JSON.parse(raw) as Snapshot;
  } catch {
    return null;
  }
}

function toApiPost(p: SnapshotPost): InstagramPost {
  return {
    id: p.id,
    permalink: p.permalink,
    thumbnail: p.thumbnail,
    caption: p.caption,
    likes: p.like_count,
    comments: p.comment_count,
    timestamp: p.timestamp,
    isVideo: p.is_video,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  if (!ALLOWED_USERNAMES.has(username)) {
    const body: InstagramApiResponse = { posts: [], source: "no-snapshot" };
    return NextResponse.json(body);
  }

  const snapshot = await readSnapshot(username);
  if (!snapshot || !Array.isArray(snapshot.posts) || snapshot.posts.length === 0) {
    const body: InstagramApiResponse = { posts: [], source: "no-snapshot" };
    return NextResponse.json(body);
  }

  const body: InstagramApiResponse = {
    posts: snapshot.posts.slice(0, 4).map(toApiPost),
    source: "snapshot",
    fetchedAt: snapshot.fetched_at,
  };
  return NextResponse.json(body);
}
