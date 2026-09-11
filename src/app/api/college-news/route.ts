import { NextResponse } from "next/server";

// Curated/mock higher-ed & college-admissions news for the "College News"
// widget. No single no-auth live feed aggregates these outlets, so this MVP
// stays a static list, refreshed by hand on a rolling basis. Swap the body of
// the try block for a real fetcher (RSS aggregator / partner API) later —
// keep the response shape (`{ items: CollegeNewsItem[] }`) stable so the
// widget doesn't need to change.
//
// Content last reviewed: 2026-09-11

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
    id: "common-app-ed-seven-weeks-out",
    source: "Common App",
    title: "Early Decision I deadlines are seven weeks away",
    blurb:
      "Most Nov. 1 ED and EA deadlines are now about seven weeks out — counselors are pushing seniors to lock in recommender requests and final transcript releases this month.",
    url: "https://www.commonapp.org/",
    published: "2026-09-10T13:00:00Z",
    category: "admissions",
  },
  {
    id: "fafsa-opens-oct-1-2026",
    source: "Federal Student Aid",
    title: "FAFSA opens October 1 for the new aid cycle",
    blurb:
      "The Department of Education confirms the form returns to its standard Oct. 1 opening this year; families should have 2025 tax records ready to avoid delays.",
    url: "https://studentaid.gov/",
    published: "2026-09-08T10:00:00Z",
    category: "scholarship",
  },
  {
    id: "uc-application-window-open-aug1",
    source: "University of California",
    title: "UC's application window has been open since August 1",
    blurb:
      "Applicants have until Nov. 30 to submit, but counselors recommend drafting the four Personal Insight Questions early rather than waiting for the deadline crunch.",
    url: "https://admission.universityofcalifornia.edu/",
    published: "2026-09-05T09:00:00Z",
    category: "admissions",
  },
  {
    id: "test-optional-ivy-plus",
    source: "The Chronicle of Higher Education",
    title: "More Ivy-Plus universities revisit test-optional policies",
    blurb:
      "Several highly selective schools are re-examining standardized-testing requirements after reviewing multiple admissions cycles of data.",
    url: "https://www.chronicle.com/",
    published: "2026-09-03T09:00:00Z",
    category: "policy",
  },
  {
    id: "fall-college-fair-season",
    source: "NACAC",
    title: "Fall college fair season kicks off across Seoul international schools",
    blurb:
      "Admissions reps from dozens of US, UK, and Korean universities begin campus visits this month — juniors are encouraged to attend and collect contacts for follow-up questions.",
    url: "https://www.nacacnet.org/",
    published: "2026-09-01T08:00:00Z",
    category: "campus",
  },
  {
    id: "ed1-ed2-acceptance-trend",
    source: "Inside Higher Ed",
    title: "Early Decision acceptance rates keep climbing at private colleges",
    blurb:
      "New counseling-office survey data shows binding early rounds are admitting a larger share of the incoming class than regular decision at many private colleges.",
    url: "https://www.insidehighered.com/",
    published: "2026-08-29T08:00:00Z",
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
