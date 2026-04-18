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
import { WidgetShell } from "./widget-shell";

type LinkItem = {
  label: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const LINKS: LinkItem[] = [
  { label: "Schoology", url: "https://app.schoology.com", icon: BookOpen, accent: "#1c6fb8" },
  { label: "PowerSchool", url: "https://yisseoul.powerschool.com/guardian/home.html", icon: UserCheck, accent: "#0b1e3f" },
  { label: "Gmail", url: "https://mail.google.com", icon: Mail, accent: "#c5221f" },
  { label: "Calendar", url: "https://calendar.google.com", icon: CalendarDays, accent: "#1a73e8" },
  { label: "Drive", url: "https://drive.google.com", icon: HardDrive, accent: "#0f9d58" },
  { label: "Schedule", url: "https://yisseoul.powerschool.com/guardian/myschedule.html", icon: CalendarClock, accent: "#14315f" },
  { label: "Attendance", url: "https://yisseoul.powerschool.com/guardian/attendance.html", icon: GraduationCap, accent: "#14315f" },
  { label: "KAIAC", url: "https://www.kaiac.org/", icon: Trophy, accent: "#9a2b2b" },
  { label: "Sports Sheet", url: "https://docs.google.com/spreadsheets/d/1TBXCv_z2N8GJpTAAVLjOZqJwCPIhOo7Uo0hazPmtBMs/edit?gid=0#gid=0", icon: FileSpreadsheet, accent: "#0f9d58" },
  { label: "Guardians IG", url: "https://www.instagram.com/yissguardians/", icon: InstagramGlyph, accent: "#b8923a" },
  { label: "YISSPN", url: "https://www.instagram.com/yisspn/", icon: InstagramGlyph, accent: "#9a2b2b" },
  { label: "YISS Home", url: "https://www.yisseoul.org/", icon: Globe, accent: "#0b1e3f" },
  { label: "Library", url: "https://www.yisseoul.org/", icon: Library, accent: "#5d7a5a" },
  { label: "Arts", url: "https://www.yisseoul.org/", icon: Music, accent: "#b8923a" },
  { label: "Counseling", url: "https://www.yisseoul.org/", icon: Heart, accent: "#9a2b2b" },
];

export function QuickLinksBoard() {
  return (
    <WidgetShell title="Quick Links" eyebrow="Launchpad" accent="gold">
      <ul
        className="grid grid-cols-3 gap-1.5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {LINKS.map((l) => {
          const Icon = l.icon;
          return (
            <li key={l.label}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col items-center gap-1 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment-soft)]/40 p-1.5 text-center transition hover:-translate-y-0.5 hover:border-[color:var(--gold)] hover:bg-[color:var(--porcelain)] hover:shadow-[var(--shadow-sm)]"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ background: `${l.accent}18`, color: l.accent }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-medium leading-tight text-ink">
                  {l.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}
