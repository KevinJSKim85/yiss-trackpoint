"use client";

import { Mail, Paperclip, Star } from "lucide-react";
import { WidgetShell } from "./widget-shell";

const SAMPLE = [
  {
    from: "Ms. Henderson",
    subject: "AP Lit — essay feedback attached",
    snippet: "Great thesis on Beloved. A few pacing notes in the margins before you revise…",
    time: "7:42 am",
    unread: true,
    attachment: true,
    starred: true,
  },
  {
    from: "STUCO",
    subject: "Dress-down day Friday — Guardians colors",
    snippet: "Wear navy & gold to support the volleyball playoffs. Lanyards still required…",
    time: "Wed",
    unread: true,
    attachment: false,
    starred: false,
  },
  {
    from: "Dr. Park",
    subject: "Re: Recommendation letter",
    snippet: "Happy to write one. Please send me your activities list and top three programs by…",
    time: "Wed",
    unread: false,
    attachment: false,
    starred: true,
  },
  {
    from: "YISS Athletics",
    subject: "KAIAC Volleyball — away game logistics",
    snippet: "Bus leaves Friday at 2:35 pm sharp. Bring your jersey and warm-up kit…",
    time: "Tue",
    unread: false,
    attachment: true,
    starred: false,
  },
];

export function GmailWidget({ editMode }: { editMode?: boolean }) {
  const unread = SAMPLE.filter((e) => e.unread).length;

  return (
    <WidgetShell
      title="Gmail"
      eyebrow={`${unread} unread`}
      accent="crimson"
      href="https://mail.google.com"
      hrefLabel="Inbox"
      editMode={editMode}
      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-ink-muted">
          <Mail className="h-3.5 w-3.5" />
        </span>
      }
    >
      <ul className="divide-y divide-[color:var(--line)] text-[13px]">
        {SAMPLE.map((e) => (
          <li
            key={e.subject}
            className="group flex items-start gap-2 py-2.5 first:pt-0 last:pb-0"
          >
            <span
              className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                e.unread ? "bg-[color:var(--crimson)]" : "bg-transparent"
              }`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`truncate ${
                    e.unread
                      ? "font-semibold text-ink"
                      : "font-medium text-ink-soft"
                  }`}
                >
                  {e.from}
                </span>
                <span className="shrink-0 text-[11px] text-ink-muted">
                  {e.time}
                </span>
              </div>
              <p
                className={`truncate text-[12.5px] ${
                  e.unread ? "text-ink" : "text-ink-soft"
                }`}
              >
                {e.subject}
              </p>
              <p className="truncate text-[11.5px] text-ink-muted">
                {e.snippet}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 text-ink-muted">
              {e.starred && <Star className="h-3 w-3 fill-[color:var(--gold)] text-[color:var(--gold)]" />}
              {e.attachment && <Paperclip className="h-3 w-3" />}
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
