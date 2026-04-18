"use client";

import { FileText, FileImage, FileSpreadsheet, Presentation, Folder } from "lucide-react";
import { WidgetShell } from "./widget-shell";

const FILES = [
  {
    name: "AP Lit — Beloved essay draft v3",
    kind: "doc",
    edited: "2m ago",
    editor: "You",
  },
  {
    name: "Volleyball KAIAC stats — spring",
    kind: "sheet",
    edited: "1h ago",
    editor: "Coach Parker",
  },
  {
    name: "NHS Induction slides",
    kind: "slide",
    edited: "Yesterday",
    editor: "STUCO",
  },
  {
    name: "Field trip permission form",
    kind: "doc",
    edited: "Yesterday",
    editor: "Ms. Henderson",
  },
  {
    name: "Yearbook — senior portraits",
    kind: "image",
    edited: "2 days ago",
    editor: "Shared folder",
  },
];

const ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  doc: { icon: FileText, color: "#2c6cd0" },
  sheet: { icon: FileSpreadsheet, color: "#1c8f4a" },
  slide: { icon: Presentation, color: "#c76426" },
  image: { icon: FileImage, color: "#8e44ad" },
  folder: { icon: Folder, color: "#b8923a" },
};

export function DriveWidget() {
  return (
    <WidgetShell
      title="Recent Drive files"
      eyebrow="Google Drive"
      accent="gold"
      href="https://drive.google.com"
      hrefLabel="Drive"

    >
      <ul className="space-y-2 text-[12.5px]">
        {FILES.map((f) => {
          const meta = ICONS[f.kind];
          const Icon = meta.icon;
          return (
            <li
              key={f.name}
              className="group flex items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 transition hover:border-[color:var(--line)] hover:bg-[color:var(--parchment-soft)]/60"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[color:var(--line)]"
                style={{ background: `${meta.color}12` }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{f.name}</p>
                <p className="truncate text-[10.5px] text-ink-muted">
                  {f.editor} · {f.edited}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}
