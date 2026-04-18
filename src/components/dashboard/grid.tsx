"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { CountdownWidget } from "@/components/widgets/countdown";
import { GmailWidget } from "@/components/widgets/gmail";
import { CalendarWidget } from "@/components/widgets/calendar";
import { DriveWidget } from "@/components/widgets/drive";
import { SchoologyWidget } from "@/components/widgets/schoology";
import { PowerSchoolWidget } from "@/components/widgets/powerschool";
import { SportsWidget } from "@/components/widgets/sports";
import { InstagramYissWidget } from "@/components/widgets/instagram-yiss";
import { InstagramYisspnWidget } from "@/components/widgets/instagram-yisspn";
import { LunchWidget } from "@/components/widgets/lunch";
import { ClubsWidget } from "@/components/widgets/clubs";
import { QuickLinksBoard } from "@/components/widgets/quick-links";

type WidgetKey =
  | "countdown"
  | "gmail"
  | "calendar"
  | "drive"
  | "schoology"
  | "powerschool"
  | "sports"
  | "ig-yiss"
  | "ig-yisspn"
  | "lunch"
  | "clubs"
  | "quick-links";

const WIDGETS: Record<WidgetKey, () => React.ReactNode> = {
  countdown: () => <CountdownWidget />,
  gmail: () => <GmailWidget />,
  calendar: () => <CalendarWidget />,
  drive: () => <DriveWidget />,
  schoology: () => <SchoologyWidget />,
  powerschool: () => <PowerSchoolWidget />,
  sports: () => <SportsWidget />,
  "ig-yiss": () => <InstagramYissWidget />,
  "ig-yisspn": () => <InstagramYisspnWidget />,
  lunch: () => <LunchWidget />,
  clubs: () => <ClubsWidget />,
  "quick-links": () => <QuickLinksBoard />,
};

const DEFAULT_ORDER: WidgetKey[] = [
  "countdown",
  "calendar",
  "gmail",
  "drive",
  "schoology",
  "powerschool",
  "sports",
  "ig-yiss",
  "ig-yisspn",
  "lunch",
  "clubs",
  "quick-links",
];

const ALL_KEYS = new Set<WidgetKey>(DEFAULT_ORDER);

