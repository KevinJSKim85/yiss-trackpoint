"use client";

import { WidgetShell } from "./widget-shell";
import { relativeTime } from "@/lib/utils";

type Role = "STUCO" | "PRINCIPAL" | "FACULTY" | "ATHLETICS";

type Announcement = {
  author: string;
  role: Role;
  title: string;
  body: string;
  date: string;
};

// No public YISS announcements feed exists (these come from internal
// Schoology/homeroom posts, not the Squarespace site), so this stays a
// curated mock list. Refresh the dates + copy by hand every so often to keep
// it feeling current — keep each entry within the last ~7 days.
//
// Content last reviewed: 2026-09-03
const ANNOUNCEMENTS: Announcement[] = [
  {
    author: "STUCO",
    role: "STUCO",
    title: "Club Fair signups open this week",
    body: "Browse 30+ clubs on the Commons lawn Thu/Fri at lunch. New members welcome through Sept 12.",
    date: "2026-09-03T02:00:00Z",
  },
  {
    author: "Principal Park",
    role: "PRINCIPAL",
    title: "First all-school assembly Friday morning",
    body: "Arrive by 8:10 AM sharp — gymnasium doors close for the semester-opening assembly.",
    date: "2026-09-02T04:00:00Z",
  },
  {
    author: "Coach Parker",
    role: "ATHLETICS",
    title: "KAIAC fall season practice schedule posted",
    body: "Volleyball and cross country practice times are live on the Athletics page; tryout results go out Thursday.",
    date: "2026-08-31T06:00:00Z",
  },
];

const ROLE_COLOR: Record<Role, string> = {
  STUCO: "var(--gold)",
  PRINCIPAL: "var(--crimson)",
  FACULTY: "var(--ink)",
  ATHLETICS: "var(--sage)",
};

export function AnnouncementsWidget() {
  return (
    <WidgetShell
      title="Announcements"
      eyebrow="SCHOOL · TEACHERS · STAFF"
      accent="crimson"
      href="/announcements"
      hrefLabel="See all"
    >
      <ul className="divide-y divide-[color:var(--line)] overflow-hidden">
        {ANNOUNCEMENTS.slice(0, 3).map((a, i) => (
          <li key={i} className="flex gap-2.5 py-3 first:pt-0 last:pb-0">
            <div
              className="w-[1.5px] shrink-0 rounded-full"
              style={{ background: ROLE_COLOR[a.role] }}
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-[11px] font-semibold text-ink">
                    {a.author}
                  </span>
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      borderColor: ROLE_COLOR[a.role],
                      color: ROLE_COLOR[a.role],
                    }}
                  >
                    {a.role}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] text-ink-muted">
                  {relativeTime(new Date(a.date))}
                </span>
              </div>
              <p className="truncate text-[12.5px] font-medium text-ink">
                {a.title}
              </p>
              <p className="line-clamp-1 text-xs leading-relaxed text-ink-soft">
                {a.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
