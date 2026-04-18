"use client";

import useSWR from "swr";
import { Cloud, CloudRain, CloudSnow, Sun, CloudSun, Wind } from "lucide-react";
import { WidgetShell } from "./widget-shell";

type WeatherPayload = {
  current: {
    t: number;
    feels: number;
    humidity: number;
    wind: number;
    code: number;
    isDay: boolean;
  };
  hourly: { time: string; t: number; code: number }[];
  daily: { date: string; max: number; min: number; code: number }[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function iconFor(code: number, className = "h-5 w-5") {
  if ([0, 1].includes(code)) return <Sun className={className} />;
  if ([2].includes(code)) return <CloudSun className={className} />;
  if ([3, 45, 48].includes(code)) return <Cloud className={className} />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return <CloudRain className={className} />;
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return <CloudSnow className={className} />;
  return <Cloud className={className} />;
}

function labelFor(code: number) {
  if ([0].includes(code)) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if ([3].includes(code)) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Showers";
  return "Clouds";
}

export function WeatherWidget({ editMode }: { editMode?: boolean }) {
  const { data, error, isLoading } = useSWR<WeatherPayload>(
    "/api/weather",
    fetcher,
    { refreshInterval: 1000 * 60 * 15 },
  );

  return (
    <WidgetShell
      title="Seoul Weather"
      eyebrow="Yongsan · Now"
      accent="gold"
      editMode={editMode}
    >
      {isLoading && <Skeleton />}
      {error && <p className="text-sm text-ink-muted">Could not load weather.</p>}
      {data && (
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold tabular-nums leading-none text-ink">
                  {Math.round(data.current.t)}
                </span>
                <span className="font-display text-xl text-ink-muted">°C</span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {labelFor(data.current.code)}
              </p>
              <p className="text-xs text-ink-muted">
                Feels {Math.round(data.current.feels)}° · Humidity{" "}
                {data.current.humidity}%
              </p>
            </div>
            <div className="rounded-full border border-[color:var(--line-strong)] bg-[color:var(--parchment-soft)] p-3 text-gold-ink">
              {iconFor(data.current.code, "h-7 w-7")}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {data.hourly.slice(0, 5).map((h) => {
              const hour = new Date(h.time).getHours();
              return (
                <div
                  key={h.time}
                  className="flex flex-col items-center gap-1 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment-soft)]/60 py-2 text-center"
                >
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                    {hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}
                  </span>
                  <span className="text-ink-soft">{iconFor(h.code, "h-4 w-4")}</span>
                  <span className="text-[11px] font-semibold tabular-nums text-ink">
                    {Math.round(h.t)}°
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[color:var(--line)] pt-2 text-[11px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {Math.round(data.current.wind)} km/h
            </span>
            <span>Open-Meteo</span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}

function Skeleton() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="h-10 w-24 animate-pulse rounded bg-[color:var(--line)]" />
      <div className="h-4 w-32 animate-pulse rounded bg-[color:var(--line)]" />
      <div className="mt-auto grid grid-cols-5 gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded bg-[color:var(--line)]"
          />
        ))}
      </div>
    </div>
  );
}
