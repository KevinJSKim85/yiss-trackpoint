import { NextResponse } from "next/server";

// YISS's Squarespace site has no lunch/menu collection at any of the guessed
// slugs below (all 404 as of this writing), and the caterer's own portal
// (yisseoul.myschoolapp.com) isn't reachable server-side either — the vendor
// (J&J Catering, per yisseoul.org/news coverage) hasn't published a
// fetchable daily-menu feed anywhere public. Keep the candidates here in
// case a real feed shows up later; until then this falls back to a
// day-of-week rotation of plausible Korean cafeteria menus computed from the
// server's current date, so "today's" menu always matches the real weekday
// without needing manual date bumps.
const CANDIDATE_SOURCES = [
  "https://yisseoul.myschoolapp.com/menu?format=json",
  "https://www.yisseoul.org/lunch?format=json",
  "https://www.yisseoul.org/menu?format=json",
  "https://www.yisseoul.org/cafeteria?format=json",
  "https://www.yisseoul.org/dining?format=json",
];

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export const revalidate = 3600;

const FETCH_TIMEOUT_MS = 15000;

type MenuLine = { k: string; v: string };

type LunchPayload = {
  day: string;
  menu: MenuLine[];
  tags: string[];
  source: string;
  updated: string;
};

// Mon(1)-Fri(5) rotation. No known live source has ever responded (see
// comment above), so no parser exists yet for a real feed's shape — if one
// starts working, wire its response here instead of falling through to mock.
const WEEKDAY_MENUS: Record<number, { menu: MenuLine[]; tags: string[] }> = {
  1: {
    menu: [
      { k: "Main", v: "Bulgogi rice bowl" },
      { k: "Alt", v: "Grilled chicken caesar" },
      { k: "Soup", v: "Miyeok-guk" },
      { k: "Side", v: "Kimchi · steamed broccoli" },
      { k: "Dessert", v: "Seasonal fruit" },
    ],
    tags: ["Korean", "Halal option", "Nut-free"],
  },
  2: {
    menu: [
      { k: "Main", v: "Japchae with beef" },
      { k: "Alt", v: "Tofu & vegetable stir-fry" },
      { k: "Soup", v: "Doenjang-guk" },
      { k: "Side", v: "Kimchi · spinach namul" },
      { k: "Dessert", v: "Yogurt cup" },
    ],
    tags: ["Korean", "Vegetarian option", "Nut-free"],
  },
  3: {
    menu: [
      { k: "Main", v: "Dak-galbi (spicy chicken)" },
      { k: "Alt", v: "Bibimbap bar" },
      { k: "Soup", v: "Sundubu-jjigae" },
      { k: "Side", v: "Kimchi · pickled radish" },
      { k: "Dessert", v: "Melon slices" },
    ],
    tags: ["Korean", "Spicy", "Halal option"],
  },
  4: {
    menu: [
      { k: "Main", v: "Grilled mackerel" },
      { k: "Alt", v: "Beef bulgogi wrap" },
      { k: "Soup", v: "Gamja-guk" },
      { k: "Side", v: "Kimchi · japchae" },
      { k: "Dessert", v: "Rice cake skewer" },
    ],
    tags: ["Korean", "Pescatarian option", "Nut-free"],
  },
  5: {
    menu: [
      { k: "Main", v: "Korean fried chicken" },
      { k: "Alt", v: "Veggie kimbap" },
      { k: "Soup", v: "Ramyeon bar" },
      { k: "Side", v: "Kimchi · corn salad" },
      { k: "Dessert", v: "Ice cream cup" },
    ],
    tags: ["Korean", "Vegetarian option", "Crowd favorite"],
  },
};

const WEEKEND_MENU: { menu: MenuLine[]; tags: string[] } = {
  menu: [{ k: "Cafeteria", v: "Closed — no weekend service" }],
  tags: ["Weekend"],
};

function mockPayload(now: Date): LunchPayload {
  const { menu, tags } = WEEKDAY_MENUS[now.getDay()] ?? WEEKEND_MENU;
  return {
    day: now.toLocaleDateString("en-US", { weekday: "long" }),
    menu,
    tags,
    source: "mock",
    updated: now.toISOString(),
  };
}

export async function GET() {
  const now = new Date();

  for (const url of CANDIDATE_SOURCES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: controller.signal,
        next: { revalidate: 86400, tags: ["lunch"] },
      });
      if (!res.ok) continue;
      // A candidate responded, but no live source has ever been observed to
      // succeed, so there's no verified shape to parse yet — fall through to
      // mock rather than guess at a structure.
      break;
    } catch {
      continue;
    } finally {
      clearTimeout(timer);
    }
  }

  return NextResponse.json(mockPayload(now));
}
