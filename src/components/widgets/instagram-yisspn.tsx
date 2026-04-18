"use client";

import { Flame } from "lucide-react";
import { InstagramGlyph } from "@/components/brand/icons";
import { WidgetShell } from "./widget-shell";

const POSTS = [
  {
    cover: "from-[#9a2b2b] to-[#5a0e0e]",
    motif: "🏐",
    caption: "Guardians V volleyball sweeps TCIS 3–1 · Captain Park with 14 kills.",
    when: "3h",
  },
  {
    cover: "from-[#0b1e3f] to-[#14315f]",
    motif: "🏀",
    caption: "JV basketball tips off Saturday at KIS — bring your gold.",
    when: "1d",
  },
  {
    cover: "from-[#b8923a] to-[#6a4f16]",
    motif: "🏃",
    caption: "Cross country places 2nd at the KAIAC Invitational.",
    when: "2d",
  },
];

export function InstagramYisspnWidget() {
  return (
    <WidgetShell
      title="@yisspn"
      eyebrow="Guardians Press Network · Sports"
      accent="crimson"
      href="https://www.instagram.com/yisspn/"
      hrefLabel="Follow"

      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-ink-muted">
          <InstagramGlyph className="h-3.5 w-3.5" />
        </span>
      }
    >
      <div className="space-y-1.5">
        {POSTS.map((p, i) => (
          <a
            key={i}
            href="https://www.instagram.com/yisspn/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 rounded-lg border border-transparent p-1.5 transition hover:border-[color:var(--line)] hover:bg-[color:var(--parchment-soft)]/60"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${p.cover} text-xl shadow-inner`}
            >
              {p.motif}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[12px] leading-tight text-ink">
                {p.caption}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-ink-muted">
                <Flame className="h-2.5 w-2.5 text-[color:var(--crimson)]" />
                {p.when} ago
              </p>
            </div>
          </a>
        ))}
      </div>
    </WidgetShell>
  );
}
