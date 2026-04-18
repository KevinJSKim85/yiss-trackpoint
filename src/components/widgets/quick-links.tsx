"use client";

import {
  BookOpen,
  GraduationCap,
  Mail,
  CalendarDays,
  HardDrive,
  UserCheck,
  CalendarClock,
  Trophy,
  Globe,
  FileSpreadsheet,
  Library,
  Music,
  Heart,
} from "lucide-react";
import { InstagramGlyph } from "@/components/brand/icons";
import { cn } from "@/lib/utils";

type Link = {
  label: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
};

const LINKS: Link[] = [
  { label: "Schoology", url: "https://app.schoology.com", icon: BookOpen, accent: "#1c6fb8" },
  { label: "PowerSchool", url: "https://yisseoul.powerschool.com/guardian/home.html", icon: UserCheck, accent: "#0b1e3f" },
  { label: "Gmail", url: "https://mail.google.com", icon: Mail, accent: "#c5221f" },
  { label: "Calendar", url: "https://calendar.google.com", icon: CalendarDays, accent: "#1a73e8" },
  { label: "Drive", url: "https://drive.google.com", icon: HardDrive, accent: "#0f9d58" },
  { label: "Schedule", url: "https://yisseoul.powerschool.com/guardian/myschedule.html", icon: CalendarClock, accent: "#14315f" },
  { label: "Attendance", url: "https://yisseoul.powerschool.com/guardian/attendance.html", icon: GraduationCap, accent: "#14315f" },
  { label: "KAIAC", url: "https://www.kaiac.org/", icon: Trophy, accent: "#9a2b2b" },
  { label: "Sports Sheet", url: "https://docs.google.com/spreadsheets/d/1TBXCv_z2N8GJpTAAVLjOZqJwCPIhOo7Uo0hazPmtBMs/edit?gid=0#gid=0", icon: FileSpreadsheet, accent: "#0f9d58" },
  { label: "YISS Guardians", url: "https://www.instagram.com/yissguardians/", icon: InstagramGlyph, accent: "#b8923a" },
  { label: "YISSPN", url: "https://www.instagram.com/yisspn/", icon: InstagramGlyph, accent: "#9a2b2b" },
  { label: "YISS Home", url: "https://www.yisseoul.org/", icon: Globe, accent: "#0b1e3f" },
  { label: "Library", url: "https://www.yisseoul.org/", icon: Library, accent: "#5d7a5a" },
  { label: "Arts", url: "https://www.yisseoul.org/", icon: Music, accent: "#b8923a" },
  { label: "Counseling", url: "https://www.yisseoul.org/", icon: Heart, accent: "#9a2b2b" },
];

export function QuickLinksBoard({ editMode }: { editMode?: boolean }) {
  return (
    <article className="card-surface card-hover flex h-full w-full flex-col overflow-hidden paper-texture">
      <header className="flex items-end justify-between gap-3 border-b border-[color:var(--line)] px-5 pb-3 pt-4">
        <div className="flex min-w-0 items-start gap-2.5">
          {editMode && (
            <div className="drag-handle mt-0.5 rounded px-1 py-0.5 text-ink-muted hover:bg-[color:var(--parchment-soft)]">
              <span className="sr-only">Drag</span>
              <span aria-hidden className="block h-4 w-4">⋮⋮</span>
            </div>
          )}
          <div className="relative pl-3 before:absolute before:left-0 before:top-1 before:h-[calc(100%-4px)] before:w-[2px] before:rounded before:bg-[color:var(--gold)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Launchpad
            </p>
            <h3 className="font-display text-[1.35rem] font-semibold leading-tight text-ink">
              Quick Links
            </h3>
          </div>
        </div>
        <p className="hidden text-[11px] italic text-ink-muted md:block">
          Everything a Guardian might tap in a day.
        </p>
      </header>
      <div className="widget-scroll flex-1 overflow-auto px-5 py-4">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
          {LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <li key={l.label}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group flex h-full flex-col items-center gap-1.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--porcelain)] p-2.5 text-center transition",
                    "hover:-translate-y-0.5 hover:border-[color:var(--gold)] hover:shadow-[var(--shadow-md)]",
                  )}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--line)]"
                    style={{
                      background: `${l.accent}14`,
                      color: l.accent,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-ink">
                    {l.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
