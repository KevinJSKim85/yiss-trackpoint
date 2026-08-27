"use client";

import { useState } from "react";
import { Search, Clock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type ClubCategory =
  | "Academic"
  | "Service"
  | "Arts"
  | "Athletics"
  | "Cultural"
  | "Media"
  | "STEM";

type FilterCategory = "All" | ClubCategory;

type Club = {
  name: string;
  category: ClubCategory;
  description: string;
  meeting: string;
  contact: string;
};

const CATEGORIES: FilterCategory[] = [
  "All",
  "Academic",
  "Service",
  "Arts",
  "Athletics",
  "Cultural",
  "Media",
  "STEM",
];

const CATEGORY_STYLES: Record<ClubCategory, string> = {
  Academic: "border-[color:var(--line-strong)] text-ink",
  Service: "border-[color:var(--sage)] text-[color:var(--sage)]",
  Arts: "border-[color:var(--crimson)] text-[color:var(--crimson)]",
  Athletics: "border-[color:var(--gold-ink)] text-gold-ink",
  Cultural: "border-[color:var(--crimson)] text-[color:var(--crimson)]",
  Media: "border-[color:var(--line-strong)] text-ink-soft",
  STEM: "border-[color:var(--sage)] text-[color:var(--sage)]",
};

const CLUBS: Club[] = [
  {
    name: "National Honor Society",
    category: "Academic",
    description:
      "Recognizes students who exemplify scholarship, leadership, and character through campus tutoring and service projects.",
    meeting: "Mondays · 15:30–16:15 · Library Mezzanine",
    contact: "Ms. Reyes · reyes@yisseoul.org",
  },
  {
    name: "Guardian Council",
    category: "Service",
    description:
      "The student government body representing every grade — plans spirit weeks, forums, and campus improvement drives.",
    meeting: "Wednesdays · 15:30–16:30 · Room 108",
    contact: "President: S. Park · parks28@yisseoul.org",
  },
  {
    name: "Model United Nations",
    category: "Academic",
    description:
      "Trains delegates in diplomacy, research, and public speaking ahead of KAIAC and regional MUN conferences.",
    meeting: "Tuesdays · 15:45–16:45 · Room 212",
    contact: "Mr. Donnelly · donnelly@yisseoul.org",
  },
  {
    name: "Debate Team",
    category: "Academic",
    description:
      "Competes in Public Forum and Lincoln–Douglas formats, with weekly practice rounds and case-writing workshops.",
    meeting: "Thursdays · 15:30–17:00 · Room 304",
    contact: "President: J. Kim · kimj27@yisseoul.org",
  },
  {
    name: "Robotics Club",
    category: "STEM",
    description:
      "Designs, builds, and programs competition robots for FTC events — open to every skill level, from wiring to code.",
    meeting: "Tue & Fri · 15:30–17:00 · Innovation Lab",
    contact: "Mr. Osei · osei@yisseoul.org",
  },
  {
    name: "Math League",
    category: "STEM",
    description:
      "Prepares for AMC, KAIAC Math Meets, and online invitationals with timed problem sets and peer coaching.",
    meeting: "Wednesdays · 15:30–16:15 · Room 219",
    contact: "Ms. Whitfield · whitfield@yisseoul.org",
  },
  {
    name: "Chess Club",
    category: "Academic",
    description:
      "Casual and competitive play for every rating, with an in-house ladder tournament running each semester.",
    meeting: "Fridays · Lunch (12:15–12:55) · Commons",
    contact: "President: D. Han · hand29@yisseoul.org",
  },
  {
    name: "The Tribune",
    category: "Media",
    description:
      "YISS's student-run newspaper, covering campus news, sports, and opinion in print and online each month.",
    meeting: "Mondays · 15:30–16:30 · Newsroom",
    contact: "Editor: A. Cho · choa27@yisseoul.org",
  },
  {
    name: "Yearbook Committee",
    category: "Media",
    description:
      "Designs and produces the annual Guardian yearbook — photography, layout, and copy from August through May.",
    meeting: "Thursdays · 15:30–16:30 · Room 214",
    contact: "Ms. Alvarez · alvarez@yisseoul.org",
  },
  {
    name: "Guardian Chorale",
    category: "Arts",
    description:
      "The school's mixed-voice choir, performing at winter and spring concerts and community events around Seoul.",
    meeting: "Tuesdays · 15:30–16:45 · Choir Room",
    contact: "Mr. Bennett · bennett@yisseoul.org",
  },
  {
    name: "Drama Club",
    category: "Arts",
    description:
      "Stages one full production each semester, from auditions and rehearsals through set design and tech week.",
    meeting: "Wed & Fri · 15:30–17:00 · Auditorium",
    contact: "Ms. Suh · suh@yisseoul.org",
  },
  {
    name: "Korean Culture Club",
    category: "Cultural",
    description:
      "Shares Korean traditions, language, and pop culture through workshops, cooking nights, and holiday celebrations.",
    meeting: "Thursdays · 15:30–16:15 · Room 118",
    contact: "President: Y. Lim · limy28@yisseoul.org",
  },
  {
    name: "Global Kitchen Club",
    category: "Cultural",
    description:
      "Explores world cuisines through hands-on cooking sessions that celebrate the school's international community.",
    meeting: "Fridays · 15:30–16:30 · Home Ec Room",
    contact: "Ms. Ferreira · ferreira@yisseoul.org",
  },
  {
    name: "Environmental Guardians",
    category: "Service",
    description:
      "Runs campus recycling and the courtyard garden, and organizes beach and river cleanups around greater Seoul.",
    meeting: "Mondays · Lunch (12:15–12:55) · Room 226",
    contact: "President: E. Novak · novake29@yisseoul.org",
  },
  {
    name: "Volleyball Club",
    category: "Athletics",
    description:
      "Open-play and skills training for students who want game time outside the varsity KAIAC season.",
    meeting: "Tue & Thu · 16:00–17:15 · Main Gym",
    contact: "Coach Diaz · diaz@yisseoul.org",
  },
];

export function ClubsDirectory() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");

  const q = query.trim().toLowerCase();
  const filtered = CLUBS.filter((club) => {
    const matchesCategory =
      activeCategory === "All" || club.category === activeCategory;
    const matchesQuery =
      !q ||
      club.name.toLowerCase().includes(q) ||
      club.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pb-10 pt-6 md:px-8">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
          YISS · Student Life
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Clubs
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
          Explore active clubs at YISS. Each club is student-run — reach out
          to the listed contact to attend a meeting.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs by name or description..."
            aria-label="Search clubs"
            className="w-full rounded-full border border-[color:var(--line-strong)] bg-[color:var(--porcelain)] py-2.5 pl-10 pr-4 text-sm text-ink shadow-[var(--shadow-sm)] outline-none transition placeholder:text-ink-muted focus:border-[color:var(--gold)] focus:ring-2 focus:ring-[color:var(--ring)]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition",
                  active
                    ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--parchment)]"
                    : "border-[color:var(--line-strong)] bg-[color:var(--porcelain)] text-ink-soft hover:border-[color:var(--gold)] hover:text-ink",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((club) => (
            <article
              key={club.name}
              className="card-surface card-hover flex flex-col gap-3 p-5"
            >
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-ink">
                  {club.name}
                </h3>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    CATEGORY_STYLES[club.category],
                  )}
                >
                  {club.category}
                </span>
              </div>

              <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
                {club.description}
              </p>

              <div className="mt-auto flex flex-col gap-1.5 border-t border-[color:var(--line)] pt-3">
                <div className="flex items-center gap-2 text-[11.5px] text-ink-muted">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{club.meeting}</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-ink-muted">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{club.contact}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card-surface mt-6 flex flex-col items-center justify-center gap-1.5 px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            No clubs found
          </p>
          <p className="text-sm text-ink-muted">
            Try a different search term or category.
          </p>
        </div>
      )}
    </div>
  );
}
