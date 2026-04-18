"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { LayoutItem, ResponsiveLayouts } from "react-grid-layout/legacy";
import { useLocalStorage } from "@/lib/storage";
import { WeatherWidget } from "@/components/widgets/weather";
import { AirQualityWidget } from "@/components/widgets/air-quality";
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

const ResponsiveGridLayout = dynamic(
  async () => {
    const mod = await import("react-grid-layout/legacy");
    return mod.WidthProvider(mod.Responsive);
  },
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[260px] animate-pulse rounded-2xl bg-[color:var(--line)]/40"
          />
        ))}
      </div>
    ),
  },
);

type WidgetKey =
  | "weather"
  | "aqi"
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
  weather: () => <WeatherWidget />,
  aqi: () => <AirQualityWidget />,
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

const STANDARD_W = 3;
const STANDARD_H = 8;

function buildLayout(
  order: WidgetKey[],
  cols: number,
  qlSpan: number,
): LayoutItem[] {
  const widgets = order.filter((k) => k !== "quick-links");
  const out: LayoutItem[] = [];
  const perRow = Math.max(1, Math.floor(cols / STANDARD_W));
  widgets.forEach((k, i) => {
    const x = (i % perRow) * STANDARD_W;
    const y = Math.floor(i / perRow) * STANDARD_H;
    out.push({
      i: k,
      x,
      y,
      w: STANDARD_W,
      h: STANDARD_H,
      minW: STANDARD_W,
      minH: STANDARD_H,
      maxW: STANDARD_W,
      maxH: STANDARD_H,
    });
  });
  const lastY = Math.ceil(widgets.length / perRow) * STANDARD_H;
  out.push({
    i: "quick-links",
    x: 0,
    y: lastY,
    w: qlSpan,
    h: STANDARD_H,
    minW: qlSpan,
    minH: STANDARD_H,
    maxW: qlSpan,
    maxH: STANDARD_H,
  });
  return out;
}

const DEFAULT_ORDER: WidgetKey[] = [
  "weather",
  "aqi",
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

function buildMobile(order: WidgetKey[], cols: number): LayoutItem[] {
  // All items full-width (cols wide), uniform height — stacked vertically.
  return order.map((k, i) => ({
    i: k,
    x: 0,
    y: i * STANDARD_H,
    w: cols,
    h: STANDARD_H,
    minW: cols,
    minH: STANDARD_H,
    maxW: cols,
    maxH: STANDARD_H,
  }));
}

function buildUniform(order: WidgetKey[], cols: number): LayoutItem[] {
  // Every panel is exactly STANDARD_W × STANDARD_H. Quick Links is no exception.
  const perRow = Math.max(1, Math.floor(cols / STANDARD_W));
  return order.map((k, i) => ({
    i: k,
    x: (i % perRow) * STANDARD_W,
    y: Math.floor(i / perRow) * STANDARD_H,
    w: STANDARD_W,
    h: STANDARD_H,
    minW: STANDARD_W,
    minH: STANDARD_H,
    maxW: STANDARD_W,
    maxH: STANDARD_H,
  }));
}

const BREAKPOINT_COLS = { lg: 12, md: 12, sm: 6, xs: 2 } as const;
type BP = keyof typeof BREAKPOINT_COLS;

// Re-pack widgets into a top-left-filled grid — like a 바둑판 / go board.
// Sort current positions by (y, x) to preserve the user's dropped order,
// then snap each item to its sequential (x, y) slot with no gaps.
function packBreakpoint(
  bp: BP,
  layout: readonly LayoutItem[],
): LayoutItem[] {
  const cols = BREAKPOINT_COLS[bp];
  const w = bp === "xs" ? cols : STANDARD_W;
  const perRow = Math.max(1, Math.floor(cols / w));
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  return sorted.map((item, i) => ({
    ...item,
    x: (i % perRow) * w,
    y: Math.floor(i / perRow) * STANDARD_H,
    w,
    h: STANDARD_H,
    minW: w,
    minH: STANDARD_H,
    maxW: w,
    maxH: STANDARD_H,
  }));
}

function packAll(layouts: ResponsiveLayouts): ResponsiveLayouts {
  return {
    lg: packBreakpoint("lg", layouts.lg ?? []),
    md: packBreakpoint("md", layouts.md ?? []),
    sm: packBreakpoint("sm", layouts.sm ?? []),
    xs: packBreakpoint("xs", layouts.xs ?? []),
  };
}

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg: buildUniform(DEFAULT_ORDER, 12),
  md: buildUniform(DEFAULT_ORDER, 12),
  sm: buildUniform(DEFAULT_ORDER, 6),
  xs: buildMobile(DEFAULT_ORDER, 2),
};

export function DashboardGrid() {
  const [layouts, setResponsiveLayouts, hydrated] = useLocalStorage<ResponsiveLayouts>(
    "yiss-layouts-v3",
    DEFAULT_LAYOUTS,
  );
  const [mounted, setMounted] = useState(false);
  const [bp, setBp] = useState<BP>("lg");
  useEffect(() => setMounted(true), []);

  // After hydrating from localStorage (or defaults), snap everything to a
  // tight top-left-packed board. Runs once per session.
  const [normalized, setNormalized] = useState(false);
  useEffect(() => {
    if (!hydrated || normalized) return;
    setResponsiveLayouts((prev) => packAll(prev));
    setNormalized(true);
  }, [hydrated, normalized, setResponsiveLayouts]);

  useEffect(() => {
    (window as unknown as { __yissReset?: () => void }).__yissReset = () => {
      try {
        localStorage.removeItem("yiss-layouts-v3");
      } catch {}
      setResponsiveLayouts(DEFAULT_LAYOUTS);
    };
  }, [setResponsiveLayouts]);

  const items = useMemo(() => DEFAULT_ORDER, []);

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 px-5 pb-10 pt-6 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {items.slice(0, 8).map((k) => (
          <div
            key={k}
            className="h-[260px] animate-pulse rounded-2xl bg-[color:var(--line)]/40"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-4 md:px-8">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 720, xs: 0 }}
          cols={BREAKPOINT_COLS}
          rowHeight={32}
          margin={[16, 16]}
          draggableHandle=".drag-handle"
          isDraggable={true}
          isResizable={false}
          compactType="vertical"
          onBreakpointChange={(next) => setBp(next as BP)}
          onDragStop={(newLayout) => {
            const packed = packBreakpoint(bp, newLayout);
            setResponsiveLayouts({
              ...layouts,
              [bp]: packed,
            } as ResponsiveLayouts);
          }}
        >
          {items.map((k) => (
            <div key={k} className="ink-fade">
              {WIDGETS[k]()}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
