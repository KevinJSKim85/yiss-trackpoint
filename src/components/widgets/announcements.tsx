"use client";

import { WidgetShell } from "./widget-shell";

type Role = "STUCO" | "PRINCIPAL" | "FACULTY" | "ATHLETICS";

type Announcement = {
  author: string;
  role: Role;
  title: string;
  body: string;
  time: string;
};

const ANNOUNCEMENTS: Announcement[] = [
  {
    author: "STUCO",
    role: "STUCO",
    title: "Dress-down day Friday — Guardians colors",
    body: "Wear navy & gold to support the volleyball playoffs. Lanyards still required.",
    time: "2h ago",
  },
  {
    author: "Dr. Park",
    role: "PRINCIPAL",
    title: "Semester exams countdown",
    body: "Study hall extended to 5:30 PM in the library through next week.",
    time: "Yesterday",
  },
  {
    author: "Ms. Henderson",
    role: "FACULTY",
    title: "Beloved seminar seating chart posted",
    body: "Please check Schoology; new seating starts Wednesday.",
    time: "Wed",
  },
  {
    author: "Athletics",
    role: "ATHLETICS",
    title: "KAIAC Volleyball — away game logistics",
    body: "Bus leaves Friday at 2:35 PM sharp from lot B. Bring your jersey and warm-up.",
    time: "Tue",
  },
  {
    author: "Guardian Council",
    role: "STUCO",
    title: "Guardians Give Back drive begins Monday",
    body: "Drop off canned goods at the main office. Homerooms compete for the trophy.",
    time: "Mon",
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
      <ul className="divide-y divide-[color:var(--line)]">
        {ANNOUNCEMENTS.map((a, i) => (
          <li key={i} className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0">
            <div
              className="w-[1.5px] shrink-0 rounded-full"
              style={{ background: ROLE_COLOR[a.role] }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-[12.5px] font-semibold text-ink">
                    {a.author}
                  </span>
                  <span
                    className="shrink-0 rounded-full border px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      borderColor: ROLE_COLOR[a.role],
                      color: ROLE_COLOR[a.role],
                    }}
                  >
                    {a.role}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] text-ink-muted">
                  {a.time}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[12.5px] font-medium text-ink">
                {a.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-soft">
                {a.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
