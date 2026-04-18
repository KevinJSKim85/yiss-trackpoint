"use client";

import { UtensilsCrossed, Flame } from "lucide-react";
import { WidgetShell } from "./widget-shell";

const MENU = [
  { k: "Main", v: "Bulgogi rice bowl" },
  { k: "Alt", v: "Grilled chicken caesar" },
  { k: "Soup", v: "Miyeok-guk" },
  { k: "Side", v: "Kimchi · steamed broccoli" },
  { k: "Dessert", v: "Seasonal fruit" },
];

const TAGS = ["Korean", "Halal option", "Nut-free"];

export function LunchWidget({ editMode }: { editMode?: boolean }) {
  const today = new Date();
  const dow = today.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <WidgetShell
      title="Lunch today"
      eyebrow={`${dow} · Cafeteria`}
      accent="sage"
      editMode={editMode}
      headerExtra={
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] text-ink-muted">
          <UtensilsCrossed className="h-3 w-3" />
        </span>
      }
    >
      <dl className="space-y-1.5 text-[12.5px]">
        {MENU.map((m) => (
          <div
            key={m.k}
            className="flex items-baseline justify-between gap-2 border-b border-dashed border-[color:var(--line)] pb-1 last:border-b-0"
          >
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {m.k}
            </dt>
            <dd className="text-right font-medium text-ink">{m.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {TAGS.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--parchment-soft)]/80 px-2 py-0.5 text-[10px] font-medium text-ink-soft"
          >
            <Flame className="h-2.5 w-2.5 text-gold" />
            {t}
          </span>
        ))}
      </div>
    </WidgetShell>
  );
}
