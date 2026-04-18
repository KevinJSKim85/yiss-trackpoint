"use client";

import useSWR from "swr";
import { Leaf } from "lucide-react";
import { WidgetShell } from "./widget-shell";

type AqiPayload = {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  updated: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function band(aqi: number) {
  if (aqi <= 50) return { label: "Good", hex: "#5d7a5a", advice: "Great day to be outside." };
  if (aqi <= 100)
    return { label: "Moderate", hex: "#b8923a", advice: "Sensitive groups, take it slow." };
  if (aqi <= 150)
    return { label: "Unhealthy for SG", hex: "#d58936", advice: "Limit prolonged outdoor exertion." };
  if (aqi <= 200)
    return { label: "Unhealthy", hex: "#9a2b2b", advice: "Mask recommended for all outdoor time." };
  if (aqi <= 300)
    return { label: "Very Unhealthy", hex: "#6b1d3d", advice: "Stay indoors when possible." };
  return { label: "Hazardous", hex: "#3d0d1f", advice: "Avoid all outdoor activity." };
}

export function AirQualityWidget() {
  const { data, isLoading, error } = useSWR<AqiPayload>("/api/aqi", fetcher, {
    refreshInterval: 1000 * 60 * 20,
  });

  const b = data ? band(data.aqi) : null;
  const pct = data ? Math.min(100, (data.aqi / 300) * 100) : 0;

  return (
    <WidgetShell
      title="Air Quality"
      eyebrow="US EPA · Yongsan"
      accent="sage"

    >
      {isLoading && (
        <div className="flex h-full items-center justify-center text-sm text-ink-muted">
          Measuring…
        </div>
      )}
      {error && <p className="text-sm text-ink-muted">Could not load AQI.</p>}
      {data && b && (
        <div className="flex h-full flex-col justify-between gap-3">
          <div>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-semibold leading-none tabular-nums text-ink">
                    {data.aqi}
                  </span>
                  <span className="text-sm font-medium uppercase tracking-wider text-ink-muted">
                    AQI
                  </span>
                </div>
                <p
                  className="mt-1 text-sm font-semibold"
                  style={{ color: b.hex }}
                >
                  {b.label}
                </p>
              </div>
              <div className="rounded-full border border-[color:var(--line-strong)] bg-[color:var(--parchment-soft)] p-3">
                <Leaf className="h-6 w-6" style={{ color: b.hex }} />
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              {b.advice}
            </p>
          </div>

          <div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-[color:var(--line)]">
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, #5d7a5a 0%, #b8923a 33%, #9a2b2b 66%, #3d0d1f 100%)`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-ink-muted">
              <span>0</span>
              <span>100</span>
              <span>200</span>
              <span>300+</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            {[
              { k: "PM2.5", v: data.pm25 },
              { k: "PM10", v: data.pm10 },
              { k: "O₃", v: data.o3 },
              { k: "NO₂", v: data.no2 },
            ].map((m) => (
              <div
                key={m.k}
                className="rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment-soft)]/60 py-1.5"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {m.k}
                </div>
                <div className="text-sm font-semibold tabular-nums text-ink">
                  {Math.round(m.v)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
