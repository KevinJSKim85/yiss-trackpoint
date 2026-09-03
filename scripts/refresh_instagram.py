#!/usr/bin/env python3
"""Snapshot @yissguardians and @yisspn Instagram feeds into public/instagram/.

Instagram CDN image URLs are signed and expire, so post thumbnails are
downloaded to `public/instagram/<username>/<shortcode>.jpg` and a companion
`posts.json` is written next to them. The Next.js API route reads these
static files at build time — no runtime scraping, no dependency on
Instagram availability from Vercel edge nodes.

Rate-limit / login-wall responses are swallowed: on failure the previous
snapshot is left in place and the process exits 0 so a scheduled CI run
never fails the workflow.

Usage (local):
    python3 -m venv .venv-ig
    .venv-ig/bin/pip install curl_cffi Pillow
    .venv-ig/bin/python scripts/refresh_instagram.py

Usage (GitHub Actions): see .github/workflows/refresh-instagram.yml
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_ROOT = os.path.join(BASE, "public", "instagram")

USERS = ["yissguardians", "yisspn"]
N_POSTS = 6
CAPTION_LIMIT = 200
THUMB_MAX_WIDTH = 400

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126 Safari/537.36"
)
IG_APP_ID = {"x-ig-app-id": "936619743392459"}


def _get_bytes(url: str, headers: dict[str, str] | None = None) -> bytes:
    """Plain curl — used for Instagram CDN image downloads.

    curl avoids the missing-CA-bundle issue in framework Python builds
    and does not need TLS fingerprint impersonation for the fbcdn hosts.
    """
    cmd = ["curl", "-sfL", "--http1.1", "--max-time", "30", "-A", UA]
    for k, v in (headers or {}).items():
        cmd += ["-H", f"{k}: {v}"]
    cmd.append(url)
    last_err = None
    for attempt in range(3):
        r = subprocess.run(cmd, capture_output=True)
        if r.returncode == 0:
            return r.stdout
        last_err = r
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(
        f"curl failed ({last_err.returncode if last_err else '?'}) for {url}"
    )


def _get_ig(url: str) -> bytes:
    """curl_cffi with Safari impersonation for Instagram's own API endpoints.

    Instagram resets plain-curl TLS fingerprints on the API paths; the
    CDN image hosts (scontent-*.cdninstagram.com / fbcdn.net) are fine
    with the plain curl above.
    """
    from curl_cffi import requests as cffi_requests  # local import: optional dep

    resp = cffi_requests.get(url, headers=IG_APP_ID, impersonate="safari", timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(
            f"HTTP {resp.status_code}: {resp.text[:200] if hasattr(resp, 'text') else ''}"
        )
    return resp.content


def _maybe_resize(path: str) -> None:
    """Shrink downloaded JPEG to THUMB_MAX_WIDTH if Pillow is available.

    Pillow is best-effort; if it is missing, the raw download is kept
    as-is — the repo is still small enough with 6 posts × 2 accounts.
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


def _via_profile_api(username: str) -> list[dict]:
    """Primary: web_profile_info JSON endpoint used by instagram.com itself."""
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}"
    user = json.loads(_get_ig(url))["data"]["user"]
    posts: list[dict] = []
    for edge in user["edge_owner_to_timeline_media"]["edges"][:N_POSTS]:
        node = edge["node"]
        caption_edges = node.get("edge_media_to_caption", {}).get("edges", [])
        caption = caption_edges[0]["node"]["text"] if caption_edges else ""
        posts.append({
            "id": node["id"],
            "shortcode": node["shortcode"],
            "permalink": f"https://www.instagram.com/p/{node['shortcode']}/",
            "caption": caption[:CAPTION_LIMIT],
            "like_count": node.get("edge_liked_by", {}).get("count")
                or node.get("edge_media_preview_like", {}).get("count", 0),
            "comment_count": node.get("edge_media_to_comment", {}).get("count", 0),
            "timestamp": datetime.fromtimestamp(
                node["taken_at_timestamp"], tz=timezone.utc
            ).isoformat().replace("+00:00", "Z"),
            "is_video": bool(node.get("is_video")),
            "thumbnail_url": node["display_url"],
        })
    return posts


def _resolve_profile_id(username: str) -> str:
    html = _get_bytes(f"https://www.instagram.com/{username}/").decode("utf-8", "replace")
    m = re.search(r'"profile_id":"(\d+)"', html) or re.search(r"profilePage_(\d+)", html)
    if not m:
        raise RuntimeError("could not resolve numeric profile id from html")
    return m.group(1)


def _via_feed_api(username: str) -> list[dict]:
    """Fallback: mobile-web feed endpoint (works when web_profile_info 400s)."""
    uid = _resolve_profile_id(username)
    data = json.loads(_get_ig(f"https://i.instagram.com/api/v1/feed/user/{uid}/?count=12"))
    posts: list[dict] = []
    for item in data.get("items", [])[:N_POSTS]:
        media = item.get("carousel_media", [item])[0]
        candidates = media.get("image_versions2", {}).get("candidates", [])
        if not candidates:
            continue
        caption_obj = item.get("caption") or {}
        posts.append({
            "id": str(item.get("pk") or item.get("id") or item["code"]),
            "shortcode": item["code"],
            "permalink": f"https://www.instagram.com/p/{item['code']}/",
            "caption": (caption_obj.get("text") or "")[:CAPTION_LIMIT],
            "like_count": item.get("like_count", 0),
            "comment_count": item.get("comment_count", 0),
            "timestamp": datetime.fromtimestamp(
                item.get("taken_at", int(time.time())), tz=timezone.utc
            ).isoformat().replace("+00:00", "Z"),
            "is_video": item.get("media_type") == 2,
            "thumbnail_url": candidates[0]["url"],
        })
    if not posts:
        raise RuntimeError("feed endpoint returned no renderable items")
    return posts


def _fetch_posts(username: str) -> list[dict]:
    try:
        return _via_profile_api(username)
    except Exception as exc:
        print(f"  web_profile_info failed ({exc}); trying feed endpoint")
        return _via_feed_api(username)


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
            print(f"  IG {code} saved")
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
