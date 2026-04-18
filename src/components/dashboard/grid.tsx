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

const WIDGETS: Record<WidgetKey, (p: { editMode: boolean }) => React.ReactNode> = {
  weather: (p) => <WeatherWidget {...p} />,
  aqi: (p) => <AirQualityWidget {...p} />,
  countdown: (p) => <CountdownWidget {...p} />,
  gmail: (p) => <GmailWidget {...p} />,
  calendar: (p) => <CalendarWidget {...p} />,
  drive: (p) => <DriveWidget {...p} />,
  schoology: (p) => <SchoologyWidget {...p} />,
  powerschool: (p) => <PowerSchoolWidget {...p} />,
  sports: (p) => <SportsWidget {...p} />,
  "ig-yiss": (p) => <InstagramYissWidget {...p} />,
  "ig-yisspn": (p) => <InstagramYisspnWidget {...p} />,
  lunch: (p) => <LunchWidget {...p} />,
  clubs: (p) => <ClubsWidget {...p} />,
  "quick-links": (p) => <QuickLinksBoard {...p} />,
};

const STANDARD_W = 3;
const STANDARD_H = 8;

function buildLayout(order: WidgetKey[], cols: number): LayoutItem[] {
  const widgets = order.filter((k) => k !== "quick-links");
  const out: LayoutItem[] = [];
  const perRow = Math.max(1, Math.floor(cols / STANDARD_W));
  widgets.forEach((k, i) => {
    const x = (i % perRow) * STANDARD_W;
    const y = Math.floor(i / perRow) * STANDARD_H;
    out.push({ i: k, x, y, w: STANDARD_W, h: STANDARD_H, minW: 2, minH: 5 });
  });
  const lastY = Math.ceil(widgets.length / perRow) * STANDARD_H;
  out.push({
    i: "quick-links",
    x: 0,
    y: lastY,
    w: cols,
    h: 5,
    minW: 4,
    minH: 4,
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

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg: buildLayout(DEFAULT_ORDER, 12),
  md: buildLayout(DEFAULT_ORDER, 12),
  sm: (() => {
    const widgets = DEFAULT_ORDER.filter((k) => k !== "quick-links");
    const layout: LayoutItem[] = widgets.map((k, i) => ({
      i: k,
      x: (i % 2) * 3,
      y: Math.floor(i / 2) * STANDARD_H,
      w: 3,
      h: STANDARD_H,
      minW: 2,
      minH: 5,
    }));
    layout.push({
      i: "quick-links",
      x: 0,
      y: Math.ceil(widgets.length / 2) * STANDARD_H,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
    });
    return layout;
  })(),
  xs: (() => {
    const widgets = DEFAULT_ORDER.filter((k) => k !== "quick-links");
    const layout: LayoutItem[] = widgets.map((k, i) => ({
      i: k,
      x: 0,
      y: i * STANDARD_H,
      w: 2,
      h: STANDARD_H,
      minW: 2,
      minH: 5,
    }));
    layout.push({
      i: "quick-links",
      x: 0,
      y: widgets.length * STANDARD_H,
      w: 2,
      h: 8,
      minW: 2,
      minH: 6,
    });
    return layout;
  })(),
};

export function DashboardGrid({ editMode }: { editMode: boolean }) {
  const [layouts, setResponsiveLayouts, hydrated] = useLocalStorage<ResponsiveLayouts>(
    "yiss-layouts-v1",
    DEFAULT_LAYOUTS,
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    (window as unknown as { __yissReset?: () => void }).__yissReset = () => {
      try {
        localStorage.removeItem("yiss-layouts-v1");
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
    <div className={editMode ? "edit-mode" : undefined}>
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-4 md:px-8">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 720, xs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 2 }}
          rowHeight={32}
          margin={[16, 16]}
          draggableHandle=".drag-handle"
          isDraggable={editMode}
          isResizable={editMode}
          compactType="vertical"
          onLayoutChange={(_current, all) => {
            if (editMode) setResponsiveLayouts(all as ResponsiveLayouts);
          }}
        >
          {items.map((k) => (
            <div key={k} className="ink-fade">
              {WIDGETS[k]({ editMode })}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
