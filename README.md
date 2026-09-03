This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Instagram snapshots

The `@yissguardians` and `@yisspn` widgets do **not** scrape Instagram at
request time. A committed snapshot under `public/instagram/<username>/`
(a `posts.json` plus one `.jpg` per post) is served through
`/api/instagram/<username>` as static edge cache.

**How the scraper reaches Instagram.** Instagram closed all public API
endpoints (`web_profile_info`, `feed/user`, `graphql`) behind a
`require_login` 401 wall in 2025. `scripts/refresh_instagram.py` now
fetches the public HTML pages instead (`/<username>/` and each
`/p/<shortcode>/`) and parses post data out of the Open Graph meta
tags. Plain `curl`/`urllib` are blocked at the TLS layer, so the
scraper uses [`curl_cffi`](https://github.com/lexiforest/curl_cffi)
with Safari impersonation to present a real browser fingerprint.

**Refresh locally** (one-off, useful when Instagram blocks CI):

```bash
python3 -m venv .venv-ig
.venv-ig/bin/pip install curl_cffi Pillow
.venv-ig/bin/python scripts/refresh_instagram.py
```

The script writes new thumbnails + JSON into `public/instagram/`; commit
the changes to see them in production. On failure (rate-limit, login
wall) it prints a warning and leaves the previous snapshot in place.

**Refresh automatically:** `.github/workflows/refresh-instagram.yml`
runs the same script daily at 05:00 KST (20:00 UTC) and commits the
result. A manual button is exposed via `workflow_dispatch` in the
Actions tab.

**Optional login fallback.** If Instagram starts 401-ing GitHub
Actions' Azure IPs on the HTML routes too, add an `INSTAGRAM_SESSIONID`
repo secret with a real logged-in `sessionid` cookie value — the
scraper (and the workflow) will use it automatically:

1. Sign in to <https://instagram.com/> in a browser.
2. Open DevTools → Application → Cookies → `https://www.instagram.com`.
3. Copy the value of the `sessionid` cookie.
4. GitHub repo → Settings → Secrets and variables → Actions → New
   repository secret. Name it exactly `INSTAGRAM_SESSIONID`, paste the
   cookie value. **Do not commit the cookie.**

Session cookies rotate every few weeks — if the scraper starts failing
again, refresh the secret with a fresh cookie.

