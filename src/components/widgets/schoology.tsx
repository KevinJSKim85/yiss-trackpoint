"use client";

import { BookOpen, ListChecks, Newspaper, UtensilsCrossed, Bell } from "lucide-react";
import { WidgetShell } from "./widget-shell";

const ROWS = [
  {
    icon: BookOpen,
    label: "Grades",
    meta: "AP Bio · +4.2 since last week",
    href: "https://app.schoology.com",
  },
  {
    icon: ListChecks,
    label: "To-do",
    meta: "3 due this week · 1 overdue",
    href: "https://app.schoology.com/home/upcoming",
  },
  {
    icon: Newspaper,
    label: "School news",
    meta: "Spring concert lineup posted",
    href: "https://app.schoology.com",
  },
  {
    icon: Bell,
    label: "Daily updates",
    meta: "STUCO · Dress-down Friday",
    href: "https://app.schoology.com",
  },
  {
    icon: UtensilsCrossed,
    label: "Lunch menu",
    meta: "Bulgogi bowl · kimchi · fruit",
    href: "https://app.schoology.com",
  },
];

export function SchoologyWidget() {
  return (
    <WidgetShell
      title="Schoology"
      eyebrow="Classes · News · Lunch"
      accent="ink"
      href="https://app.schoology.com"
      hrefLabel="Open"

    >
      <ul className="space-y-1.5">
        {ROWS.map((r) => {
          const Icon = r.icon;
          return (
            <li key={r.label}>
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-[color:var(--line)] hover:bg-[color:var(--parchment-soft)]/60"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[color:var(--line)] bg-[color:var(--parchment-soft)] text-ink-soft">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink">{r.label}</p>
                  <p className="truncate text-[11px] text-ink-muted">{r.meta}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}
