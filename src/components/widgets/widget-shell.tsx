"use client";

import { GripVertical, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type WidgetShellProps = {
  title: string;
  eyebrow?: string;
  accent?: "ink" | "gold" | "sage" | "crimson";
  href?: string;
  hrefLabel?: string;
  editMode?: boolean;
  children: React.ReactNode;
  bodyClassName?: string;
  headerExtra?: React.ReactNode;
};

const accentMap: Record<NonNullable<WidgetShellProps["accent"]>, string> = {
  ink: "before:bg-[color:var(--ink)]",
  gold: "before:bg-[color:var(--gold)]",
  sage: "before:bg-[color:var(--sage)]",
  crimson: "before:bg-[color:var(--crimson)]",
};

export function WidgetShell({
  title,
  eyebrow,
  accent = "ink",
  href,
  hrefLabel,
  editMode,
  children,
  bodyClassName,
  headerExtra,
}: WidgetShellProps) {
  return (
    <article className="card-surface card-hover flex h-full w-full flex-col overflow-hidden">
      <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          {editMode && (
            <div className="drag-handle mt-0.5 -ml-1 rounded px-1 py-0.5 text-ink-muted hover:bg-[color:var(--parchment-soft)]">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <div
            className={cn(
              "relative min-w-0 pl-3 before:absolute before:left-0 before:top-1 before:h-[calc(100%-4px)] before:w-[2px] before:rounded",
              accentMap[accent],
            )}
          >
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {eyebrow}
              </p>
            )}
            <h3 className="font-display text-[1.05rem] font-semibold leading-tight text-ink">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-[11px] font-medium text-ink-muted transition hover:border-[color:var(--line-strong)] hover:text-ink"
            >
              {hrefLabel ?? "Open"}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </header>
      <div
        className={cn(
          "widget-scroll relative flex-1 overflow-auto px-4 pb-4",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </article>
  );
}
