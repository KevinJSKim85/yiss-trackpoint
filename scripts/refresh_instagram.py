#!/usr/bin/env python3
"""Snapshot @yissguardians and @yisspn Instagram feeds into public/instagram/.

Instagram closed public API endpoints (web_profile_info, feed/user, graphql)
behind a `require_login` 401 wall in 2025. The public *HTML* pages
(`/<username>/` and `/p/<shortcode>/`) still render server-side without
login — but only when the client presents a real browser TLS fingerprint,
so we fetch them through `curl_cffi` with Safari impersonation. Plain
`curl` and `urllib` are blocked at the TLS layer even before the login
check runs.

Data flow per user:
  1. GET `/<username>/`                    — HTML profile grid; extract
                                             shortcodes from `<a href=".../p/CODE/">`
                                             cards (server-rendered).
  2. GET `/p/<shortcode>/` per post        — parse Open Graph meta tags:
       - og:image        → thumbnail URL (CDN, signed, expires)
       - og:video        → presence marks isVideo
       - og:description  → "N likes, M comments - USER on DATE: \"CAPTION\""
                           (single string carries counts, date, caption)
  3. Download thumbnail to
     `public/instagram/<username>/<shortcode>.jpg` (CDN URLs expire so we
     cannot store the signed URL).
  4. Write `public/instagram/<username>/posts.json` in the schema the
     Next.js `/api/instagram/<username>` route reads.

Optional login (Instagram may throttle/challenge even the HTML path from
some IPs): set `INSTAGRAM_SESSIONID` in the environment to a valid
`sessionid` cookie (grab it from a real logged-in browser session at
instagram.com). The scraper still works without it against most Public
profiles; the cookie only kicks in when a request 401s.

Failures are swallowed so scheduled CI never fails the workflow — the
previous snapshot is left in place until the next successful run.

Usage (local):
    python3 -m venv .venv-ig
    .venv-ig/bin/pip install curl_cffi Pillow
    .venv-ig/bin/python scripts/refresh_instagram.py

Usage (GitHub Actions): see .github/workflows/refresh-instagram.yml
"""
from __future__ import annotations

import html as htmllib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_ROOT = os.path.join(BASE, "public", "instagram")

USERS = ["yissguardians", "yisspn"]
N_POSTS = 6
CAPTION_LIMIT = 200
THUMB_MAX_WIDTH = 400
REQUEST_DELAY = 1.5  # seconds between requests to the same host

# Optional session cookie: set INSTAGRAM_SESSIONID to a real logged-in
# `sessionid` from a browser to bypass the anonymous throttle when IG
# returns 401/429 on the HTML endpoints.
SESSIONID = os.environ.get("INSTAGRAM_SESSIONID", "").strip()


def _get_html(url: str) -> str:
    """Fetch an Instagram HTML page as Safari.

    Instagram rejects plain-curl / urllib TLS fingerprints on the
    public HTML routes; curl_cffi's `impersonate="safari"` mimics a
    real Safari handshake and passes.
    """
    from curl_cffi import requests as cffi_requests  # local import: optional dep

    cookies = {"sessionid": SESSIONID} if SESSIONID else None
    resp = cffi_requests.get(
        url,
        impersonate="safari",
        timeout=30,
        allow_redirects=True,
        cookies=cookies,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:200]}")
    return resp.text


def _get_bytes(url: str) -> bytes:
    """Fetch CDN image bytes via curl_cffi (fbcdn accepts curl_cffi cleanly)."""
    from curl_cffi import requests as cffi_requests

    resp = cffi_requests.get(url, impersonate="safari", timeout=30, allow_redirects=True)
    if resp.status_code != 200:
        raise RuntimeError(f"HTTP {resp.status_code} on CDN fetch")
    return resp.content


def _maybe_resize(path: str) -> None:
    """Shrink downloaded JPEG to THUMB_MAX_WIDTH if Pillow is available.

    Pillow is best-effort; if it is missing, the raw download is kept
    as-is — the repo is still small enough with 6 posts x 2 accounts.
    """
    try:
        from PIL import Image
    except Exception:
        return
    try:
        with Image.open(path) as im:
            im = im.convert("RGB")
            if im.width > THUMB_MAX_WIDTH:
                ratio = THUMB_MAX_WIDTH / im.width
                new_size = (THUMB_MAX_WIDTH, int(im.height * ratio))
                im = im.resize(new_size, Image.LANCZOS)
            im.save(path, format="JPEG", quality=82, optimize=True)
    except Exception as exc:
        print(f"  resize failed for {os.path.basename(path)}: {exc}")


def _download_thumb(url: str, out_path: str) -> None:
    data = _get_bytes(url)
    with open(out_path, "wb") as f:
        f.write(data)
    _maybe_resize(out_path)


# Card cell in the profile-page grid links to /<username>/p/<shortcode>/;
# Reels use /<username>/reel/<shortcode>/. We accept both.
_SHORTCODE_RE = re.compile(r'href="/[^"/]+/(?:p|reel)/([A-Za-z0-9_-]{5,20})/"')


def _extract_shortcodes(profile_html: str) -> list[str]:
    seen: list[str] = []
    for m in _SHORTCODE_RE.finditer(profile_html):
        code = m.group(1)
        if code not in seen:
            seen.append(code)
    return seen


