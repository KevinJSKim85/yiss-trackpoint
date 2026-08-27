import { NextResponse } from "next/server";

// Curated/mock higher-ed & college-admissions news for the "College News"
// widget. MVP: static list below, refreshed by hand. Swap the body of the
// try block for a real fetcher (RSS aggregator / partner API) later — keep
// the response shape (`{ items: CollegeNewsItem[] }`) stable so the widget
// doesn't need to change.
//
// Content last reviewed: 2026-08-27

export const revalidate = 3600;

type CollegeNewsCategory =
  | "admissions"
  | "scholarship"
  | "campus"
  | "policy"
  | "college-life";

type CollegeNewsItem = {
  id: string;
  source: string;
  title: string;
  blurb: string;
  url: string;
  published: string;
  category: CollegeNewsCategory;
};

const ITEMS: CollegeNewsItem[] = [
  {
    id: "common-app-2026-27-prompts",
    source: "Common App",
    title: "Common App releases 2026-27 essay prompts",
    blurb:
      "The core personal-statement prompts carry over largely unchanged for the new cycle, giving rising seniors a head start on drafting before fall deadlines open.",
    url: "https://www.commonapp.org/",
    published: "2026-08-25T13:00:00Z",
    category: "admissions",
  },
  {
    id: "coalition-app-member-campuses",
    source: "Inside Higher Ed",
    title: "Coalition Application adds member campuses ahead of next cycle",
    blurb:
      "The nonprofit application platform is welcoming new partner colleges and refreshing its portfolio tools as more campuses join alongside the Common App.",
    url: "https://www.insidehighered.com/",
    published: "2026-08-24T10:00:00Z",
    category: "campus",
  },
  {
    id: "fafsa-rollout-timeline",
    source: "US News",
    title: "Education Department confirms this year's FAFSA rollout timeline",
    blurb:
      "Families should see the form open on its usual fall schedule, following several recent cycles of delays and processing fixes.",
    url: "https://www.usnews.com/education",
    published: "2026-08-22T15:30:00Z",
    category: "scholarship",
  },
  {
    id: "test-optional-ivy-plus",
    source: "The Chronicle of Higher Education",
    title: "More Ivy-Plus universities revisit test-optional policies",
    blurb:
      "Several highly selective schools are re-examining standardized-testing requirements after reviewing multiple admissions cycles of data.",
    url: "https://www.chronicle.com/",
    published: "2026-08-20T09:00:00Z",
    category: "policy",
  },
  {
    id: "merit-scholarship-deadlines",
    source: "US News",
    title:
      "Reminder: automatic merit-scholarship deadlines approach at public flagships",
    blurb:
      "Counselors note some of the largest automatic awards require a completed application weeks before each school's general deadline.",
    url: "https://www.usnews.com/education",
    published: "2026-08-19T12:00:00Z",
    category: "scholarship",
  },
  {
    id: "ed1-ed2-acceptance-trend",
    source: "NACAC",
    title: "Early Decision I and II acceptance rates keep climbing",
    blurb:
      "New counseling-office survey data shows binding early rounds are admitting a larger share of the incoming class at many private colleges.",
    url: "https://www.nacacnet.org/",
    published: "2026-08-14T08:00:00Z",
    category: "college-life",
  },
];

export async function GET() {
  try {
    // MVP returns the curated list above. Replace this with a real fetch
    // (e.g. an RSS aggregator or partner API) once a live source is ready.
    return NextResponse.json({ items: ITEMS });
  } catch (e) {
    return NextResponse.json(
      { error: "college_news_unavailable", detail: String(e) },
      { status: 502 },
    );
  }
}
