import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// Triggered daily by Vercel Cron (see vercel.json — 20:00 UTC = 05:00 KST).
// Vercel automatically sends `Authorization: Bearer ${CRON_SECRET}` on
// scheduled invocations when CRON_SECRET is set in the project's
// environment variables; local/dev calls skip the check so this is easy to
// hit manually while developing. Instagram is intentionally excluded — it's
// refreshed by a separate Python-snapshot process, not this tag-based path.
const TAGS = [
  "yiss-news",
  "yiss-events",
  "athletics",
  "college-news",
  "lunch",
];

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  // Fail closed outside of dev: a production call must present a Bearer
  // token that matches CRON_SECRET, even if that env var hasn't been set yet
  // (an unset secret should never make the route wide open).
  if (isProd) {
    const auth = request.headers.get("authorization");
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json(
        {
          ok: false,
          error: "unauthorized",
          revalidated: [],
          at: new Date().toISOString(),
        },
        { status: 200 },
      );
    }
  }

  for (const tag of TAGS) {
    // `expire: 0` matches Next's documented pattern for webhooks/third-party
    // callers (like this cron trigger) that need immediate expiration,
    // rather than the lazy stale-while-revalidate default.
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({
    ok: true,
    revalidated: TAGS,
    at: new Date().toISOString(),
  });
}