function sanitize(order: WidgetKey[]): WidgetKey[] {
  const seen = new Set<WidgetKey>();
  const out: WidgetKey[] = [];
  for (const k of order) {
    if (ALL_KEYS.has(k) && !seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  for (const k of DEFAULT_ORDER) {
    if (!seen.has(k)) out.push(k);
  }
  return out;
}

const DRAG_THRESHOLD = 6;
// Drag is only enabled at the 3-column layout (lg). Below this, touch users
// on phones/tablets would accidentally trigger drags while scrolling because
// our pointerdown+pointermove pattern picks up any 6px swipe as a drag.
const DRAG_ENABLED_QUERY = "(min-width: 1024px)";

export function DashboardGrid() {
  const [storedOrder, setStoredOrder, hydrated] = useLocalStorage<WidgetKey[]>(
    "yiss-order-v1",
    DEFAULT_ORDER,
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const order = sanitize(storedOrder);
  const [dragKey, setDragKey] = useState<WidgetKey | null>(null);
  const [hoverKey, setHoverKey] = useState<WidgetKey | null>(null);
  const hoverKeyRef = useRef<WidgetKey | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [ghostSize, setGhostSize] = useState<{ w: number; h: number } | null>(
    null,
  );

  const dragStateRef = useRef<{
    key: WidgetKey;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    started: boolean;
    pointerId: number;
    sourceEl: HTMLElement;
  } | null>(null);

  const [dragEnabled, setDragEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(DRAG_ENABLED_QUERY);
    const apply = () => setDragEnabled(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  // If a user is mid-drag and rapidly shrinks the viewport below lg,
  // endDrag here ensures stale ghost/hover state gets cleared. Prevents
  // 'stuck widget' bugs when resizing flaps across the breakpoint.
  useEffect(() => {
    if (!dragEnabled && dragStateRef.current) {
      const state = dragStateRef.current;
      dragStateRef.current = null;
      hoverKeyRef.current = null;
      setDragKey(null);
      setHoverKey(null);
      setGhostPos(null);
      setGhostSize(null);
      // Restore pointer-events in case we were in the middle of a move.
      try {
        state.sourceEl.style.pointerEvents = "";
      } catch {}
    }
  }, [dragEnabled]);

  useEffect(() => {
    (window as unknown as { __yissReset?: () => void }).__yissReset = () => {
      try {
        localStorage.removeItem("yiss-order-v1");
      } catch {}
      setStoredOrder(DEFAULT_ORDER);
    };
  }, [setStoredOrder]);

  const endDrag = useCallback(() => {
    dragStateRef.current = null;
    hoverKeyRef.current = null;
    setDragKey(null);
    setHoverKey(null);
    setGhostPos(null);
    setGhostSize(null);
  }, []);

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, key: WidgetKey) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      // Belt-and-suspenders: also check at call time. WidgetDropTarget
      // doesn't attach the listener when below lg, but if the breakpoint
      // changed mid-interaction this guards against stale capture.
      if (
        typeof window !== "undefined" &&
        !window.matchMedia(DRAG_ENABLED_QUERY).matches
      ) {
        return;
      }
      const cell = (e.currentTarget.closest("[data-widget-cell]") ??
        e.currentTarget) as HTMLElement;
      const rect = cell.getBoundingClientRect();
      dragStateRef.current = {
        key,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        started: false,
        pointerId: e.pointerId,
        sourceEl: cell,
      };
    },
    [],
  );

  // Window-level pointer listeners run only while a drag state exists.
  // hoverKeyRef lets us read the latest hover without re-attaching on every
  // hover change, which previously caused listener churn during rapid moves.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = dragStateRef.current;
      if (!s) return;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      if (!s.started) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        const rect = s.sourceEl.getBoundingClientRect();
        setGhostSize({ w: rect.width, h: rect.height });
        setDragKey(s.key);
        s.started = true;
      }
      setGhostPos({ x: e.clientX - s.offsetX, y: e.clientY - s.offsetY });
      const prevPE = s.sourceEl.style.pointerEvents;
      s.sourceEl.style.pointerEvents = "none";
      const el = document.elementFromPoint(e.clientX, e.clientY);
      s.sourceEl.style.pointerEvents = prevPE;
      const targetCell = el?.closest?.(
        "[data-widget-cell]",
      ) as HTMLElement | null;
      const targetKey =
        (targetCell?.getAttribute("data-widget-key") as WidgetKey | null) ??
        null;
      const nextHover =
        targetKey && ALL_KEYS.has(targetKey) && targetKey !== s.key
          ? targetKey
          : null;
      if (nextHover !== hoverKeyRef.current) {
        hoverKeyRef.current = nextHover;
        setHoverKey(nextHover);
      }
    };
    const onUp = () => {
      const s = dragStateRef.current;
      if (!s) return;
      if (s.started) {
        const landed = hoverKeyRef.current;
        if (landed && landed !== s.key) {
          setStoredOrder((prev) => {
            const list = sanitize(prev);
            const from = list.indexOf(s.key);
            const to = list.indexOf(landed);
            if (from < 0 || to < 0) return prev;
            const next = [...list];
            [next[from], next[to]] = [next[to], next[from]];
            return next;
          });
        }
      }
      endDrag();
    };
    const onCancel = () => endDrag();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [endDrag, setStoredOrder]);

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-4 md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[360px] animate-pulse rounded-2xl bg-[color:var(--line)]/40"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-4 md:px-8">
      <div className="grid auto-rows-[380px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {order.map((key) => {
          const isDragging = dragKey === key;
          const isHover = hoverKey === key && dragKey !== key;
          return (
            <div
              key={key}
              data-widget-cell
              data-widget-key={key}
              className={cn(
                "relative transition-transform duration-200 ease-out",
                isDragging && "opacity-30",
                isHover && "scale-[1.02]",
              )}
            >
              {isHover && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 rounded-[18px] border-2 border-dashed border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                />
              )}
              <WidgetDropTarget
                widgetKey={key}
                enabled={dragEnabled}
                onHandlePointerDown={onHandlePointerDown}
              >
                {WIDGETS[key]()}
              </WidgetDropTarget>
            </div>
          );
        })}
      </div>
      {dragKey && ghostPos && ghostSize && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-50"
          style={{
            transform: `translate(${ghostPos.x}px, ${ghostPos.y}px)`,
            width: ghostSize.w,
            height: ghostSize.h,
          }}
        >
          <div className="h-full w-full scale-[1.02] opacity-90 shadow-2xl">
            {WIDGETS[dragKey]()}
          </div>
        </div>
      )}
    </div>
  );
}

function WidgetDropTarget({
  widgetKey,
  enabled,
  children,
  onHandlePointerDown,
}: {
  widgetKey: WidgetKey;
  enabled: boolean;
  children: React.ReactNode;
  onHandlePointerDown: (
    e: React.PointerEvent<HTMLElement>,
    key: WidgetKey,
  ) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Only wire pointerdown on the drag handle when drag is enabled
    // (lg+ layout). On mobile/tablet, no listener = no accidental drag
    // hijacking during scroll.
    if (!enabled) return;
    const root = ref.current;
    if (!root) return;
    const handles = root.querySelectorAll<HTMLElement>(".drag-handle");
    const listeners: Array<() => void> = [];
    handles.forEach((h) => {
      const fn = (ev: PointerEvent) => {
        onHandlePointerDown(
          ev as unknown as React.PointerEvent<HTMLElement>,
          widgetKey,
        );
      };
      h.addEventListener("pointerdown", fn);
      listeners.push(() => h.removeEventListener("pointerdown", fn));
    });
    return () => listeners.forEach((l) => l());
  }, [widgetKey, onHandlePointerDown, enabled]);
  return (
    <div ref={ref} className="h-full w-full">
      {children}
    </div>
  );
}
