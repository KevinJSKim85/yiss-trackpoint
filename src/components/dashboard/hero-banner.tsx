"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Leaf,
  Sun,
  CloudSun,
  Wind,
} from "lucide-react";
import { YissCrest } from "@/components/brand/crest";

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

type AqiPayload = {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  updated: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function weatherIcon(code: number, className = "h-10 w-10") {
  if ([0, 1].includes(code)) return <Sun className={className} />;
  if ([2].includes(code)) return <CloudSun className={className} />;
  if ([3, 45, 48].includes(code)) return <Cloud className={className} />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return <CloudRain className={className} />;
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return <CloudSnow className={className} />;
  return <Cloud className={className} />;
}

function weatherLabel(code: number) {
  if ([0].includes(code)) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if ([3].includes(code)) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Showers";
  return "Cloudy";
}

function aqiBand(aqi: number) {
  if (aqi <= 50)
    return { label: "Good", hex: "#9ec58f", fg: "#0b1e3f" };
  if (aqi <= 100)
    return { label: "Moderate", hex: "#e3c87c", fg: "#3a2a00" };
  if (aqi <= 150)
    return { label: "Unhealthy for SG", hex: "#e09a52", fg: "#2a1300" };
  if (aqi <= 200)
    return { label: "Unhealthy", hex: "#e06a6a", fg: "#2a0000" };
  if (aqi <= 300)
    return { label: "Very Unhealthy", hex: "#b06cbb", fg: "#220027" };
  return { label: "Hazardous", hex: "#8a4a6c", fg: "#1a0010" };
}

export function HeroBanner({ greetingName = "Guardians" }: { greetingName?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const iv = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(iv);
  }, []);

  const { data: weather } = useSWR<WeatherPayload>("/api/weather", fetcher, {
    refreshInterval: 1000 * 60 * 15,
  });
  const { data: aqi } = useSWR<AqiPayload>("/api/aqi", fetcher, {
    refreshInterval: 1000 * 60 * 20,
  });

  const hour = now?.getHours() ?? 8;
  const greeting =
    hour < 5
      ? "Still up"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

  const weekday = now
    ? new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now)
    : "";
  const dateLine = now
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
        .format(now)
        .toUpperCase()
    : "";
  const timeLine = now
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(now)
    : "";

  const aqiInfo = aqi ? aqiBand(aqi.aqi) : null;
  const today = weather?.daily?.[0];

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 pt-5 md:px-8">
      <div className="relative overflow-hidden rounded-[22px] border border-[color:var(--line)] shadow-[var(--shadow-md)]">
        <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr]">
          {/* Left: campus hero */}
          <div className="relative isolate flex min-h-[260px] flex-col justify-between overflow-hidden px-6 py-7 md:min-h-[340px] md:px-10 md:py-9">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(135deg, #0b1e3f 0%, #14315f 45%, #1a3c70 70%, #24508f 100%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                backgroundImage: `
                  radial-gradient(900px 500px at 85% 10%, rgba(184,146,58,0.22), transparent 60%),
                  radial-gradient(700px 400px at 10% 90%, rgba(11,30,63,0.65), transparent 55%)
                `,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(244,239,227,0.8) 1px, transparent 1px), radial-gradient(rgba(244,239,227,0.5) 1px, transparent 1px)",
                backgroundSize: "28px 28px, 13px 13px",
                backgroundPosition: "0 0, 14px 7px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-20 -z-10 opacity-[0.18] blur-[0.5px]"
            >
              <YissCrest size={420} />
            </div>
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 -z-10 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--gold) 40%, var(--gold-soft) 60%, transparent)",
                opacity: 0.7,
              }}
            />

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e3c87c]">
              <span>{greeting}, {greetingName.toUpperCase()}</span>
            </div>

            <div className="mt-6 md:mt-10">
              <h1 className="font-display text-[clamp(3.5rem,9vw,7.5rem)] font-bold leading-[0.9] tracking-tight text-[#f4efe3] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                {weekday.toUpperCase() || " "}
              </h1>
              <p className="mt-3 text-sm font-medium uppercase tracking-[0.22em] text-[#f4efe3]/80">
                {dateLine}
                {timeLine && (
                  <>
                    <span className="mx-2 text-[#e3c87c]/70">·</span>
                    <span className="tabular-nums">{timeLine} KST</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: weather + AQI merged */}
          <div className="relative flex flex-col gap-4 overflow-hidden bg-[#0b1e3f] px-6 py-7 text-[#f4efe3] md:px-8 md:py-9">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(600px 300px at 100% 0%, rgba(184,146,58,0.6), transparent 55%)",
              }}
            />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e3c87c]">
                  Yongsan · Now
                </p>
                {weather ? (
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-[clamp(3.25rem,7vw,5.5rem)] font-bold leading-none tabular-nums">
                      {Math.round(weather.current.t)}
                    </span>
                    <span className="font-display text-2xl text-[#f4efe3]/70">
                      °C
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 h-14 w-32 animate-pulse rounded bg-white/10" />
                )}
                {weather && (
                  <p className="mt-1 text-sm font-medium text-[#f4efe3]/80">
                    {weatherLabel(weather.current.code)}
                  </p>
                )}
              </div>
              <div className="text-[#e3c87c]">
                {weather ? (
                  weatherIcon(weather.current.code, "h-14 w-14 md:h-16 md:w-16")
                ) : (
                  <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
                )}
              </div>
            </div>

            <div className="relative h-px bg-[#b8923a]/30" />

            <div className="relative grid grid-cols-3 gap-2">
              <Stat
                label="Feels"
                value={
                  weather ? `${Math.round(weather.current.feels)}°` : "—"
                }
              />
              <Stat
                label="Wind"
                value={
                  weather ? (
                    <span className="inline-flex items-baseline gap-1">
                      {Math.round(weather.current.wind)}
                      <span className="text-xs font-normal text-[#f4efe3]/60">
                        km/h
                      </span>
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <Stat
                label="H / L"
                value={
                  today
                    ? `${Math.round(today.max)}° / ${Math.round(today.min)}°`
                    : "—"
                }
              />
            </div>

            <div
              className="relative mt-1 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
              aria-label="Air quality"
            >
              <div
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full"
                style={{
                  background: aqiInfo?.hex ?? "rgba(255,255,255,0.1)",
                  color: aqiInfo?.fg ?? "var(--parchment)",
                }}
              >
                <Leaf className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f4efe3]/60">
                    Air Quality
                  </span>
                  {aqi && (
                    <span className="font-display text-xl font-semibold leading-none tabular-nums text-[#f4efe3]">
                      {aqi.aqi}
                    </span>
                  )}
                  {aqi && (
                    <span
                      className="text-xs font-semibold"
                      style={{ color: aqiInfo?.hex }}
                    >
                      {aqiInfo?.label}
                    </span>
                  )}
                </div>
                {aqi && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, (aqi.aqi / 300) * 100)}%`,
                        background:
                          "linear-gradient(90deg,#9ec58f,#e3c87c 33%,#e06a6a 66%,#8a4a6c)",
                      }}
                    />
                  </div>
                )}
              </div>
              {aqi && (
                <div className="hidden flex-none text-right text-[10px] font-medium uppercase tracking-wider text-[#f4efe3]/55 sm:block">
                  PM2.5 {Math.round(aqi.pm25)} · PM10 {Math.round(aqi.pm10)}
                </div>
              )}
            </div>

            {weather && (
              <div className="relative flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#f4efe3]/45">
                <span className="inline-flex items-center gap-1.5">
                  <Wind className="h-3 w-3" />
                  Open-Meteo
                </span>
                <span>US EPA</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e3c87c]/85">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums text-[#f4efe3]">
        {value}
      </p>
    </div>
  );
}
