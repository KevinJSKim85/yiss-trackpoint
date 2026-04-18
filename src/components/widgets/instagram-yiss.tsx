"use client";

import { Heart, MessageCircle } from "lucide-react";
import { InstagramGlyph } from "@/components/brand/icons";
import { WidgetShell } from "./widget-shell";

const POSTS = [
  {
    cover: "from-[#1a3a6b] to-[#0b1e3f]",
    motif: "🏛️",
    caption: "Spring concert is next Thursday — student composers take the stage.",
    likes: 284,
    comments: 12,
    when: "2h",
  },
  {
    cover: "from-[#b8923a] to-[#8a6b23]",
    motif: "🎓",
    caption: "Congrats to the Class of 2028 NHS inductees — truth, excellence, diversity.",
    likes: 412,
    comments: 38,
    when: "1d",
  },
  {
    cover: "from-[#5d7a5a] to-[#2e4a2e]",
    motif: "🌿",
    caption: "Earth Week campus clean-up — thank you Student Council.",
    likes: 231,
    comments: 9,
    when: "3d",
  },
];

export function InstagramYissWidget() {
  return (
    <WidgetShell
      title="@yissguardians"
      eyebrow="Official · Instagram"
      accent="gold"
      href="https://www.instagram.com/yissguardians/"
      hrefLabel="Follow"

      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-ink-muted">
          <InstagramGlyph className="h-3.5 w-3.5" />
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-1.5">
        {POSTS.map((p, i) => (
          <a
            key={i}
            href="https://www.instagram.com/yissguardians/"
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${p.cover} text-2xl`}
          >
            <span className="opacity-90 grayscale-[0.1]">{p.motif}</span>
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
              <div className="flex w-full items-center justify-between text-[10px] font-semibold text-white">
                <span className="inline-flex items-center gap-0.5">
                  <Heart className="h-3 w-3 fill-white" />
                  {p.likes}
                </span>
                <span>{p.when}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-soft">
        {POSTS[0].caption}
      </p>
      <div className="mt-1.5 flex items-center gap-3 text-[10.5px] text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3 w-3" />
          {POSTS[0].likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {POSTS[0].comments}
        </span>
        <span>· {POSTS[0].when} ago</span>
      </div>
    </WidgetShell>
  );
}