# Meta tags on `/p/<shortcode>/` server-rendered HTML.
_META_RE = {
    "og_image": re.compile(r'<meta property="og:image" content="([^"]+)"'),
    "og_video": re.compile(r'<meta property="og:video" content="([^"]+)"'),
    "og_desc": re.compile(r'<meta property="og:description" content="([^"]+)"'),
    "og_title": re.compile(r'<meta property="og:title" content="([^"]+)"'),
}

# og:description shape from Instagram post pages:
#   "128 likes, 0 comments - yissguardians on August 31, 2026: "..caption..""
# Digits may include thousands separators (e.g. "1,234 likes").
_DESC_RE = re.compile(
    r'([\d,]+)\s+likes?,\s+([\d,]+)\s+comments?\s+-\s+([^\s]+)\s+on\s+([A-Za-z]+ \d{1,2},\s*\d{4})(?::\s*"?(.*))?',
    re.DOTALL,
)


def _parse_int(s: str) -> int:
    return int(s.replace(",", "")) if s else 0


def _parse_date(s: str) -> str:
    """'August 31, 2026' -> '2026-08-31T00:00:00Z' (date-only; noon of the
    posted day is unavailable from OG meta without the API)."""
    try:
        dt = datetime.strptime(s.strip(), "%B %d, %Y").replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")
    except Exception:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _fetch_post_meta(shortcode: str) -> dict | None:
    url = f"https://www.instagram.com/p/{shortcode}/"
    try:
        html = _get_html(url)
    except Exception as exc:
        print(f"  IG {shortcode} detail fetch failed ({exc}); skipping")
        return None

    meta = {name: (m.group(1) if (m := rx.search(html)) else "") for name, rx in _META_RE.items()}
    if not meta["og_image"]:
        print(f"  IG {shortcode} missing og:image; skipping")
        return None

    desc = htmllib.unescape(meta["og_desc"] or meta["og_title"] or "")
    like_count = comment_count = 0
    caption = ""
    timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    m = _DESC_RE.search(desc)
    if m:
        like_count = _parse_int(m.group(1))
        comment_count = _parse_int(m.group(2))
        timestamp = _parse_date(m.group(4))
        caption = (m.group(5) or "").strip().strip('"').strip()
    else:
        # og:title fallback: 'Username on Instagram: "caption"'
        t = htmllib.unescape(meta["og_title"] or "")
        cm = re.search(r'on Instagram:\s*"?(.*)', t, re.DOTALL)
        if cm:
            caption = cm.group(1).strip().strip('"').strip()

    return {
        "shortcode": shortcode,
        "permalink": f"https://www.instagram.com/p/{shortcode}/",
        "caption": caption[:CAPTION_LIMIT],
        "like_count": like_count,
        "comment_count": comment_count,
        "timestamp": timestamp,
        "is_video": bool(meta["og_video"]),
        "thumbnail_url": htmllib.unescape(meta["og_image"]),
    }


def _fetch_posts(username: str) -> list[dict]:
    profile_html = _get_html(f"https://www.instagram.com/{username}/")
    codes = _extract_shortcodes(profile_html)
    if not codes:
        raise RuntimeError("no shortcodes found in profile HTML (layout changed or login wall)")
    print(f"  found {len(codes)} shortcodes; fetching top {min(N_POSTS, len(codes))}")

    posts: list[dict] = []
    for code in codes[:N_POSTS]:
        time.sleep(REQUEST_DELAY)
        meta = _fetch_post_meta(code)
        if meta:
            # synthetic numeric id — the widget only needs uniqueness for React keys
            meta["id"] = code
            posts.append(meta)
    if not posts:
        raise RuntimeError("all post-detail fetches failed")
    return posts


def refresh_user(username: str) -> bool:
    """Refresh one user's snapshot. Returns True on success, False if stale-preserved."""
    out_dir = os.path.join(OUT_ROOT, username)
    os.makedirs(out_dir, exist_ok=True)
    json_path = os.path.join(out_dir, "posts.json")

    print(f"Fetching Instagram @{username}")
    try:
        raw_posts = _fetch_posts(username)
    except Exception as exc:
        print(f"  FAILED ({exc}); leaving previous snapshot in place")
        return False

    posts: list[dict] = []
    for p in raw_posts:
        code = p["shortcode"]
        local_name = f"{code}.jpg"
        local_path = os.path.join(out_dir, local_name)
        try:
            _download_thumb(p["thumbnail_url"], local_path)
            print(f"  IG {code} saved (likes={p['like_count']}, comments={p['comment_count']})")
        except Exception as exc:
            print(f"  IG {code} thumb download failed ({exc}); skipping post")
            continue
        posts.append({
            "id": p["id"],
            "shortcode": code,
            "permalink": p["permalink"],
            "caption": p["caption"],
            "like_count": p["like_count"],
            "comment_count": p["comment_count"],
            "timestamp": p["timestamp"],
            "is_video": p["is_video"],
            "thumbnail": f"/instagram/{username}/{local_name}",
        })

    if not posts:
        print(f"  no posts captured for @{username}; keeping stale snapshot")
        return False

    payload = {
        "username": username,
        "fetched_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "posts": posts,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"  wrote {json_path} ({len(posts)} posts)")
    return True


def main() -> int:
    os.makedirs(OUT_ROOT, exist_ok=True)
    results = {}
    for i, user in enumerate(USERS):
        results[user] = refresh_user(user)
        if i < len(USERS) - 1:
            time.sleep(5)
    ok = sum(1 for v in results.values() if v)
    print(f"\nDone: {ok}/{len(USERS)} accounts refreshed")
    return 0  # never fail CI on scraping errors


if __name__ == "__main__":
    sys.exit(main())
