"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  Home,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { SIDEBAR_ITEMS, type SidebarIconName } from "./sidebar-nav";

const iconMap: Record<SidebarIconName, LucideIcon> = {
  Home,
  GraduationCap,
  Calendar,
  ClipboardList,
  Megaphone,
  Users,
  CalendarDays,
  BookOpen,
  CheckSquare,
  BarChart3,
  Settings,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="flex h-full flex-col">
      {/* Brand mark */}
      <div className="flex items-center gap-2.5 border-b border-[color:var(--line)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--porcelain)] shadow-[0_0_0_1px_rgba(11,30,63,0.08)]">
          <span className="font-display text-sm font-semibold text-ink">Y</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[13px] text-ink">TrackPoint</span>
          <span className="text-[9px] uppercase tracking-[0.22em] text-ink-muted">
            YISS
          </span>
        </div>
      </div>

      {/* Nav list */}
      <nav
        aria-label="Primary"
        className="widget-scroll flex-1 overflow-y-auto py-3"
      >
        <ul className="flex flex-col gap-0.5 px-2">
          {SIDEBAR_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = iconMap[item.iconName];
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] leading-tight transition " +
                    (active
                      ? "bg-[color:var(--parchment-soft)] font-semibold text-ink"
                      : "text-ink-soft hover:bg-[color:var(--parchment-soft)]/60 hover:text-ink")
                  }
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-1 left-0 top-1 w-[2px] rounded-r-sm bg-[color:var(--gold)]"
                    />
                  )}
                  <Icon
                    className={
                      "h-4 w-4 flex-shrink-0 transition " +
                      (active
                        ? "text-[color:var(--gold-ink)]"
                        : "text-ink-muted group-hover:text-ink-soft")
                    }
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile placeholder */}
      <div className="border-t border-[color:var(--line)] p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div
            aria-hidden="true"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--line-strong)] bg-[color:var(--parchment-soft)] text-[11px] font-semibold tracking-wide text-ink"
          >
            GU
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13px] font-medium text-ink">
              Guest
            </span>
            <span className="truncate text-[11px] text-ink-muted">
              Sign in to sync
            </span>
          </div>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="mt-1 flex w-full cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-[12px] text-ink-muted opacity-60 transition"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Mobile hamburger — fixed top-left */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="yiss-mobile-sidebar"
        className="fixed left-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line-strong)] bg-[color:var(--porcelain)] text-ink-soft shadow-[var(--shadow-sm)] transition hover:border-[color:var(--gold)] hover:text-ink lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop sidebar (lg+) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-[color:var(--line)] bg-[color:var(--parchment)] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer + scrim */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            tabIndex={-1}
            className="ink-fade absolute inset-0 cursor-default bg-[color:var(--ink)]/40 backdrop-blur-[2px]"
          />
          <div
            id="yiss-mobile-sidebar"
            className="ink-fade absolute left-0 top-0 flex h-full w-64 max-w-[82vw] flex-col border-r border-[color:var(--line)] bg-[color:var(--parchment)] shadow-[var(--shadow-lg)]"
          >
            <div className="flex justify-end px-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--line-strong)] bg-[color:var(--porcelain)] text-ink-soft transition hover:border-[color:var(--gold)] hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
